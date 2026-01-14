from PIL import Image
import torch
from torchvision import transforms as T


transform = T.Compose(
    [
        T.Resize((224, 224)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)
    
def load_and_preprocess(image_path: str):
    image = Image.open(image_path).convert("RGB")
    return transform(image).unsqueeze(0)
