const STORAGE_KEY = 'stream-console-qr-profiles-v1';

const panelCountEl = document.getElementById('panelCount');
const panelRowsEl = document.getElementById('panelRows');
const statusEl = document.getElementById('status');
const jsonOutputEl = document.getElementById('jsonOutput');
const qrCanvas = document.getElementById('qrCanvas');
const profileNameEl = document.getElementById('profileName');
const profileSelectEl = document.getElementById('profileSelect');

function getStoredProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveStoredProfiles(profiles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

function refreshProfileSelect() {
  const profiles = getStoredProfiles();
  const names = Object.keys(profiles).sort((a, b) => a.localeCompare(b));

  profileSelectEl.innerHTML = '<option value="">Choose a profile</option>';
  names.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    profileSelectEl.appendChild(option);
  });

  if (!profileNameEl.value.trim() && profileSelectEl.options.length > 1) {
    profileSelectEl.value = profileSelectEl.options[1].value;
  }
}

function setFormValues(config = {}) {
  const nextConfig = config && typeof config === 'object' ? config : {};

  document.getElementById('username').value = typeof nextConfig.username === 'string' ? nextConfig.username : '';
  document.getElementById('browserSource1').value = typeof nextConfig.browserSource1 === 'string' ? nextConfig.browserSource1 : '';
  document.getElementById('browserSource2').value = typeof nextConfig.browserSource2 === 'string' ? nextConfig.browserSource2 : '';
  document.getElementById('customPanel1').value = typeof nextConfig.customPanel1 === 'string' ? nextConfig.customPanel1 : '';
  document.getElementById('customPanel2').value = typeof nextConfig.customPanel2 === 'string' ? nextConfig.customPanel2 : '';

  const panelCount = nextConfig.panelCount === 4 ? '4' : '2';
  panelCountEl.value = panelCount;
  renderPanelRows();

  const assignments = Array.isArray(nextConfig.panelAssignments)
    ? nextConfig.panelAssignments
    : ['activity-feed', 'chat'];

  for (let index = 0; index < 4; index += 1) {
    const select = document.getElementById(`panel-${index + 1}`);
    if (!select) continue;
    const value = assignments[index] || (index === 0 ? 'activity-feed' : 'chat');
    select.value = value;
  }
}

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

function saveProfile() {
  const name = profileNameEl.value.trim();
  if (!name) {
    statusEl.textContent = 'Enter a profile name before saving.';
    return;
  }

  const profiles = getStoredProfiles();
  profiles[name] = buildConfig();
  saveStoredProfiles(profiles);
  refreshProfileSelect();
  profileSelectEl.value = name;
  statusEl.textContent = `Saved profile: ${name}`;
}

function loadProfile() {
  const name = profileSelectEl.value;
  if (!name) {
    statusEl.textContent = 'Choose a saved profile to load.';
    return;
  }

  const profiles = getStoredProfiles();
  if (!profiles[name]) {
    statusEl.textContent = 'That profile no longer exists.';
    return;
  }

  profileNameEl.value = name;
  setFormValues(profiles[name]);
  generateQr();
  statusEl.textContent = `Loaded profile: ${name}`;
}

function deleteProfile() {
  const name = profileSelectEl.value;
  if (!name) {
    statusEl.textContent = 'Choose a profile to delete.';
    return;
  }

  const profiles = getStoredProfiles();
  delete profiles[name];
  saveStoredProfiles(profiles);
  refreshProfileSelect();
  profileNameEl.value = '';
  statusEl.textContent = `Deleted profile: ${name}`;
}

function createNewProfile() {
  profileNameEl.value = '';
  profileSelectEl.value = '';
  panelCountEl.value = '2';
  document.getElementById('username').value = '';
  document.getElementById('browserSource1').value = '';
  document.getElementById('browserSource2').value = '';
  document.getElementById('customPanel1').value = '';
  document.getElementById('customPanel2').value = '';
  renderPanelRows();
  generateQr();
  statusEl.textContent = 'Started a new blank profile.';
}

function fillExample() {
  profileNameEl.value = '';
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
document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
document.getElementById('loadProfileBtn').addEventListener('click', loadProfile);
document.getElementById('deleteProfileBtn').addEventListener('click', deleteProfile);
document.getElementById('newProfileBtn').addEventListener('click', createNewProfile);
panelCountEl.addEventListener('change', renderPanelRows);
profileSelectEl.addEventListener('change', () => {
  if (profileSelectEl.value) {
    profileNameEl.value = profileSelectEl.value;
  }
});

refreshProfileSelect();
createNewProfile();
