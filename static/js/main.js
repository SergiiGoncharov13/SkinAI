let cropper;
const imageInput = document.getElementById("imageInput");
const cropModal = document.getElementById("cropModal");
const cropImage = document.getElementById("cropImage");

function openFilePicker() {
  document.getElementById("guideModal").classList.remove("hidden");
}

document.getElementById("guideConfirm").onclick = () => {
  document.getElementById("guideModal").classList.add("hidden");
  imageInput.click();
};


imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    cropImage.src = reader.result;
    cropModal.classList.remove("hidden");

    if (cropper) {
      cropper.destroy();
    }

    cropper = new Cropper(cropImage, {
      aspectRatio: 1,
      viewMode: 1,
      autoCropArea: 0.8,
      background: false,
    });
  };

  reader.readAsDataURL(file);
});

document.getElementById("zoomIn").onclick = () => {
  cropper.zoom(0.1);
};

document.getElementById("zoomOut").onclick = () => {
  cropper.zoom(-0.1);
};

document.getElementById("confirmCrop").onclick = () => {
  const canvas = cropper.getCroppedCanvas({
    width: 224,
    height: 224,
  });

  const croppedImage = canvas.toDataURL("image/jpeg");

  console.log("READY FOR AI:", croppedImage);

  cropModal.classList.add("hidden");

  // send a picture to backend
};