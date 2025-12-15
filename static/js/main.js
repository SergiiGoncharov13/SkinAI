const tryBtn = document.getElementById('trySkinAI');
const instantBtn = document.getElementById('getInstantResult');

[tryBtn, instantBtn].forEach(btn => {
  if (btn) btn.addEventListener('click', openUploadPopup);
});

function openUploadPopup() {
  // Don't open multiple popups
  if (document.getElementById('uploadPopup')) return;

  const popup = document.createElement('div');
  popup.id = 'uploadPopup';
  popup.className = 'popup-overlay';

  popup.innerHTML = `
    <div class="popup-content" role="dialog" aria-modal="true">
      <h2>Upload Your Photo</h2>

      <div id="loader" class="loader" style="display:none;">
        <div class="spinner" aria-hidden="true"></div>
        <p id="loaderText">Uploading your image...</p>
      </div>

      <div id="resultMock" class="result-mock" style="display:none;">
        <h3>Skin Analysis Result</h3>
        <ul>
          <li><strong>Detected Birthmarks:</strong> 2 detected</li>
          <li><strong>Status:</strong> Most appear normal; one requires dermatologist check</li>
          <li><strong>Recommendation:</strong> Keep photo history and consult your doctor if changes occur</li>
        </ul>
      </div>

      <div class="popup-buttons">
        <label for="fileInput" class="custom-file-btn" id="chooseFileLabel">Choose File</label>
        <button id="closePopup" class="close-btn" type="button">Cancel</button>
      </div>

      <input type="file" id="fileInput" accept="image/*" />
    </div>
  `;

  document.body.appendChild(popup);

  const fileInput = document.getElementById('fileInput');
  const loader = document.getElementById('loader');
  const loaderText = document.getElementById('loaderText');
  const resultMock = document.getElementById('resultMock');
  const closeBtn = document.getElementById('closePopup');

  // Start process when file selected
  fileInput.addEventListener('change', () => {
    if (!fileInput.files || !fileInput.files.length) return;

    loader.style.display = 'block';
    resultMock.style.display = 'none';
    loaderText.textContent = 'Uploading your image...';

    // Simulated pipeline (replace with real API calls)
    setTimeout(() => {
      loaderText.textContent = 'Analyzing your image...';
      setTimeout(() => {
        loaderText.textContent = 'Preparing results for you...';
        setTimeout(() => {
          loader.style.display = 'none';
          resultMock.style.display = 'block';
        }, 1400);
      }, 1600);
    }, 900);
  });

  closeBtn.addEventListener('click', () => {
    const el = document.getElementById('uploadPopup');
    if (el) el.remove();
  });
}
