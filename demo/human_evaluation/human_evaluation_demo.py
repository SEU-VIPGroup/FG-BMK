import argparse
import os
import json
from tqdm import tqdm
from transformers import AutoModel, AutoTokenizer, CLIPImageProcessor
from PIL import Image
import torch
import math
import re


def split_list(lst, n):
    """Split a list into n (roughly) equal-sized chunks."""
    chunk_size = math.ceil(len(lst) / n)
    return [lst[i:i+chunk_size] for i in range(0, len(lst), chunk_size)]


def get_chunk(lst, n, k):
    chunks = split_list(lst, n)
    return chunks[k]


def eval_internvl(args):
    # Load InternVL model, tokenizer, and image processor
    model = AutoModel.from_pretrained(
        args.model_path,
        torch_dtype=torch.bfloat16,
        low_cpu_mem_usage=True,
        use_flash_attn=True,
        trust_remote_code=True).eval().cuda()
    
    tokenizer = AutoTokenizer.from_pretrained(args.model_path, trust_remote_code=True, use_fast=False)
    image_processor = CLIPImageProcessor.from_pretrained(args.model_path)

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

            # Load and preprocess image
            image_path = os.path.join(args.image_folder, image_file)
            image = Image.open(image_path).resize((448, 448))
            pixel_values = image_processor(images=image, return_tensors='pt').pixel_values.to(torch.bfloat16).cuda()

            # Generate response
            generation_config = dict(max_new_tokens=1024, do_sample=True)
            response = model.chat(tokenizer, pixel_values, prompt_text, generation_config)

            # Remove the image path and repeated prompt from the response
            response_cleaned = response.replace(prompt_text, "").strip()

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
    parser.add_argument("--model-path", type=str, default="OpenGVLab/InternVL-Chat-V1-1")
    parser.add_argument("--image-folder", type=str, default="")
    parser.add_argument("--question-file", type=str, default="human-oriented/hierarchical_granularity_recognition/cub/species/species_question_choice.jsonl")
    parser.add_argument("--answers-file", type=str, default="./results/cub/species/species_question_choice/1_1.jsonl")
    parser.add_argument("--num-chunks", type=int, default=8)
    parser.add_argument("--chunk-idx", type=int, default=0)
    args = parser.parse_args()

    eval_internvl(args)
