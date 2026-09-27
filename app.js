const STORAGE_KEY = 'stream-console-qr-profiles-v1';
const DEFAULT_PANEL_ASSIGNMENTS = ['activity-feed', 'chat', 'custom-1', 'custom-2'];

const panelCountEl = document.getElementById('panelCount');
const panelRowsEl = document.getElementById('panelRows');
const statusEl = document.getElementById('status');
const jsonOutputEl = document.getElementById('jsonOutput');
const qrCanvas = document.getElementById('qrCanvas');
const profileNameEl = document.getElementById('profileName');
const profileSelectEl = document.getElementById('profileSelect');
let panelAssignmentsState = [...DEFAULT_PANEL_ASSIGNMENTS];

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

  document.getElementById('browserSource1').value = typeof nextConfig.browserSource1 === 'string' ? nextConfig.browserSource1 : '';
  document.getElementById('browserSource2').value = typeof nextConfig.browserSource2 === 'string' ? nextConfig.browserSource2 : '';
  document.getElementById('customPanel1').value = typeof nextConfig.customPanel1 === 'string' ? nextConfig.customPanel1 : '';
  document.getElementById('customPanel2').value = typeof nextConfig.customPanel2 === 'string' ? nextConfig.customPanel2 : '';

  const panelCount = nextConfig.panelCount === 4 ? '4' : '2';
  panelCountEl.value = panelCount;

  const assignments = Array.isArray(nextConfig.panelAssignments)
    ? nextConfig.panelAssignments
    : [...DEFAULT_PANEL_ASSIGNMENTS];

  panelAssignmentsState = Array.from({ length: 4 }, (_, index) => {
    const value = assignments[index];
    return value && ['activity-feed', 'chat', 'custom-1', 'custom-2'].includes(value)
      ? value
      : DEFAULT_PANEL_ASSIGNMENTS[index];
  });

  renderPanelRows();
}

function getPanelAssignments() {
  return { assignments: [...panelAssignmentsState] };
}

function renderPanelRows() {
  const visibleCount = Number(panelCountEl.value) === 4 ? 4 : 2;
  const rows = [];

  for (let index = 0; index < 4; index += 1) {
    const selectedValue = panelAssignmentsState[index] || DEFAULT_PANEL_ASSIGNMENTS[index];
    rows.push(`
      <div class="panel-row${index >= visibleCount ? ' hidden' : ''}">
        <label>Panel ${index + 1}</label>
        <select id="panel-${index + 1}" data-index="${index}">
          <option value="activity-feed" ${selectedValue === 'activity-feed' ? 'selected' : ''}>Twitch Activity Feed</option>
          <option value="chat" ${selectedValue === 'chat' ? 'selected' : ''}>Twitch Chat</option>
          <option value="custom-1" ${selectedValue === 'custom-1' ? 'selected' : ''}>Custom Panel 1</option>
          <option value="custom-2" ${selectedValue === 'custom-2' ? 'selected' : ''}>Custom Panel 2</option>
        </select>
      </div>
    `);
  }
  panelRowsEl.innerHTML = rows.join('');

  panelRowsEl.querySelectorAll('select').forEach((select) => {
    const index = Number(select.dataset.index);
    select.value = panelAssignmentsState[index] || DEFAULT_PANEL_ASSIGNMENTS[index];
    select.addEventListener('change', (event) => {
      const nextValue = event.target.value;
      if (['activity-feed', 'chat', 'custom-1', 'custom-2'].includes(nextValue)) {
        panelAssignmentsState[index] = nextValue;
      }
    });
  });
}

function buildConfig() {
  const config = {
    type: 'stream-console-config',
    version: 1,
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

function getCurrentProfileName() {
  return (profileNameEl.value || profileSelectEl.value || '').trim();
}

function getProfileDirtyState(name) {
  const profiles = getStoredProfiles();
  const saved = name ? profiles[name] : null;
  if (!name) {
    return false;
  }
  return JSON.stringify(saved || null) !== JSON.stringify(buildConfig());
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

function switchToProfile(name) {
  const profiles = getStoredProfiles();
  const profile = profiles[name];

  if (!profile) {
    statusEl.textContent = 'That profile no longer exists.';
    return;
  }

  profileNameEl.value = name;
  profileSelectEl.value = name;
  setFormValues(profile);
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
  document.getElementById('browserSource1').value = '';
  document.getElementById('browserSource2').value = '';
  document.getElementById('customPanel1').value = '';
  document.getElementById('customPanel2').value = '';
  panelAssignmentsState = [...DEFAULT_PANEL_ASSIGNMENTS];
  renderPanelRows();
  generateQr();
  statusEl.textContent = 'Started a new blank profile.';
}

function fillExample() {
  profileNameEl.value = '';
  document.getElementById('panelCount').value = '4';
  document.getElementById('browserSource1').value = 'https://streamlabs.com/widgets/chat-box/your-channel';
  document.getElementById('browserSource2').value = 'https://streamlabs.com/widgets/alert-box/your-channel';
  document.getElementById('customPanel1').value = 'https://example.com/goal-widget';
  document.getElementById('customPanel2').value = 'https://example.com/up-next';
  panelAssignmentsState = [...DEFAULT_PANEL_ASSIGNMENTS];
  panelCountEl.value = '4';
  renderPanelRows();
  generateQr();
}

document.getElementById('copyBtn').addEventListener('click', copyJson);
document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
document.getElementById('deleteProfileBtn').addEventListener('click', deleteProfile);
document.getElementById('newProfileBtn').addEventListener('click', createNewProfile);
panelCountEl.addEventListener('change', () => {
  renderPanelRows();
  generateQr();
});

document.getElementById('browserSource1').addEventListener('input', generateQr);
document.getElementById('browserSource2').addEventListener('input', generateQr);
document.getElementById('customPanel1').addEventListener('input', generateQr);
document.getElementById('customPanel2').addEventListener('input', generateQr);
profileNameEl.addEventListener('input', () => {
  if (profileNameEl.value.trim()) {
    const name = profileNameEl.value.trim();
    const profiles = getStoredProfiles();
    if (profiles[name]) {
      profileSelectEl.value = name;
    }
  }
});
profileSelectEl.addEventListener('change', () => {
  const selectedName = profileSelectEl.value;
  if (!selectedName) {
    return;
  }

  const currentName = getCurrentProfileName();
  const selectedProfile = getStoredProfiles()[selectedName];

  if (selectedName === currentName) {
    return;
  }

  if (currentName && getProfileDirtyState(currentName)) {
    const shouldSave = window.confirm(
      `Save changes to "${currentName}" before loading "${selectedName}"?\n\nChoose OK to keep the current profile open and save manually, or Cancel to continue loading the new profile.`
    );

    if (shouldSave) {
      profileSelectEl.value = currentName;
      profileNameEl.value = currentName;
      statusEl.textContent = 'Profile switch canceled. Save the current profile manually before changing profiles.';
      return;
    }
  }

  switchToProfile(selectedName);
});

refreshProfileSelect();
createNewProfile();
