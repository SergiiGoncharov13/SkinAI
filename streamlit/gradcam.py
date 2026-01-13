from pytorch_grad_cam.utils.image import show_cam_on_image

# Target layer for Grad-CAM
def get_target_layer(model):
    """Get the target layer for Grad-CAM based on the model architecture."""
    # ResNet
    if hasattr(model, 'layer4'):
        return model.layer4[-1]
    # EfficientNet
    elif hasattr(model, 'conv_head'):
        return model.conv_head
    # ConvNeXt
    elif hasattr(model, 'stages'):
        return model.stages[-1].blocks[-1]
    else:
        print('Unknown architecture')


# Compute and return Grad-CAM image
def generate_cam(cam, model_input):
    """Generate Grad-CAM image for a given input."""
    grayscale_cam = cam(input_tensor=model_input)[0]
    img = model_input[0].permute(1, 2, 0).cpu().numpy()
    img = (img - img.min()) / (img.max() - img.min())
    cam_img = show_cam_on_image(img, grayscale_cam, use_rgb=True)
    return cam_img