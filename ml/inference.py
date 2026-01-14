import torch
from PIL import Image
from torchvision import transforms

from ml.model_loader import model, DEVICE

CLASSES = ['melanoma', 'nevus', 'benign_keratosis']

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def analyze_image(file):
    image = Image.open(file).convert("RGB")
    x = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(x)
        probs = torch.softmax(logits, dim=1)[0]

    pred_idx = probs.argmax().item()

    return {
        "prediction": CLASSES[pred_idx],
        "probabilities": {
            cls: float(probs[i]) for i, cls in enumerate(CLASSES)
        },
        "recommendation": (
            "Рекомендується звернутися до дерматолога"
            if CLASSES[pred_idx] == "melanoma"
            else "Ймовірно безпечне утворення, рекомендовано спостереження"
        )
    }
