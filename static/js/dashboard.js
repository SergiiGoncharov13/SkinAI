// ================== STATE ==================
let cropper = null;
let originalFile = null;

// ================== DOM ==================
const imageInput = document.getElementById("imageInput");
const guideModal = document.getElementById("guideModal");
const guideConfirmBtn = document.getElementById("guideConfirm");

const cropModal = document.getElementById("cropModal");
const cropImage = document.getElementById("cropImage");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");
const confirmCropBtn = document.getElementById("confirmCrop");
const skipCropBtn = document.getElementById("skipCrop");

const uploadBtn = document.getElementById("uploadBtn");
const imageTagEl = document.getElementById("imageTag");

// Result DOM
const resultBlock = document.getElementById("resultBlock"); // wrapper card
const loadingBlock = document.getElementById("resultLoading"); // loading area
const contentBlock = document.getElementById("resultContent"); // actual result content
const badgeEl = document.getElementById("aiBadge");
const textEl = document.getElementById("aiText");
const probsEl = document.getElementById("aiProbs");

// History DOM
const historyListEl = document.getElementById("historyList");
const historyEmptyEl = document.getElementById("historyEmpty");
const historyCountEl = document.getElementById("historyCount");

// ================== HELPERS ==================
function safeEl(el) {
  return el !== null && typeof el !== "undefined";
}

function showElement(el) {
  if (!safeEl(el)) return;
  el.classList.remove("hidden");
}
function hideElement(el) {
  if (!safeEl(el)) return;
  el.classList.add("hidden");
}

// ================== FILE PICKER UI ==================
function openFilePicker() {
  // show guide modal; guideConfirm will trigger file input click
  showElement(guideModal);
}
if (uploadBtn) {
  uploadBtn.addEventListener("click", openFilePicker);
}

// guideConfirm -> hide guide + open file picker
if (guideConfirmBtn) {
  guideConfirmBtn.addEventListener("click", () => {
    hideElement(guideModal);
    if (imageInput) imageInput.click();
  });
}

function resetUpload() {
  cropModal.classList.add("hidden");

  if (cropper) {
    cropper.destroy();
    cropper = null;
  }

  originalFile = null;
  imageInput.value = "";

  const tagInput = document.getElementById("imageTag");
  if (tagInput) tagInput.value = "";

  if (resultBlock) {
    resultBlock.classList.add("hidden");
    resultBlock.classList.remove("result-show");
  }

  if (resultLoading) {
    resultLoading.classList.add("hidden");
  }
}

// ================== FILE SELECT ==================
if (imageInput) {
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    originalFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      cropImage.src = reader.result;
      showElement(cropModal);

      if (cropper) {
        try {
          cropper.destroy();
        } catch {}
        cropper = null;
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
}

// ================== CROP CONTROLS ==================
if (zoomInBtn) zoomInBtn.addEventListener("click", () => cropper?.zoom(0.1));
if (zoomOutBtn) zoomOutBtn.addEventListener("click", () => cropper?.zoom(-0.1));

// confirm crop -> get blob and analyze
if (confirmCropBtn) {
  confirmCropBtn.addEventListener("click", () => {
    if (!cropper) return;
    cropper.getCroppedCanvas().toBlob((blob) => {
      hideElement(cropModal);
      analyzeImage(blob);
    }, "image/jpeg");
  });
}

// skip crop -> analyze original file
if (skipCropBtn) {
  skipCropBtn.addEventListener("click", () => {
    if (!originalFile) return;
    hideElement(cropModal);
    analyzeImage(originalFile);
  });
}

// ================== ANALYZE ==================
async function analyzeImage(file) {
  // UI
  showLoading();

  const formData = new FormData();
  formData.append("image", file);

  // add optional tag
  const tagVal = imageTagEl?.value?.trim();
  if (tagVal) formData.append("tag", tagVal);

  try {
    const res = await fetch("/analyze", { method: "POST", body: formData });

    if (!res.ok) {
      // try to parse error body for dev convenience
      let errText = `${res.status} ${res.statusText}`;
      try {
        errText = await res.text();
      } catch {
        /* ignore */
      }
      throw new Error(`Server returned error: ${errText}`);
    }

    const data = await res.json();

    if (!data || !data.result) throw new Error("Bad response from server");

    renderResult(data.result);

    try {
      await saveHistory({
        prediction: data.result.prediction,
        probabilities: data.result.probabilities,
        tag: tagVal || null,
      });
      await getHistory();
    } catch (err) {
      console.warn("Failed to save history:", err);
    }
  } catch (err) {
    console.error(err);
    showError("Не вдалося виконати аналіз. Спробуйте ще раз.");
  } finally {
    if (imageTagEl) imageTagEl.value = "";
    hideLoading();
  }
}

// ================== RENDER RESULT ==================
function renderResult(result) {
  hideLoading();

  resultContent.classList.remove("hidden");

  aiBadge.innerText = translateClass(result.prediction);
  aiText.innerText = result.recommendation || "";

  aiProbs.innerHTML = "";
  Object.entries(result.probabilities).forEach(([cls, prob]) => {
    const li = document.createElement("li");
    li.innerText = `${translateClass(cls)} — ${(prob * 100).toFixed(1)}%`;
    aiProbs.appendChild(li);
  });

  resultBlock.classList.add("result-show");
}

// ================== UI HELPERS ==================
function showLoading() {
  if (!resultBlock) return;

  resultBlock.classList.remove("hidden");
  resultBlock.classList.remove("result-show");

  loadingBlock.classList.remove("hidden");
  resultContent.classList.add("hidden");
}

function hideLoading() {
  console.log("loadingBlock" + loadingBlock.classList);
  if (!loadingBlock) return;
  loadingBlock.classList.add("hidden");
}

function showError(message = "Сталася помилка") {
  showElement(resultBlock);
  hideElement(loadingBlock);
  showElement(contentBlock);
  if (textEl) textEl.innerText = message;
}

// ================== TRANSLATION ==================
function translateClass(cls) {
  return (
    {
      melanoma: "Меланома (підвищений ризик)",
      nevus: "Невус (родимка)",
      benign_keratosis: "Доброякісне утворення",
    }[cls] ||
    cls ||
    ""
  );
}

// ================== HISTORY ==================
async function getHistory() {
  try {
    const res = await fetch("/api/history");
    if (!res.ok) throw new Error("Failed to fetch history");
    const data = await res.json();
    // expect array
    const items = Array.isArray(data) ? data : data.items || data.data || [];
    renderHistory(items);
  } catch (err) {
    console.warn("getHistory error:", err);
    renderHistory([]);
  }
}

async function saveHistory(payload) {
  // payload: { prediction, probabilities, tag }
  try {
    const res = await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Save history failed: ${res.status} ${txt}`);
    }
    return await res.json();
  } catch (err) {
    console.warn("saveHistory error:", err);
    throw err;
  }
}

function renderHistory(history = []) {
  if (!historyListEl || !historyCountEl || !historyEmptyEl) return;

  historyListEl.innerHTML = "";

  const items = Array.isArray(history) ? history : [];

  historyCountEl.innerText = String(items.length || 0);

  if (!items.length) {
    showElement(historyEmptyEl);
    return;
  } else {
    hideElement(historyEmptyEl);
  }

  items.forEach((item) => {
    const span = document.createElement("span");
    span.className = "history-row";

    // format date safely
    let dateStr = "";
    try {
      dateStr = item.created_at
        ? new Date(item.created_at).toLocaleString("uk-UA")
        : "";
    } catch {
      dateStr = "";
    }

    span.innerHTML = `
    <div class="history-item">
      <div class="history-left">
        <span class="history-dot ${getStatusClass(item.prediction)}"></span>
        <div class="history-text">
          <strong>${translateClass(item.prediction)}</strong>
          <span class="history-tag">${item.tag || "Без опису"}</span>
        </div>
      </div>
      <div class="history-date">
        ${new Date(item.created_at).toLocaleDateString("uk-UA")}
      </div>
    </div>
  `;
    historyListEl.appendChild(span);
  });
}

// small helper to avoid XSS from tag content
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
  // initialize UI state
  hideElement(resultBlock);
  hideElement(loadingBlock);
  hideElement(contentBlock);
  hideElement(cropModal);
  hideElement(guideModal);

  // pre-clear input
  if (imageTagEl) imageTagEl.value = "";

  // load history
  getHistory();
});

document.getElementById("cancelUpload")?.addEventListener("click", () => {
  resetUpload();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !cropModal.classList.contains("hidden")) {
    resetUpload();
  }
});

function getStatusClass(prediction) {
  return (
    {
      melanoma: "risk-high",
      nevus: "risk-low",
      benign_keratosis: "risk-medium",
    }[prediction] || "risk-low"
  );
}
