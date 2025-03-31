import argparse
import os
import json
from tqdm import tqdm
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import math


def split_list(lst, n):
    """Split a list into n (roughly) equal-sized chunks."""
    chunk_size = math.ceil(len(lst) / n)
    return [lst[i:i+chunk_size] for i in range(0, len(lst), chunk_size)]


def get_chunk(lst, n, k):
    chunks = split_list(lst, n)
    return chunks[k]


import re

def eval_qwen(args):
    # Load Qwen model and tokenizer
    tokenizer = AutoTokenizer.from_pretrained(args.model_path, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(args.model_path, device_map="cuda", trust_remote_code=True).eval()

    # Open the JSONL file and read line by line
    with open(args.question_file, "r") as f:
        questions = [json.loads(line.strip()) for line in f if line.strip()]

    # Split data into chunks for distributed processing
    chunk_questions = get_chunk(questions, args.num_chunks, args.chunk_idx)

    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(args.answers_file), exist_ok=True)

    # Open the output file
    with open(args.answers_file, "w") as ans_file:
        for question in tqdm(chunk_questions, total=len(chunk_questions)):
            image_file = question["image"]
            prompt_text = question["text"]
            class_name = question.get("class", "")
            category = question.get("category", "")

            # Format input for Qwen
            query = tokenizer.from_list_format([
                {"image": os.path.join(args.image_folder, image_file)},
                {"text": prompt_text}
            ])
            inputs = tokenizer(query, return_tensors="pt").to(model.device)

            # Generate response
            with torch.inference_mode():
                pred = model.generate(**inputs)
                response = tokenizer.decode(pred.cpu()[0], skip_special_tokens=False)

            # Remove the image path and repeated prompt from the response
            response_cleaned = re.sub(re.escape(os.path.join(args.image_folder, image_file)), "", response)
            response_cleaned = response_cleaned.replace(prompt_text, "").strip()

            # Write output in desired format
            ans_file.write(json.dumps({
                "question_id": question["question_id"],
                "image": image_file,
                "prompt": prompt_text,
                "text": response_cleaned,
                "class": class_name,
                "category": category
            }) + "\n")



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-path", type=str, default="Qwen-VL-Chat")
    parser.add_argument("--image-folder", type=str, default="")
    parser.add_argument("--question-file", type=str, default="/cub/question_options_4_each_1_updated.jsonl")
    parser.add_argument("--answers-file", type=str, default="./results/cub/train_options_4_each_1/1_1.jsonl")
    parser.add_argument("--num-chunks", type=int, default=8)
    parser.add_argument("--chunk-idx", type=int, default=0)
    args = parser.parse_args()

    eval_qwen(args)

