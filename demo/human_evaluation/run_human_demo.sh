set -x


!/usr/bin/env bash
set -x
T=`date +%Y%m%d_%H%M%S`


gpu_list=$(nvidia-smi --query-gpu=index --format=csv,noheader | tr '\n' ',')
gpu_list="${gpu_list%,}"  # 去掉最后一个逗号
export CUDA_VISIBLE_DEVICES="$gpu_list"

gpu_list="${CUDA_VISIBLE_DEVICES:-0}"

IFS=',' read -ra GPULIST <<< "$gpu_list"

CHUNKS=${#GPULIST[@]}

# Iterate over GPUs

for IDX in $(seq 0 $((CHUNKS - 1))); do
    CUDA_VISIBLE_DEVICES=${GPULIST[$IDX]} python human_evaluation_demo.py \
        --model-path OpenGVLab/InternVL-Chat-V1-1 \
        --question-file human-oriented/hierarchical_granularity_recognition/cub/species/species_question_choice.jsonl \
        --image-folder CUB_200_2011-path \
        --answers-file ./results/cub/species/species_question_choice/${CHUNKS}_${IDX}.jsonl \
        --num-chunks $CHUNKS \
        --chunk-idx $IDX &
done

wait

output_file=./results/cub/species/species_question_choice/merge.jsonl

# Ensure the directory exists before trying to write the output file
mkdir -p $(dirname "$output_file")

# Clear out the output file if it exists
> "$output_file"

# Loop through the indices and concatenate each file
for IDX in $(seq 0 $((CHUNKS - 1))); do
    cat ./results/cub/species/species_question_choice/${CHUNKS}_${IDX}.jsonl >> "$output_file"
done



