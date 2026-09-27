const moduleNameMap = {
  "activity-feed": "Twitch Activity Feed",
  "chat": "Twitch Chat",
  "custom-1": "Custom 1",
  "custom-2": "Custom 2",
};

const panelCountEl = document.getElementById('panelCount');
const panelRowsEl = document.getElementById('panelRows');
const statusEl = document.getElementById('status');
const jsonOutputEl = document.getElementById('jsonOutput');
const qrCanvas = document.getElementById('qrCanvas');

function getPanelAssignments() {
  const assignments = [];
  for (let index = 0; index < 4; index += 1) {
    const select = document.getElementById(`panel-${index + 1}`);
    assignments.push(select ? select.value : 'activity-feed');
  }
  return { assignments };
}

function renderPanelRows() {
  const rows = [];
  for (let index = 0; index < 4; index += 1) {
    rows.push(`
      <div class="panel-row">
        <label>Panel ${index + 1}</label>
        <select id="panel-${index + 1}">
          <option value="activity-feed">Twitch Activity Feed</option>
          <option value="chat">Twitch Chat</option>
          <option value="custom-1">Custom 1</option>
          <option value="custom-2">Custom 2</option>
        </select>
      </div>
    `);
  }
  panelRowsEl.innerHTML = rows.join('');

  const firstTwo = ['activity-feed', 'chat'];
  const firstFour = ['activity-feed', 'chat', 'custom-1', 'custom-2'];
  const defaults = Number(panelCountEl.value) === 4 ? firstFour : firstTwo;

  defaults.forEach((value, index) => {
    const select = document.getElementById(`panel-${index + 1}`);
    if (select) {
      select.value = value;
    }
  });
}

function buildConfig() {
  const config = {
    type: 'stream-console-config',
    version: 1,
    username: document.getElementById('username').value.trim(),
    panelCount: Number(panelCountEl.value) === 4 ? 4 : 2,
    panelAssignments: getPanelAssignments().assignments,
    browserSource1: document.getElementById('browserSource1').value.trim(),
    browserSource2: document.getElementById('browserSource2').value.trim(),
    customPanel1: document.getElementById('customPanel1').value.trim(),
    customPanel2: document.getElementById('customPanel2').value.trim(),
  };

  return config;
}

function updateJson() {
  const config = buildConfig();
  const json = JSON.stringify(config, null, 2);
  jsonOutputEl.value = json;
  return json;
}

function generateQr() {
  const json = updateJson();
  statusEl.textContent = 'Generating QR code…';

  QRCode.toCanvas(qrCanvas, json, {
    width: 300,
    margin: 2,
    color: { dark: '#0d172a', light: '#ffffff' },
    errorCorrectionLevel: 'M'
  }, function (error) {
    if (error) {
      statusEl.textContent = 'Unable to generate QR code.';
      console.error(error);
      return;
    }
    statusEl.textContent = 'QR code ready to scan.';
  });
}

async function copyJson() {
  const json = updateJson();
  try {
    await navigator.clipboard.writeText(json);
    statusEl.textContent = 'JSON copied to clipboard.';
  } catch (error) {
    statusEl.textContent = 'Clipboard copy unavailable in this browser.';
  }
}

function fillExample() {
  document.getElementById('username').value = 'yourname';
  document.getElementById('panelCount').value = '4';
  document.getElementById('browserSource1').value = 'https://streamlabs.com/widgets/chat-box/your-channel';
  document.getElementById('browserSource2').value = 'https://streamlabs.com/widgets/alert-box/your-channel';
  document.getElementById('customPanel1').value = 'https://example.com/goal-widget';
  document.getElementById('customPanel2').value = 'https://example.com/up-next';
  renderPanelRows();
  const defaults = ['activity-feed', 'chat', 'custom-1', 'custom-2'];
  defaults.forEach((value, index) => {
    const select = document.getElementById(`panel-${index + 1}`);
    if (select) select.value = value;
  });
  generateQr();
}

document.getElementById('generateBtn').addEventListener('click', generateQr);
document.getElementById('copyBtn').addEventListener('click', copyJson);
document.getElementById('fillExampleBtn').addEventListener('click', fillExample);
panelCountEl.addEventListener('change', renderPanelRows);

renderPanelRows();
generateQr();
