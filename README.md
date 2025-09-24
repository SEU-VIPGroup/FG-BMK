# FG-BMK
This repo contains the data and evaluation code for the paper "Benchmarking Large Vision-Language Models on Fine-Grained Image Tasks: A Comprehensive Evaluation".

## 🔔News

- **🔥[2025-02-06]: We have released our FG-BMK benchmark!**

## Introduction

### FG-BMK

FG-BMK is a comprehensive fine-grained evaluation benchmark, which includes **1.01 million questions** and **0.28 million images**, providing a robust test bed for evaluating LVLMs. FG-BMK incorporates two evaluation paradigms: human-oriented and machine-oriented. The human-oriented evaluation employs dialogue-like interactions to assess a model’s ability to understand and respond to fine-grained visual queries in a conversational context. The machine-oriented evaluation focuses on two core fine-grained vision tasks—image retrieval and recognition—to directly measure the feature representation capabilities of LVLMs. Compared with existing efforts which primarily focus on fine-grained classification or with limited questions, FG-BMK enable a comprehensive assessment of LVLMs’ fine-grained feature representation and semantic recognition abilities. Our evaluations of eight open-source LVLMs/VLMs uncover key findings regarding the influence of training paradigms, modality alignment, perturbation susceptibility, and fine-grained category reasoning on task performance.

![Alt text](FG-BMK.png)



# Evaluation Guidelines

## Dataset Preparing

Before running the inference, you need to download the corresponding dataset images. The links to the dataset projects are provided below, and you can download the datasets to any location:

|[FGVC-Aircraft (aircraft)](https://www.robots.ox.ac.uk/~vgg/data/fgvc-aircraft/)|[CUB-200-2011 (cub)](https://www.vision.caltech.edu/datasets/cub_200_2011/)|[DeepFashion (deepfashion)](http://mmlab.ie.cuhk.edu.hk/projects/DeepFashion.html)|
|:-------------|---------------|---------------|
|[Oxford 102 Flower (flowers102)](https://www.robots.ox.ac.uk/~vgg/data/flowers/102/)|[Food-101 (food101)](https://data.vision.ee.ethz.ch/cvl/datasets_extra/food-101/)|[iNat2021 (iNat2021)](https://github.com/visipedia/inat_comp/tree/master/2021)|
|[Products-10K (products10k)](https://products-10k.github.io/challenge.html#downloads)|[SkinCon (skincon)](https://skincon-dataset.github.io/)|[Stanford Car (stanfordcar)](https://www.sighthound.com/products/alpr)
|[Stanford Dog (stanforddog)](http://vision.stanford.edu/aditya86/ImageNetDogs/)|[VegFru (vegfru)](https://github.com/ustc-vim/vegfru)|[Wine (wine)](https://tianchi.aliyun.com/dataset/110147)

For human-oriented evaluations, we have pre-generated questions for each image within the dataset, as detailed in files such as `benchmark/human-oriented/attribute_recognition/cub_attribute_questions.jsonl`.

For machine-oriented evaluations, the dataset categories, along with the corresponding training set `train.csv` and test set `test.csv`, can be found in directories like `benchmark/machine-oriented/aircraft`.

## Enviroment and Checkpoint Preparing

Our evaluation includes eight LVLMs/VLMs. Below, we list the project for each model to assist in configuring the corresponding environment and downloading the relevant checkpoint.

|Model Projects|Checkpoints|
|:-------------|:---------------|
|[InternVL](https://github.com/OpenGVLab/InternVL)|[InternVL-Chat-V1.1](https://huggingface.co/OpenGVLab/InternVL-Chat-V1-1)|
|[LLaVA-1.5](https://github.com/haotian-liu/LLaVA)|[LLaVA-1.5-7B](https://huggingface.co/liuhaotian/llava-v1.5-7b)|
|[Qwen-VL](https://github.com/QwenLM/Qwen-VL)|[Qwen-VL-Chat](https://huggingface.co/Qwen/Qwen-VL-Chat)|
|[BLIP-2](https://github.com/salesforce/LAVIS/tree/main/projects/blip2)|[BLIP-2-FLAN-T5-XL](https://huggingface.co/Salesforce/blip2-flan-t5-xl)|
|[EVA-CLIP](https://github.com/baaivision/EVA/tree/master/EVA-CLIP)|[EVA02_CLIP_L_psz14_s4B](https://huggingface.co/QuanSun/EVA-CLIP/blob/main/EVA02_CLIP_L_psz14_s4B.pt)| 
|[BEiT3](https://github.com/microsoft/unilm/blob/master/beit3/README.md)|[BEiT3-large-itc](https://github.com/addf400/files/releases/download/beit3/beit3_large_itc_patch16_224.pth)|
|[CoCa](https://github.com/mlfoundations/open_clip#fine-tuning-coca)|[CoCa-L](https://github.com/mlfoundations/open_clip#fine-tuning-coca)|
|[DINOv2](https://github.com/facebookresearch/dinov2)|[DINOv2-L](https://dl.fbaipublicfiles.com/dinov2/dinov2_vitl14/dinov2_vitl14_pretrain.pth)| 

## Inference

### Human-oriented Evaluation

To use your own model and provide the final answer, you first need to modify the model loading code in `human_evaluation_demo.py` to adapt it for your specific model. Here is an example of loading **InternVL** model:

```
# Load InternVL model, tokenizer, and image processor
from transformers import AutoModel, AutoTokenizer, CLIPImageProcessor
model = AutoModel.from_pretrained(
args.model_path,
torch_dtype=torch.bfloat16,
low_cpu_mem_usage=True,
use_flash_attn=True,
trust_remote_code=True).eval().cuda()
tokenizer = AutoTokenizer.from_pretrained(args.model_path, trust_remote_code=True, use_fast=False)
image_processor = CLIPImageProcessor.from_pretrained(args.model_path)
```

Then, the model answers the questions based on its inference code like:

```
# Load images
image = Image.open(image_path).resize((448, 448))
pixel_values = image_processor(images=image, return_tensors='pt').pixel_values.to(torch.bfloat16).cuda()
# Generate response
generation_config = dict(max_new_tokens=1024, do_sample=True)
response = model.chat(tokenizer, pixel_values, prompt_text, generation_config)
```

After modifying the model loading code, we need to configure the **model-path** (checkpoint), **question-file**, **image-folder** (path to where the dataset is stored), and **answers-file** (output path) in `run_human_demo.sh` and run the demo by:

```bash
bash run_human_demo.sh
# The code splits the question file based on the number of GPUs and runs inference concurrently.
```

The outputs will be merged into one file in the following format:

```
{"question_id": 1, "image": "images/001.Black_footed_Albatross/Black_Footed_Albatross_0078_796126.jpg", "prompt": "Is the genus of the object geococcyx? Answer with yes or no.", "text": "No", "class": "no", "category": "generic"}
{"question_id": 2, "image": "images/001.Black_footed_Albatross/Black_Footed_Albatross_0003_796136.jpg", "prompt": "Is the genus of the object raven? Answer with yes or no.", "text": "No", "class": "no", "category": "generic"}
```

Finally, use `answer_acc.py` to calculate the accuracy of the model's answers.

```bash
python answer_acc.py
```

Please refer to [example output](https://github.com/MrPetrichor/FG-BMK/blob/main/demo/human_evaluation/example_output.jsonl) for a detailed prediction file form. We also provide inference code for **Qwen-VL** and **BLIP-2** as references.

### Machine-oriented Evaluation 

To evaluate the LVLM's feature representation ability, you first need to modify the feature extraction code in `models.py`. Here is an example of CoCa feature extraction code:

```
def coca(model_name, pretrained, cache_dir):
    from open_clip import create_model_and_transforms
    
    def _hook(self, _, input, output):
        self.feat.append(output.transpose(0, 1))
    
    def get_intermediate_layers(self, x, n=1, return_class_token=True):
        self.feat = []
        self(x)
        class_tokens = [out[:, 0] for out in self.feat]
        outputs = [out[:, 1:] for out in self.feat]
        return tuple(zip(outputs, class_tokens))
    
    model, _, preprocess = create_model_and_transforms(model_name, pretrained, cache_dir=cache_dir)
    model = model.visual
    model.eval()
    model.cuda()
    model.__class__._hook = _hook
    model.__class__.get_intermediate_layers = get_intermediate_layers
    model.transformer.resblocks[-2].register_forward_hook(model._hook)
    model.transformer.resblocks[-1].register_forward_hook(model._hook)
    return model
```

In this module, we use the **_hook** and the defined **get_intermediate_layers** method to extract the visual features from the last two layers of the vision encoder. We then concatenate the **cls token** and **image tokens** in the predefined order and return an instance of the **CoCa model**. Examples of visual feature extraction using **EVA-CLIP** and **Qwen-VL** are already provided in `model.py`.

Once you've made the modifications, simply import the model in `eval_linear.py` or `eval_retrieval.py` by:

```
from dinov2.utils.config import setup
from models import coca
torch.backends.cudnn.benchmark = True
model = coca('coca_ViT-L-14', 'laion2b_s13b_b90k', '.cache')
config = setup(args)
autocast_dtype = torch.float16
```

 Then run the demo by executing:

```bash
python  eval_linear.py
or
python  eval_retrieval.py
```
The outputs log will be like:
```
I20240504 13:34:23 16157 dinov2 helpers.py:103] Training  [    0/10000]  eta: 8:13:21  loss: 143.1147 (143.1147)  lr: 0.0005 (0.0005)  time: 2.960182  data: 2.449736  max mem: 2711
...
```

After complete training process, the code will automatically inference on the test test of the fine-grained dataset and give the results.





