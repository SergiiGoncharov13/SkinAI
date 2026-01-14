import torch
from ml.model import NevusModel

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available()
    else "mps" if torch.backends.mps.is_available()
    else "cpu"
)

model = NevusModel(backbone="efficientnet_b0", num_classes=3)

state = torch.load("ml/EfficientNet.pth", map_location=DEVICE)
model.load_state_dict(state)

model.to(DEVICE)
model.eval()
