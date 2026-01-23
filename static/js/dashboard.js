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

// Appointment DOM
const appointmentModal = document.getElementById("appointmentModal");
const appointmentDate = document.getElementById("appointmentDate");
const timeSelect = document.getElementById("appointmentTime");
const cancelAppointment = document.getElementById("cancelAppointment");
const confirmAppointment = document.getElementById("confirmAppointment");
const appointmentSpinner = document.getElementById("appointmentSpinner");
const branchSelect = document.getElementById("branchSelect");
const clinicSelect = document.getElementById("clinicSelect");
const citySelect = document.getElementById("citySelect");
const doctorSelect = document.getElementById("doctorSelect");

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

    const openAppointmentBtn = document.getElementById("openAppointmentBtn");
    openAppointmentBtn?.addEventListener("click", () => {
      showElement(appointmentModal);
    });

    try {
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

// ================== CREATE AN APPOINTMENT ==================
appointmentDate?.addEventListener("change", () => {
  timeSelect.value = "";
});

if (appointmentDate) {
  const today = new Date();
  appointmentDate.min = today.toISOString().split("T")[0];
}

function generateTimeSlots() {
  timeSelect.innerHTML = '<option value="">— Оберіть час —</option>';

  for (let hour = 9; hour <= 18; hour++) {
    ["00", "30"].forEach((min) => {
      const time = `${String(hour).padStart(2, "0")}:${min}`;
      const option = document.createElement("option");
      option.value = time;
      option.innerText = time;
      timeSelect.appendChild(option);
    });
  }
}

const clinicBranches = {
  Добробут: ["вул. Сімʼї Ідзиковських, 3 (Київ)", "пр-т Перемоги, 49 (Київ)"],
  "Oxford Medical": ["вул. Павлівська, 26 (Київ)", "вул. Наукова, 7 (Львів)"],
  "Into-Sana": ["Французький б-р, 42 (Одеса)", "вул. Варненська, 2 (Одеса)"],
};

clinicSelect?.addEventListener("change", () => {
  const clinic = clinicSelect.value;

  branchSelect.innerHTML = '<option value="">— Оберіть філіал —</option>';

  if (!clinicBranches[clinic]) {
    branchSelect.disabled = true;
    return;
  }

  clinicBranches[clinic].forEach((branch) => {
    const option = document.createElement("option");
    option.value = branch;
    option.innerText = branch;
    branchSelect.appendChild(option);
  });

  branchSelect.disabled = false;
});

cancelAppointment?.addEventListener("click", () => {
  hideElement(appointmentModal);
});

confirmAppointment?.addEventListener("click", (e) => {
  e.preventDefault();
  clearErrors();

  let isValid = true;

  if (!citySelect.value) {
    setError(citySelect, "Оберіть місто");
    isValid = false;
  }

  if (!clinicSelect.value) {
    setError(clinicSelect, "Оберіть клініку");
    isValid = false;
  }

  if (!branchSelect.value) {
    setError(branchSelect, "Оберіть філіал");
    isValid = false;
  }

  if (!appointmentDate.value) {
    setError(appointmentDate, "Оберіть дату та час");
    isValid = false;
  }

  if (!timeSelect.value) {
    setError(timeSelect, "Оберіть час прийому");
    isValid = false;
  }

  if (!doctorSelect.value) {
    setError(doctorSelect, "Оберіть спеціаліста");
    isValid = false;
  }

  if (!isValid) return;

  setTimeout(async () => {
    hideElement(appointmentModal);

    showToast("Ваш запис успішно створено");

    const fullDateTime = `${appointmentDate.value}T${timeSelect.value}`;

    try {
      await fetch("/api/doctor-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visit_date: appointmentDate.value,
          notes: `${clinicSelect.value} / ${branchSelect.value} / ${doctorSelect.value}`,
        }),
      });
    } catch (err) {
      console.warn("Failed to save doctor visit:", err);
    }

    addAppointmentToHistory({
      date: fullDateTime,
      doctor: doctorSelect.value,
      clinic: clinicSelect.value,
      branch: branchSelect.value,
    });
  }, 1000);
});

function showToast(message) {
  const toast = document.getElementById("toastSuccess");
  toast.innerText = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

function addAppointmentToHistory({ date, doctor, clinic, branch }) {
  const list = document.getElementById("appointmentsList");

  const empty = list.querySelector(".muted");
  if (empty) empty.remove();

  const item = document.createElement("div");
  item.className = "appointment-item";

  item.innerHTML = `
    <strong>${doctor}</strong>
    <span>${clinic}</span>
    <span>${branch}</span>
    <span>${new Date(date).toLocaleString("uk-UA")}</span>
  `;

  list.appendChild(item);
  clearAppointmentFields();
}

function clearAppointmentFields() {
  appointmentDate.value = "";
  timeSelect.value = "";
  citySelect.value = "";
  clinicSelect.value = "";
  branchSelect.innerHTML = '<option value="">— Оберіть філіал —</option>';
  branchSelect.disabled = true;
  doctorSelect.value = "";
}

async function getDoctorVisits() {
  try {
    const res = await fetch("/api/doctor-visits");
    if (!res.ok) throw new Error("Failed to fetch visits");
    const visits = await res.json();
    renderDoctorVisits(visits);
  } catch (err) {
    console.warn("doctor visits error:", err);
  }
}

function renderDoctorVisits(visits = []) {
  const list = document.getElementById("appointmentsList");
  if (!list) return;

  list.innerHTML = "";

  if (!visits.length) {
    list.innerHTML = `<span class="muted">Записів ще немає</span>`;
    return;
  }

  visits.forEach((v) => {
    const item = document.createElement("div");
    item.className = "appointment-item";

    item.innerHTML = `
      <strong>Візит до лікаря</strong>
      <span>${new Date(v.visit_date).toLocaleString("uk-UA")}</span>
      <span>${v.notes || ""}</span>
    `;

    list.appendChild(item);
  });
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

function clearErrors() {
  document
    .querySelectorAll(".input-error")
    .forEach((el) => el.classList.remove("input-error"));

  document.querySelectorAll(".error-text").forEach((el) => el.remove());
}

function setError(input, message) {
  input.classList.add("input-error");

  const error = document.createElement("div");
  error.className = "error-text";
  error.innerText = message;

  input.parentElement.appendChild(error);
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

  if (imageTagEl) imageTagEl.value = "";

  getHistory();
  generateTimeSlots();
  getDoctorVisits();

  // ===== UX: remove error on change =====
  [
    citySelect,
    clinicSelect,
    branchSelect,
    appointmentDate,
    doctorSelect,
  ].forEach((el) => {
    el?.addEventListener("change", () => {
      el.classList.remove("input-error");
      el.parentElement.querySelector(".error-text")?.remove();
    });
  });
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
