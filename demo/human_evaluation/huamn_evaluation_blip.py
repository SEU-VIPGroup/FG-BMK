import argparse
import os
import json
from tqdm import tqdm
import torch
from PIL import Image
import re
import sys

from lavis.models import load_model_and_preprocess
import math


def split_list(lst, n):
    """Split a list into n (roughly) equal-sized chunks."""
    chunk_size = math.ceil(len(lst) / n)
    return [lst[i:i+chunk_size] for i in range(0, len(lst), chunk_size)]


def get_chunk(lst, n, k):
    chunks = split_list(lst, n)
    return chunks[k]


def eval_blip2(args):
    # 选择设备（支持多 GPU）
    device = "cuda" if torch.cuda.is_available() else "cpu"

    # 加载 BLIP-2 模型及预处理
    model, vis_processors, _ = load_model_and_preprocess(
        name="blip2_t5", model_type="pretrain_flant5xl", is_eval=True, device=device
    )

    model = model.to(device)

    # 读取 JSONL 文件
    with open(args.question_file, "r") as f:
        questions = [json.loads(line.strip()) for line in f if line.strip()]

    # 划分数据集，支持多进程处理
    chunk_questions = get_chunk(questions, args.num_chunks, args.chunk_idx)

    # 创建输出目录
    os.makedirs(os.path.dirname(args.answers_file), exist_ok=True)

    # 处理并写入输出文件
    with open(args.answers_file, "w") as ans_file:
        for question in tqdm(chunk_questions, total=len(chunk_questions)):
            image_file = question["image"]
            prompt_text = question["text"]
            class_name = question.get("class", "")

            # 读取并处理图片
            image_path = os.path.join(args.image_folder, image_file)
            raw_image = Image.open(image_path).convert("RGB")
            image = vis_processors["eval"](raw_image).unsqueeze(0).to(device)

            # 生成回答
            with torch.no_grad():
                generated_text = model.generate({"image": image, "prompt": prompt_text})

            # 清理输出文本
            response_cleaned = generated_text[0].strip()

            # 写入 JSONL 文件
            ans_file.write(json.dumps({
                "question_id": question["question_id"],
                "image": image_file,
                "prompt": prompt_text,
                "text": response_cleaned,
                "class": class_name
            }) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--image-folder", type=str, default="CUB_200_2011/")
    parser.add_argument("--question-file", type=str, default="hierarchical_granularity_recognition/cub/question_yes_no_half_class.jsonl")
    parser.add_argument("--answers-file", type=str, default="question_yes_no_half_class/${CHUNKS}_${IDX}.jsonl")
    parser.add_argument("--num-chunks", type=int, default=8)
    parser.add_argument("--chunk-idx", type=int, default=0)
    args = parser.parse_args()

    eval_blip2(args)
