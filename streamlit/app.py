import streamlit as st
import torch
from PIL import Image
from pytorch_grad_cam import GradCAM

from config import Config
from gradcam import generate_cam, get_target_layer
from utills import get_device, get_transforms
from model import NevusModel

classes = ['melanoma', 'nevus', 'benign_keratosis']

device = get_device()
model = NevusModel(backbone=Config.BACKBONE).to(device)
model_path = Config.STREAMLIT_MODEL

st.set_page_config(page_title="SkinAI", layout="wide")
st.title("Melanoma Detection")
st.write("Upload nevus images for a prediction")

uploaded_image = st.file_uploader("Upload a image", type=['jpg', 'jpeg', 'png'])
if uploaded_image:
    nevus_image = Image.open(uploaded_image).convert("RGB")
    st.image(image=nevus_image, caption="Uploaded a image", width="content")

if uploaded_image:
    if st.button("Run Diagnostic Analysis"):
        with st.spinner("Preprocessing images. and running model..."):
            try:
                checkpoint = torch.load(model_path, map_location=device)
                model.load_state_dict(checkpoint)
                model.eval()
            except Exception as e:
                st.error(f"Error loading model: {e}")
                st.stop()
            
            tf = get_transforms()
            input_nevus = tf(nevus_image).unsqueeze(0).to(device)

            with torch.no_grad():
                logist = model(input_nevus)

            prob = torch.softmax(logist, dim=1)
            idx = torch.argmax(prob, dim=1).item()
            result = classes[idx]
            confidence = prob[0][idx].item()

            # Grad-CAM
            target_layer = get_target_layer(model.backbone_net)
            nevus_cam = GradCAM(
                model=model.backbone_net,
                target_layers=[target_layer]
            )
            nevus_cam_img = generate_cam(nevus_cam, input_nevus)

            # Results
            st.metric("Prediction", result)
            with st.expander("View Logist"):
                st.write(logist.tolist())
            st.image(nevus_cam_img, caption="Nevus Grad-CAM", width="content")
            
            if result == 'melanoma': 
                st.error(f"⚠️ HIGH RISK: {result} detected ({confidence:.2%}). Consult a specialist immediately.")
            elif result == 'benign_keratosis': 
                st.warning(f"⚠️ {result} detected ({confidence:.2%}). Likely benign, but monitor changes.")
            else:
                st.success(f"✅ Normal: {result} detected ({confidence:.2%}).")
