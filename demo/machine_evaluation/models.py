import torch

def eva_clip(model_name, pretrained, cache_dir):
    from eva_clip import create_model_and_transforms
    
    def _hook(self, _, input, output):
        self.feat.append(output)
    
    def get_intermediate_layers(self, x, n=1, return_class_token=True):
        self.feat = []
        self(x)
        class_tokens = [out[:, 0] for out in self.feat]
        outputs = [out[:, 1:] for out in self.feat]
        return tuple(zip(outputs, class_tokens))

    model, _, preprocess = create_model_and_transforms(model_name, pretrained, force_custom_clip=True, cache_dir=cache_dir)
    model = model.visual
    model.eval()
    model.cuda()
    model.__class__._hook = _hook
    model.__class__.get_intermediate_layers = get_intermediate_layers
    model.blocks[-2].register_forward_hook(model._hook)
    model.blocks[-1].register_forward_hook(model._hook)
    return model


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

def Qwen_VL():
    from transformers import AutoModelForCausalLM, AutoTokenizer

    model = AutoModelForCausalLM.from_pretrained("/data1/PycharmProjects/yht/LMFG_yht/checkpoints/Qwen-VL", device_map="cuda", trust_remote_code=True).eval()

    def get_intermediate_layers(self, x, n=1, return_class_token=True):

        self.feat = self.transformer.visual(x)
        outputs=[self.feat]
        res = tuple(zip(outputs))
        return res

    model.__class__.get_intermediate_layers = get_intermediate_layers

    return model

def main():
    #eva_clip('EVA02-CLIP-L-14', 'eva02_clip', '.cache')
    Qwen_VL()
    # coca('coca_ViT-L-14', 'laion2b_s13b_b90k', '.cache')


if __name__ == "__main__":
    main()