import os
import random
from itertools import chain
import numpy as np
from PIL import Image
import torch
from tqdm import tqdm


class Dataset(torch.utils.data.Dataset):
    def __init__(self, root, anno_path, train=True, transform=None):
        super().__init__()
        self.transform = transform

        self.images = []
        self.targets = []
        mx = 0
        with open(os.path.join(anno_path, 'train.csv' if train else 'test.csv')) as f:
            for line in f:
                items = line.strip().split(',')
                if len(items) == 2:
                    path, label = line.strip().split(',')
                else:
                    path = ','.join(items[:-1])
                    label = items[-1]
                label = int(label)
                self.images.append(os.path.join(root, path))
                self.targets.append(label)
                mx = max(mx, label)
        self.num_classes = mx + 1

    def __getitem__(self, index):
        path, target = self.images[index], self.targets[index]
        img = Image.open(path).convert('RGB')
        img = self.transform(img)
        return img, target

    def __len__(self):
        return len(self.images)
    
class Dataset_atr(torch.utils.data.Dataset):
    def __init__(self, root, anno_path, train=True, transform=None):
        super().__init__()
        self.transform = transform

        self.images = []
        self.targets = []
        self.path=[]
        mx = 0
        with open(os.path.join(anno_path, 'train.csv' if train else 'test.csv')) as f:
            for line in f:
                items = line.strip().split(',')
                if len(items) == 2:
                    path, label = line.strip().split(',')
                else:
                    path = ','.join(items[:-1])
                    label = items[-1]
                label = int(label)
                self.images.append(os.path.join(root, path))
                self.targets.append(label)
                self.path.append(path)
                mx = max(mx, label)
        self.num_classes = mx + 1

    def __getitem__(self, index):
        path, target = self.images[index], self.targets[index]
        path_tmp=self.path[index]
        img = Image.open(path).convert('RGB')
        img = self.transform(img)
        return img, target, path_tmp
        # return target, path_tmp

    def __len__(self):
        return len(self.images)


class Dataset2(torch.utils.data.Dataset):
    def __init__(self, root, anno_path, train=True, transform=None):
        super().__init__()
        self.transform = transform

        self.images = []
        self.targets = []
        targets = []
        mx = 0
        
        with open(os.path.join(anno_path, 'train.csv' if train else 'test.csv')) as f:
            for line in f:
                items = line.strip().split(',')
                if len(items) == 2:
                    path, label = line.strip().split(',')
                else:
                    path = ','.join(items[:-1])
                    label = items[-1]
                label = [int(i) for i in label.split(' ')]
                self.images.append(os.path.join(root, path))
                targets.append(label)
                mx = max(mx, max(label))
        self.num_classes = mx + 1
        for labels in targets:
            onehot = [0] * self.num_classes
            for label in labels:
                onehot[label] = 1
            self.targets.append(np.array(onehot))

    def __getitem__(self, index):
        path, target = self.images[index], self.targets[index]
        img = Image.open(path).convert('RGB')
        img = self.transform(img)
        return img, target

    def __len__(self):
        return len(self.images)


class TripletDataset(torch.utils.data.Dataset):
    def __init__(self, root, anno_path, train=True, transform=None, has_known=True, has_unknown=True):
        super().__init__()
        self.transform = transform
        self.train = train
        self.has_known = has_known
        self.has_unknown = has_unknown

        self.images = []
        self.targets = []
        self.onehot = []
        mx = 0
        with open(os.path.join(anno_path, 'train.csv' if train else 'test.csv')) as f:
            for line in f:
                items = line.strip().split(',')
                if len(items) == 2:
                    path, label = line.strip().split(',')
                else:
                    path = ','.join(items[:-1])
                    label = items[-1]
                label = [int(i) for i in label.split(' ')]
                mx = max(mx, max(label))
                labels = []
                if has_known:
                    labels.extend([i for i in label if i % 2 == 0])
                if has_unknown:
                    labels.extend([i for i in label if i % 2 == 1])
                if len(labels) == 0:continue
                self.images.append(os.path.join(root, path))
                self.targets.append(labels)
        print('here ',)
        self.num_classes = mx + 1
        print('here ',self.num_classes)
        # self.num_classes = 301
        # print('here ',self.num_classes)
        
        
        # for labels in self.targets:
        #     onehot = [0] * self.num_classes
        #     for label in labels:
        #         onehot[label] = 1
        #     self.onehot.append(np.array(onehot).astype(np.float32))
        

        # 使用 tqdm 包裹 self.targets，显示进度条
        for idx, labels in enumerate(tqdm(self.targets, desc="Processing labels")):
            # if idx >= 10000:
            #     break  # 当处理到 10000 条数据时停止
        
            onehot = [0] * self.num_classes
            for label in labels:
                onehot[label] = 1
            self.onehot.append(np.array(onehot).astype(np.float32))
        

        self.idx2cls = []
        self.cls2idx = [[] for _ in range(self.num_classes)]
        # for i, js in enumerate(self.targets):
        #     for j in js:
        #         self.idx2cls.append(j)
        #         self.cls2idx[j].append(i)
                
        # 使用 tqdm 包裹 self.targets，显示进度条
        for i, js in enumerate(tqdm(self.targets, desc="Processing targets")):
            # if i >= 10000:
            #         break  # 当处理到 10000 条数据时停止
            for j in js:
                self.idx2cls.append(j)
                self.cls2idx[j].append(i)
        

    def __getitem__(self, index):
        path, target = self.images[index], self.targets[index]
        img = Image.open(path).convert('RGB')
        img = self.transform(img)
        if self.train and not self.has_unknown:
            indexes = set(chain(*[self.cls2idx[i] for i in target]))
            if len(indexes) > 1:indexes.remove(index)
            pos_idx = random.choice(list(indexes))
            pos = Image.open(self.images[pos_idx]).convert('RGB')
            pos = self.transform(pos)
            
            neg_idx = random.randint(0, len(self.images)-1)
            while self.idx2cls[neg_idx] == target:
                neg_idx = random.randint(0, len(self.images))
            neg = Image.open(self.images[neg_idx]).convert('RGB')
            neg = self.transform(neg)
            return img, pos, neg
        return img, self.onehot[index]

    def __len__(self):
        return len(self.images)


class HashDataset(torch.utils.data.Dataset):
    def __init__(self, root, anno_path, train=True, transform=None, num_samples=2000):
        super().__init__()
        self.transform = transform
        self.train = train
        if train:
            self.num_samples = num_samples
            self.sample_index = list(range(num_samples))

        self.images = []
        self.targets = []
        targets = []
        mx = 0
        with open(os.path.join(anno_path, 'train.csv' if train else 'test.csv')) as f:
            for line in f:
                items = line.strip().split(',')
                if len(items) == 2:
                    path, label = line.strip().split(',')
                else:
                    path = ','.join(items[:-1])
                    label = items[-1]
                labels = [int(i) for i in label.split(' ')]
                mx = max(mx, max(labels))
                self.images.append(os.path.join(root, path))
                targets.append(labels)
        self.num_classes = mx + 1
        for labels in targets:
            onehot = [0] * self.num_classes
            for label in labels:
                onehot[label] = 1
            self.targets.append(torch.tensor(onehot, dtype=torch.float32))

    def shuffle(self):
        #indexes = list(range(len(self.images)))
        #random.shuffle(indexes)
        indexes = torch.randperm(len(self.images)).numpy().tolist()
        self.sample_index = indexes[:self.num_samples]

    def __getitem__(self, index):
        idx = self.sample_index[index] if self.train else index
        path, target = self.images[idx], self.targets[idx]
        img = Image.open(path).convert('RGB')
        img = self.transform(img)
        if self.train:
            return img, target, index
        return img, target

    def __len__(self):
        return self.num_samples if self.train else len(self.images)


class SketchDataset(torch.utils.data.Dataset):
    def __init__(self, root, anno_path, train=True, transform=None, has_known=True, has_unknown=True):
        super().__init__()
        self.transform = transform
        self.train = train
        self.has_known = has_known
        self.has_unknown = has_unknown

        self.images = []
        self.targets = []
        self.onehot = []
        mx = 0
        with open(os.path.join(anno_path, 'train.csv' if train else 'test.csv')) as f:
            for line in f:
                items = line.strip().split(',')
                if len(items) == 2:
                    path, label = line.strip().split(',')
                else:
                    path = ','.join(items[:-1])
                    label = items[-1]
                label = [int(i) for i in label.split(' ')]
                mx = max(mx, max(label))
                labels = []
                if has_known:
                    labels.extend([i for i in label if i % 2 == 0])
                if has_unknown:
                    labels.extend([i for i in label if i % 2 == 1])
                if len(labels) == 0:continue
                self.images.append(os.path.join(root, path))
                self.targets.append(labels)
        self.num_classes = mx + 1
        for labels in self.targets:
            onehot = [0] * self.num_classes
            for label in labels:
                onehot[label] = 1
            self.onehot.append(np.array(onehot).astype(np.float32))

        self.idx2cls = []
        self.cls2idx = [[] for _ in range(self.num_classes)]
        for i, js in enumerate(self.targets):
            for j in js:
                self.idx2cls.append(j)
                self.cls2idx[j].append(i)