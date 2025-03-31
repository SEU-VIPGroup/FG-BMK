# Copyright (c) Meta Platforms, Inc. and affiliates.
# All rights reserved.
#
# This source code is licensed under the license found in the
# LICENSE file in the root directory of this source tree.

from enum import Enum
import logging
from typing import Any, Dict, Optional
from abc import ABC

import torch
from torch import Tensor
import torch.nn.functional as F
from torchmetrics import Metric, MetricCollection
from torchmetrics.classification import MulticlassAccuracy, MultilabelAUROC, MulticlassRecall, MultilabelRecall
from torchmetrics.utilities.data import dim_zero_cat, select_topk


logger = logging.getLogger("dinov2")


class Recall(MulticlassRecall):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def update(self, preds: Tensor, target: Tensor) -> None:
        if self.top_k > 1:
            onehot = torch.zeros_like(target, dtype=torch.int)
            onehot = onehot.scatter(1, preds.topk(self.top_k, 1).indices, 1)
        else:
            onehot = F.one_hot(preds.argmax(1), num_classes=self.num_classes)
        tp = ((target == onehot) & (target == 1)).sum(0)
        fn = ((target != onehot) & (target == 1)).sum(0)
        fp = ((target != onehot) & (target == 0)).sum(0)
        tn = ((target == onehot) & (target == 0)).sum(0)
        self._update_state(tp, fp, tn, fn)


class MAP(Metric, ABC):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.sum_AP = 0
        self.num_query = 0

    def update(self, query_code: Tensor,
               database_code: Tensor,
               query_labels: Tensor,
               database_labels: Tensor) -> None:
        for i in range(query_code.size(0)):
            # Retrieve images from database
            retrieval = (query_labels[i, :] @ database_labels.t() > 1e-3).float()

            # Calculate hamming distance
            hamming_dist = 0.5 * (database_code.shape[1] -
                                  query_code[i, :] @ database_code.t())
            index = torch.argsort(hamming_dist)

            # Arrange position according to hamming distance
            retrieval = retrieval[index]

            # Retrieval count
            retrieval_cnt = retrieval.sum().int().item()

            # Can not retrieve images
            if retrieval_cnt == 0:
                continue

            # Generate score for every position
            score = torch.linspace(1, retrieval_cnt, retrieval_cnt,
                                   device=query_code.device)

            # Acquire index
            index = (torch.nonzero(retrieval == 1).squeeze() + 1.0).float()

            self.sum_AP += (score / index).mean()
            self.num_query += 1

    def compute(self) -> Tensor:
        return self.sum_AP / self.num_query


class MetricType(Enum):
    MEAN_ACCURACY = "mean_accuracy"
    MEAN_PER_CLASS_ACCURACY = "mean_per_class_accuracy"
    PER_CLASS_ACCURACY = "per_class_accuracy"
    IMAGENET_REAL_ACCURACY = "imagenet_real_accuracy"
    MULTILABEL_AUROC = "multi_label_auroc"
    MULTILABEL_RECALL = "multi_label_recall"
    MAP = "map"

    @property
    def accuracy_averaging(self):
        return getattr(AccuracyAveraging, self.name, None)

    def __str__(self):
        return self.value


class AccuracyAveraging(Enum):
    MEAN_ACCURACY = "micro"
    MEAN_PER_CLASS_ACCURACY = "macro"
    PER_CLASS_ACCURACY = "none"
    MULTILABEL_AUROC = "micro"
    MULTILABEL_RECALL = "macro"

    def __str__(self):
        return self.value


def build_metric(metric_type: MetricType, *, num_classes: int, ks: Optional[tuple] = None):
    if metric_type.accuracy_averaging is not None:
        if metric_type == MetricType.MULTILABEL_AUROC:
            return build_auroc_metric(
                average_type=metric_type.accuracy_averaging,
                num_classes=num_classes
            )
        elif metric_type == MetricType.MEAN_ACCURACY:
            return build_topk_accuracy_metric(
                average_type=metric_type.accuracy_averaging,
                num_classes=num_classes,
                ks=(1, 5) if ks is None else ks,
            )
        elif metric_type == MetricType.MULTILABEL_RECALL:
            return build_recall_metric(
                average_type=metric_type.accuracy_averaging,
                num_classes=num_classes,
                ks=(1, 10) if ks is None else ks,
            )
    elif metric_type == MetricType.IMAGENET_REAL_ACCURACY:
        return build_topk_imagenet_real_accuracy_metric(
            num_classes=num_classes,
            ks=(1, 10) if ks is None else ks,
        )
    elif metric_type == MetricType.MAP:
        return build_map_metric()

    raise ValueError(f"Unknown metric type {metric_type}")


def build_topk_accuracy_metric(average_type: AccuracyAveraging, num_classes: int, ks: tuple = (1, 5)):
    metrics: Dict[str, Metric] = {
        f"top-{k}": MulticlassAccuracy(top_k=k, num_classes=int(num_classes), average=average_type.value) for k in ks
    }
    return MetricCollection(metrics)


def build_auroc_metric(average_type: AccuracyAveraging, num_classes: int):
    metrics: Dict[str, Metric] = {
        f"auroc": MultilabelAUROC(num_labels=int(num_classes), average=average_type.value)
    }
    return MetricCollection(metrics)


def build_recall_metric(average_type: AccuracyAveraging, num_classes: int, ks: tuple = (1, 10)):
    metrics: Dict[str, Metric] = {
        f"recall@{k}": Recall(top_k=k, num_classes=num_classes, average=average_type.value) for k in ks
    }
    return MetricCollection(metrics)


def build_map_metric():
    metrics: Dict[str, Metric] = {
        f"map": MAP()
    }
    return MetricCollection(metrics)


def build_topk_imagenet_real_accuracy_metric(num_classes: int, ks: tuple = (1, 5)):
    metrics: Dict[str, Metric] = {f"top-{k}": ImageNetReaLAccuracy(top_k=k, num_classes=int(num_classes)) for k in ks}
    return MetricCollection(metrics)


class ImageNetReaLAccuracy(Metric):
    is_differentiable: bool = False
    higher_is_better: Optional[bool] = None
    full_state_update: bool = False

    def __init__(
        self,
        num_classes: int,
        top_k: int = 1,
        **kwargs: Any,
    ) -> None:
        super().__init__(**kwargs)
        self.num_classes = num_classes
        self.top_k = top_k
        self.add_state("tp", [], dist_reduce_fx="cat")

    def update(self, preds: Tensor, target: Tensor) -> None:  # type: ignore
        # preds [B, D]
        # target [B, A]
        # preds_oh [B, D] with 0 and 1
        # select top K highest probabilities, use one hot representation
        preds_oh = select_topk(preds, self.top_k)
        # target_oh [B, D + 1] with 0 and 1
        target_oh = torch.zeros((preds_oh.shape[0], preds_oh.shape[1] + 1), device=target.device, dtype=torch.int32)
        target = target.long()
        # for undefined targets (-1) use a fake value `num_classes`
        target[target == -1] = self.num_classes
        # fill targets, use one hot representation
        target_oh.scatter_(1, target, 1)
        # target_oh [B, D] (remove the fake target at index `num_classes`)
        target_oh = target_oh[:, :-1]
        # tp [B] with 0 and 1
        tp = (preds_oh * target_oh == 1).sum(dim=1)
        # at least one match between prediction and target
        tp.clip_(max=1)
        # ignore instances where no targets are defined
        mask = target_oh.sum(dim=1) > 0
        tp = tp[mask]
        self.tp.append(tp)  # type: ignore

    def compute(self) -> Tensor:
        tp = dim_zero_cat(self.tp)  # type: ignore
        return tp.float().mean()
