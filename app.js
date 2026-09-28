/* global QRCode */

const STORAGE_KEY = 'stream-console-qr-profiles-v1';
const DEFAULT_PANEL_ASSIGNMENTS = ['activity-feed', 'chat', 'custom', 'custom'];

const PANEL_OPTIONS = [
  { value: 'activity-feed', label: 'Activity Feed', icon: 'bell-outline', category: 'stream' },
  { value: 'chat', label: 'Chat', icon: 'message-outline', category: 'stream' },
  { value: 'stream-info', label: 'Stream Info', icon: 'pencil-box-outline', category: 'stream' },
  { value: 'stream-preview', label: 'Stream Preview', icon: 'play-circle-outline', category: 'stream' },
  { value: 'stream-health', label: 'Stream Health', icon: 'heart-pulse', category: 'stream' },
  { value: 'automod-queue', label: 'AutoMod Queue', icon: 'shield-alert-outline', category: 'moderation' },
  { value: 'moderation-actions', label: 'Mod Actions', icon: 'gavel', category: 'moderation' },
  { value: 'reward-queue', label: 'Reward Queue', icon: 'gift-outline', category: 'engagement' },
  { value: 'polls', label: 'Polls', icon: 'poll', category: 'engagement' },
  { value: 'predictions', label: 'Predictions', icon: 'crystal-ball', category: 'engagement' },
  { value: 'custom', label: 'Custom URL', icon: 'link-variant', category: 'custom' },
];

const VALID_PANEL_ASSIGNMENTS = PANEL_OPTIONS.map((option) => option.value);

const ICONS = {
  'bell-outline':
    '<svg viewBox="0 0 24 24"><path d="M12 2A2 2 0 0 0 10 4A8 8 0 0 0 4 12V17L2 19V20H22V19L20 17V12A8 8 0 0 0 14 4A2 2 0 0 0 12 2M12 6A6 6 0 0 1 18 12V18H6V12A6 6 0 0 1 12 6M10 21A2 2 0 0 0 12 23A2 2 0 0 0 14 21Z"/></svg>',
  'message-outline':
    '<svg viewBox="0 0 24 24"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2M20 16H6L4 18V4H20V16Z"/></svg>',
  'pencil-box-outline':
    '<svg viewBox="0 0 24 24"><path d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.89 20.1 3 19 3M19 19H5V5H19V19M16.7 9.35L15.7 8.35L7 17.06V18.06H8L16.7 9.35M14.7 7.35L13.7 6.35L12.3 7.75L13.3 8.75L14.7 7.35Z"/></svg>',
  'play-circle-outline':
    '<svg viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12A10 10 0 0 0 12 22A10 10 0 0 0 22 12A10 10 0 0 0 12 2M12 20A8 8 0 0 1 4 12A8 8 0 0 1 12 4A8 8 0 0 1 20 12A8 8 0 0 1 12 20M10 16.5L16 12L10 7.5V16.5Z"/></svg>',
  'heart-pulse':
    '<svg viewBox="0 0 24 24"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35M11.1 14.6L12.9 11L14.7 14.6H17V13.1H15.5L13.7 9.5H12.1L10.3 13.1H8.5V14.6H11.1Z"/></svg>',
  'shield-alert-outline':
    '<svg viewBox="0 0 24 24"><path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2M12 4.15L18 6.4V11.09C18 15.03 15.44 18.68 12 19.78C8.56 18.68 6 15.03 6 11.09V6.4L12 4.15M11 7H13V13H11V7M11 15H13V17H11V15Z"/></svg>',
  'gavel':
    '<svg viewBox="0 0 24 24"><path d="M5.5 8.5L8.5 5.5L13.5 10.5L10.5 13.5L5.5 8.5M14.5 9.5L15.9 8.1L12.4 4.6L11 6L14.5 9.5M10.2 16.3L11.6 14.9L8.1 11.4L6.7 12.8L10.2 16.3M21.2 18.4L16.2 13.4L14.8 14.8L19.8 19.8L21.2 18.4M2 20H8V22H2V20Z"/></svg>',
  'gift-outline':
    '<svg viewBox="0 0 24 24"><path d="M20 6H16.82C17.43 5.09 17.7 3.96 17.5 2.87C17.18 1.15 15.7 0.05 14 0C12.85 0 11.75 0.57 11 1.5C10.25 0.57 9.15 0 8 0C6.3 0.05 4.82 1.15 4.5 2.87C4.3 3.96 4.57 5.09 5.18 6H2V11H4V22H20V11H22V6H20M14 2C15.08 2.08 15.92 2.92 16 4C16.08 5.08 15.24 6 14.16 6H12V3.88C12.42 2.76 13.15 2 14 2M8 2C8.85 2 9.58 2.76 10 3.88V6H7.84C6.76 6 5.92 5.08 6 4C6.08 2.92 6.92 2.08 8 2M6 20V11H11V20H6M18 20H13V11H18V20M20 9H4V8H20V9Z"/></svg>',
  'poll':
    '<svg viewBox="0 0 24 24"><path d="M3 22V8H7V22H3M10 22V2H14V22H10M17 22V14H21V22H17Z"/></svg>',
  'crystal-ball':
    '<svg viewBox="0 0 24 24"><path d="M12 2A9 9 0 0 0 3 11C3 14.47 5 17.47 7.9 18.9C6.8 19.5 6 20.6 6 22H18C18 20.6 17.2 19.5 16.1 18.9C19 17.5 21 14.5 21 11A9 9 0 0 0 12 2M12 4A7 7 0 0 1 19 11C19 14.87 15.87 18 12 18A7 7 0 0 1 5 11C5 7.13 8.13 4 12 4Z"/></svg>',
  'link-variant':
    '<svg viewBox="0 0 24 24"><path d="M10.59 13.41C11 13.8 11 14.44 10.59 14.83C10.2 15.22 9.56 15.22 9.17 14.83C7.22 12.88 7.22 9.71 9.17 7.76V7.76L12.71 4.22C14.66 2.27 17.83 2.27 19.78 4.22C21.73 6.17 21.73 9.34 19.78 11.29L18.29 12.78C18.3 11.96 18.17 11.14 17.89 10.36L18.36 9.88C19.53 8.71 19.53 6.81 18.36 5.64C17.19 4.46 15.29 4.46 14.12 5.64L10.59 9.17C9.41 10.34 9.41 12.24 10.59 13.41M13.41 9.17C13.8 8.78 14.44 8.78 14.83 9.17C16.78 11.12 16.78 14.29 14.83 16.24V16.24L11.29 19.78C9.34 21.73 6.17 21.73 4.22 19.78C2.27 17.83 2.27 14.66 4.22 12.71L5.71 11.22C5.7 12.04 5.83 12.86 6.11 13.64L5.64 14.12C4.47 15.29 4.47 17.19 5.64 18.36C6.81 19.54 8.71 19.54 9.88 18.36L13.41 14.83C14.59 13.66 14.59 11.76 13.41 10.59C13.02 10.2 13.02 9.56 13.41 9.17Z"/></svg>',
  'content-save':
    '<svg viewBox="0 0 24 24"><path d="M17 3H5C3.89 3 3 3.89 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3M19 19H5V5H16.17L19 7.83V19M12 12C10.34 12 9 13.34 9 15C9 16.66 10.34 18 12 18C13.66 18 15 16.66 15 15C15 13.34 13.66 12 12 12M6 6H15V10H6V6Z"/></svg>',
  'content-save-alert':
    '<svg viewBox="0 0 24 24"><path d="M15 8V3H5C3.89 3 3 3.89 3 5V19C3 20.1 3.9 21 5 21H17C17.47 21 17.9 20.84 18.28 20.55C18.23 20.21 18.17 19.86 18.17 19.5C18.17 17.65 18.89 15.96 20.08 14.69V7L15 2H5M5 5H13V7H5V5M17 19H5V12H17V13.09C16.36 13.5 15.82 14.04 15.41 14.68H5V15H15.09C15.03 15.42 15 15.86 15 16.3C15 17.26 15.27 18.18 15.75 19H5M21 15.5V19.5H23V15.5H21M21 21.5V23.5H23V21.5H21Z"/></svg>',
  qrcode:
    '<svg viewBox="0 0 24 24"><path d="M3 11H5V13H3V11M11 5H13V9H11V5M9 11H13V15H11V13H9V11M15 11H17V13H19V11H21V13H19V15H21V19H19V21H17V19H13V21H11V17H15V15H17V13H15V11M19 19V15H17V19H19M3 3H11V11H3V3M5 5V9H9V5H5M3 13H11V21H3V13M5 15V19H9V15H5M13 3H21V11H13V3M15 5V9H19V5H15Z"/></svg>',
  check:
    '<svg viewBox="0 0 24 24"><path d="M21 7L9 19L3.5 13.5L4.91 12.09L9 16.17L19.59 5.59L21 7Z"/></svg>',
};

const panelCountEl = document.getElementById('panelCount');
const panelRowsEl = document.getElementById('panelRows');
const jsonOutputEl = document.getElementById('jsonOutput');
const qrCanvas = document.getElementById('qrCanvas');
const profileNameEl = document.getElementById('profileName');
const profileSelectEl = document.getElementById('profileSelect');
const panelCountButtons = Array.from(document.querySelectorAll('[data-panel-count]'));
const browserSource1El = document.getElementById('browserSource1');
const browserSource2El = document.getElementById('browserSource2');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const saveBtnIcon = document.getElementById('saveBtnIcon');
const saveBtnText = document.getElementById('saveBtnText');
const deleteProfileBtn = document.getElementById('deleteProfileBtn');
const newProfileBtn = document.getElementById('newProfileBtn');
const exampleProfileBtn = document.getElementById('exampleProfileBtn');
const copyBtn = document.getElementById('copyBtn');

// Individual URL QR modal elements
const urlQrModal = document.getElementById('urlQrModal');
const urlQrTitleEl = document.getElementById('urlQrTitle');
const urlQrValueEl = document.getElementById('urlQrValue');
const urlQrCanvas = document.getElementById('urlQrCanvas');
const urlQrCloseBtn = document.getElementById('urlQrCloseBtn');
const modalCloseActionBtn = document.getElementById('modalCloseActionBtn');
const modalCopyUrlBtn = document.getElementById('modalCopyUrlBtn');
const qrBtnBrowserSource1 = document.getElementById('qrBtnBrowserSource1');
const qrBtnBrowserSource2 = document.getElementById('qrBtnBrowserSource2');
let currentModalUrl = '';

// Unsaved changes indicators & banner
const overlaysUnsavedPill = document.getElementById('overlaysUnsavedPill');
const layoutUnsavedPill = document.getElementById('layoutUnsavedPill');
const assignmentsUnsavedPill = document.getElementById('assignmentsUnsavedPill');
const profileUnsavedBadge = document.getElementById('profileUnsavedBadge');
const unsavedBanner = document.getElementById('unsavedBanner');
const unsavedBannerSubtitle = document.getElementById('unsavedBannerSubtitle');
const bannerSaveBtn = document.getElementById('bannerSaveBtn');

let panelAssignmentsState = [...DEFAULT_PANEL_ASSIGNMENTS];
let customPanelUrlsState = ['', '', '', ''];
let activeProfileName = '';
let baselineConfig = null;

function showFieldError(inputEl, message) {
  if (!inputEl) return;

  const anchorEl = inputEl.closest('.input-row') || inputEl;
  let feedbackEl = anchorEl.nextElementSibling;
  if (!feedbackEl || !feedbackEl.classList.contains('field-feedback')) {
    feedbackEl = document.createElement('div');
    feedbackEl.className = 'field-feedback';
    anchorEl.parentNode.insertBefore(feedbackEl, anchorEl.nextSibling);
  }

  feedbackEl.innerHTML = `
    <span class="feedback-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2M13 17H11V15H13V17M13 13H11V7H13V13Z" fill="currentColor"/></svg>
    </span>
    <span class="feedback-text">${escapeHtml(message)}</span>
  `;

  inputEl.classList.add('is-invalid');
  inputEl.focus();

  if (inputEl._feedbackTimer) {
    clearTimeout(inputEl._feedbackTimer);
  }

  const clearError = () => {
    inputEl.classList.remove('is-invalid');
    if (feedbackEl && feedbackEl.parentNode) {
      feedbackEl.classList.add('fading');
      setTimeout(() => {
        if (feedbackEl && feedbackEl.parentNode) {
          feedbackEl.remove();
        }
      }, 200);
    }
    inputEl.removeEventListener('input', clearError);
    inputEl.removeEventListener('change', clearError);
    inputEl._feedbackTimer = null;
  };

  inputEl.addEventListener('input', clearError);
  inputEl.addEventListener('change', clearError);
  inputEl._feedbackTimer = setTimeout(clearError, 4000);
}

function triggerButtonFeedback(buttonEl, message, isSuccess = true) {
  if (!buttonEl) return;
  const original = buttonEl.textContent;
  buttonEl.textContent = message;
  if (isSuccess) {
    buttonEl.classList.add('is-success');
  }
  setTimeout(() => {
    buttonEl.textContent = original;
    if (isSuccess) {
      buttonEl.classList.remove('is-success');
    }
  }, 1500);
}

function showSaveSuccess() {
  if (saveBtnText) {
    saveBtnText.textContent = 'Saved!';
    if (saveBtnIcon) {
      saveBtnIcon.innerHTML = ICONS.check;
    }
    saveProfileBtn.classList.add('is-success');
    setTimeout(() => {
      saveProfileBtn.classList.remove('is-success');
      checkDirtyState();
    }, 1500);
  }
  if (bannerSaveBtn) {
    bannerSaveBtn.textContent = 'Saved!';
  }
}

function setQrBoxError(errorMessage) {
  let errEl = document.getElementById('qrBoxError');
  if (!errorMessage) {
    if (errEl) {
      errEl.remove();
    }
    if (qrCanvas) {
      qrCanvas.style.display = 'block';
    }
    return;
  }
  if (qrCanvas) {
    qrCanvas.style.display = 'none';
  }
  if (!errEl && qrCanvas && qrCanvas.parentNode) {
    errEl = document.createElement('div');
    errEl.id = 'qrBoxError';
    errEl.className = 'qr-error-box';
    qrCanvas.parentNode.appendChild(errEl);
  }
  if (errEl) {
    errEl.textContent = errorMessage;
  }
}

function syncPanelButtons() {
  const value = Number(panelCountEl.value) === 4 ? 4 : 2;
  panelCountButtons.forEach((button) => {
    const selected = Number(button.dataset.panelCount) === value;
    button.classList.toggle('is-selected', selected);
  });
}

function getStoredProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Failed to load profiles from localStorage', error);
    return {};
  }
}

function saveStoredProfiles(profiles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return true;
  } catch (error) {
    console.error('Failed to save profiles to localStorage', error);
    showFieldError(profileNameEl, 'Failed to save profile to browser storage.');
    return false;
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

  if (activeProfileName && profiles[activeProfileName]) {
    profileSelectEl.value = activeProfileName;
  } else {
    profileSelectEl.value = '';
  }
}

function buildConfig() {
  const b1 = browserSource1El ? browserSource1El.value.trim() : '';
  const b2 = browserSource2El ? browserSource2El.value.trim() : '';
  const name = profileNameEl ? profileNameEl.value.trim() : (activeProfileName || '');

  return {
    version: 1,
    name: name,
    panels: Number(panelCountEl.value) === 4 ? 4 : 2,
    layout: [...panelAssignmentsState],
    overlays: [b1, b2],
    custom: customPanelUrlsState.map((url) => (typeof url === 'string' ? url.trim() : '')),
  };
}

function checkDirtyState() {
  const current = buildConfig();
  const currentName = profileNameEl ? profileNameEl.value.trim() : '';

  let isCountMod = false;
  let isBrowserMod = false;
  let isPanelMod = false;
  let isCustomMod = false;
  let isNameMod = false;

  if (baselineConfig) {
    isCountMod = current.panels !== baselineConfig.panels;

    const baseOverlays = Array.isArray(baselineConfig.overlays) ? baselineConfig.overlays : [];
    isBrowserMod =
      (current.overlays[0] || '') !== (baseOverlays[0] || '') ||
      (current.overlays[1] || '') !== (baseOverlays[1] || '');

    const baseLayout = Array.isArray(baselineConfig.layout) ? baselineConfig.layout : DEFAULT_PANEL_ASSIGNMENTS;
    isPanelMod = current.layout.some(
      (type, idx) => type !== (baseLayout[idx] ?? DEFAULT_PANEL_ASSIGNMENTS[idx])
    );

    const baseCustom = Array.isArray(baselineConfig.custom) ? baselineConfig.custom : [];
    isCustomMod = Array.from({ length: 4 }).some(
      (_, idx) => (current.custom[idx] || '') !== (baseCustom[idx] || '')
    );

    const baselineName = (baselineConfig.name || '').trim();
    isNameMod = currentName.length > 0 && currentName !== baselineName;
  } else {
    // If no active saved profile selected
    isCountMod = current.panels !== 2;
    isBrowserMod = Boolean(current.overlays[0] || current.overlays[1]);
    isPanelMod = current.layout.some(
      (type, idx) => type !== DEFAULT_PANEL_ASSIGNMENTS[idx]
    );
    isCustomMod = current.custom.some((url) => Boolean(url && url.length > 0));
    isNameMod = currentName.length > 0;
  }

  const hasUnsavedChanges = isCountMod || isBrowserMod || isPanelMod || isCustomMod || isNameMod;

  // Header unsaved pills
  if (overlaysUnsavedPill) {
    overlaysUnsavedPill.classList.toggle('hidden', !isBrowserMod);
  }
  if (layoutUnsavedPill) {
    layoutUnsavedPill.classList.toggle('hidden', !isCountMod);
  }
  if (assignmentsUnsavedPill) {
    assignmentsUnsavedPill.classList.toggle('hidden', !(isPanelMod || isCustomMod));
  }
  if (profileUnsavedBadge) {
    profileUnsavedBadge.classList.toggle('hidden', !hasUnsavedChanges);
  }

  // Save profile button unsaved state
  if (saveProfileBtn) {
    saveProfileBtn.classList.toggle('is-unsaved', hasUnsavedChanges);
    if (saveBtnText) {
      saveBtnText.textContent = hasUnsavedChanges ? 'Save*' : 'Save profile';
    }
    if (saveBtnIcon) {
      saveBtnIcon.innerHTML = hasUnsavedChanges ? ICONS['content-save-alert'] : ICONS['content-save'];
    }
  }

  // Floating unsaved changes banner
  if (unsavedBanner) {
    unsavedBanner.classList.toggle('hidden', !hasUnsavedChanges);
    if (unsavedBannerSubtitle) {
      unsavedBannerSubtitle.textContent = activeProfileName
        ? `Changes to "${activeProfileName}" are not saved`
        : 'Panel/URL changes are not saved';
    }
  }

  return {
    hasUnsavedChanges,
    isCountMod,
    isBrowserMod,
    isPanelMod,
    isCustomMod,
    isNameMod,
  };
}

function setFormValues(config = {}, updateBaseline = false) {
  const nextConfig = config && typeof config === 'object' ? config : {};

  const overlays = Array.isArray(nextConfig.overlays) ? nextConfig.overlays : [];
  if (browserSource1El) {
    browserSource1El.value = typeof overlays[0] === 'string' ? overlays[0] : '';
  }
  if (browserSource2El) {
    browserSource2El.value = typeof overlays[1] === 'string' ? overlays[1] : '';
  }

  const panelCount = nextConfig.panels === 4 ? '4' : '2';
  panelCountEl.value = panelCount;
  syncPanelButtons();

  const assignments = Array.isArray(nextConfig.layout)
    ? nextConfig.layout
    : [...DEFAULT_PANEL_ASSIGNMENTS];

  panelAssignmentsState = Array.from({ length: 4 }, (_, index) => {
    const value = assignments[index];
    const normalized = value === 'custom-1' || value === 'custom-2' ? 'custom' : value;
    return normalized && VALID_PANEL_ASSIGNMENTS.includes(normalized)
      ? normalized
      : DEFAULT_PANEL_ASSIGNMENTS[index];
  });

  if (Array.isArray(nextConfig.custom)) {
    customPanelUrlsState = Array.from({ length: 4 }, (_, index) =>
      typeof nextConfig.custom[index] === 'string' ? nextConfig.custom[index] : ''
    );
  } else {
    customPanelUrlsState = ['', '', '', ''];
  }

  renderPanelRows();

  if (updateBaseline) {
    baselineConfig = buildConfig();
  }
}

function renderPanelRows() {
  const visibleCount = Number(panelCountEl.value) === 4 ? 4 : 2;
  const rows = [];

  for (let index = 0; index < 4; index += 1) {
    const selectedValue = panelAssignmentsState[index] || DEFAULT_PANEL_ASSIGNMENTS[index];
    const customValue = customPanelUrlsState[index] || '';

    const optionButtons = PANEL_OPTIONS.map((option) => {
      const isSelected = selectedValue === option.value;
      const iconSvg = ICONS[option.icon] || '';
      return `
        <button
          type="button"
          data-panel-type="${option.value}"
          data-panel-index="${index}"
          class="option-button${isSelected ? ' is-selected' : ''}"
          title="${option.label}"
          aria-pressed="${isSelected}"
        >
          <span class="option-icon" aria-hidden="true">${iconSvg}</span>
          <span class="option-label">${escapeHtml(option.label)}</span>
        </button>
      `;
    }).join('');

    rows.push(`
      <div class="assignmentBlock${index >= visibleCount ? ' hidden' : ''}">
        <div class="assignmentLabel">Panel ${index + 1}</div>
        <div class="option-grid">
          ${optionButtons}
        </div>
        ${
          selectedValue === 'custom'
            ? `
          <div class="customField">
            <label for="custom-panel-${index}">Custom panel URL</label>
            <div class="input-row">
              <input
                id="custom-panel-${index}"
                type="url"
                data-custom-url="${index}"
                value="${escapeHtml(customValue)}"
                placeholder="https://example.com/embed"
                inputmode="url"
                autocomplete="off"
              />
              <button
                type="button"
                class="url-qr-btn secondary"
                data-qr-custom-index="${index}"
                data-qr-label="Panel ${index + 1} Custom URL"
                title="Display QR code for Panel ${index + 1} Custom URL"
                aria-label="Display QR code for Panel ${index + 1} Custom URL"
              >
                <span class="btn-icon" aria-hidden="true">${ICONS.qrcode}</span>
                <span>QR</span>
              </button>
            </div>
          </div>
        `
            : ''
        }
      </div>
    `);
  }

  panelRowsEl.innerHTML = rows.join('');

  panelRowsEl.querySelectorAll('[data-panel-type]').forEach((button) => {
    button.addEventListener('click', () => {
      const targetIndex = Number(button.dataset.panelIndex);
      const nextValue = button.dataset.panelType;

      if (VALID_PANEL_ASSIGNMENTS.includes(nextValue)) {
        panelAssignmentsState[targetIndex] = nextValue;
        renderPanelRows();
        generateQr();
        checkDirtyState();
      }
    });
  });

  panelRowsEl.querySelectorAll('[data-custom-url]').forEach((input) => {
    const handleInput = () => {
      const index = Number(input.dataset.customUrl);
      customPanelUrlsState[index] = input.value;
      generateQr();
      checkDirtyState();
    };
    input.addEventListener('input', handleInput);
    input.addEventListener('change', handleInput);
  });

  panelRowsEl.querySelectorAll('[data-qr-custom-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.qrCustomIndex);
      const input = document.getElementById(`custom-panel-${index}`);
      const url = (input ? input.value : '') || customPanelUrlsState[index] || '';
      const label = btn.dataset.qrLabel || `Panel ${index + 1} Custom URL`;
      openUrlQrModal(url, label, input);
    });
  });
}

function updateJson() {
  const config = buildConfig();
  const minified = JSON.stringify(config);
  if (jsonOutputEl) {
    jsonOutputEl.value = minified;
  }
  return minified;
}

function generateQr() {
  const minifiedJson = updateJson();

  if (typeof QRCode === 'undefined') {
    setQrBoxError('QRCode library not loaded.');
    return;
  }

  QRCode.toCanvas(
    qrCanvas,
    minifiedJson,
    {
      width: 300,
      margin: 2,
      color: { dark: '#0d172a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    },
    function (error) {
      if (error) {
        console.error(error);
        setQrBoxError('Unable to generate QR code.');
        return;
      }
      setQrBoxError(null);
    }
  );
}

async function copyJson() {
  const json = updateJson();
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(json);
      triggerButtonFeedback(copyBtn, 'Copied!');
      return;
    }
    throw new Error('Clipboard API unavailable');
  } catch (_error) {
    try {
      jsonOutputEl.focus();
      jsonOutputEl.select();
      const successful = document.execCommand('copy');
      if (successful) {
        triggerButtonFeedback(copyBtn, 'Copied!');
        return;
      }
    } catch {}
    triggerButtonFeedback(copyBtn, 'Copy failed', false);
  }
}

function saveProfile() {
  const name = profileNameEl ? profileNameEl.value.trim() : '';
  if (!name) {
    showFieldError(profileNameEl, 'Enter a profile name before saving.');
    return;
  }

  const profiles = getStoredProfiles();
  const config = buildConfig();
  config.name = name;
  profiles[name] = config;

  if (!saveStoredProfiles(profiles)) {
    return;
  }

  activeProfileName = name;
  baselineConfig = JSON.parse(JSON.stringify(config));
  refreshProfileSelect();
  profileSelectEl.value = name;
  generateQr();
  checkDirtyState();
  showSaveSuccess();
}

function switchToProfile(name) {
  const profiles = getStoredProfiles();
  const profile = profiles[name];

  if (!profile) {
    showFieldError(profileSelectEl, 'That profile no longer exists.');
    refreshProfileSelect();
    return;
  }

  activeProfileName = name;
  if (profileNameEl) {
    profileNameEl.value = profile.name || name;
  }
  if (profileSelectEl) {
    profileSelectEl.value = name;
  }
  setFormValues(profile, true);
  generateQr();
  checkDirtyState();
}

function deleteProfile() {
  const name = profileSelectEl.value || activeProfileName;
  if (!name) {
    showFieldError(profileSelectEl, 'Choose a profile to delete.');
    return;
  }

  const profiles = getStoredProfiles();
  if (!profiles[name]) {
    showFieldError(profileSelectEl, 'That profile does not exist.');
    return;
  }

  const confirmed = window.confirm(`Are you sure you want to delete profile "${name}"?`);
  if (!confirmed) {
    return;
  }

  delete profiles[name];
  saveStoredProfiles(profiles);

  const remainingNames = Object.keys(profiles).sort((a, b) => a.localeCompare(b));

  if (activeProfileName === name) {
    if (remainingNames.length > 0) {
      refreshProfileSelect();
      switchToProfile(remainingNames[0]);
    } else {
      refreshProfileSelect();
      createNewProfile();
    }
  } else {
    refreshProfileSelect();
  }

  triggerButtonFeedback(deleteProfileBtn, 'Deleted', false);
}

function createNewProfile() {
  activeProfileName = '';
  if (profileNameEl) {
    profileNameEl.value = '';
  }
  if (profileSelectEl) {
    profileSelectEl.value = '';
  }
  panelCountEl.value = '2';
  syncPanelButtons();

  if (browserSource1El) {
    browserSource1El.value = '';
  }
  if (browserSource2El) {
    browserSource2El.value = '';
  }

  customPanelUrlsState = ['', '', '', ''];
  panelAssignmentsState = [...DEFAULT_PANEL_ASSIGNMENTS];
  renderPanelRows();
  baselineConfig = buildConfig();
  generateQr();
  checkDirtyState();
}

function fillExample() {
  activeProfileName = '';
  if (profileNameEl) {
    profileNameEl.value = 'Example 4-Panel Setup';
  }
  if (profileSelectEl) {
    profileSelectEl.value = '';
  }
  panelCountEl.value = '4';
  syncPanelButtons();

  if (browserSource1El) {
    browserSource1El.value = 'https://streamlabs.com/widgets/chat-box/your-channel';
  }
  if (browserSource2El) {
    browserSource2El.value = 'https://streamlabs.com/widgets/alert-box/your-channel';
  }

  customPanelUrlsState = [
    '',
    '',
    'https://example.com/goal-widget',
    'https://example.com/up-next',
  ];
  panelAssignmentsState = ['activity-feed', 'chat', 'polls', 'stream-health'];
  renderPanelRows();
  baselineConfig = null; // Mark as unsaved so user is prompted to save
  generateQr();
  checkDirtyState();
}

copyBtn.addEventListener('click', copyJson);
saveProfileBtn.addEventListener('click', saveProfile);
if (bannerSaveBtn) {
  bannerSaveBtn.addEventListener('click', saveProfile);
}
deleteProfileBtn.addEventListener('click', deleteProfile);

if (exampleProfileBtn) {
  exampleProfileBtn.addEventListener('click', () => {
    const dirty = checkDirtyState();
    if (dirty.hasUnsavedChanges) {
      const confirmMessage = activeProfileName
        ? `You have unsaved changes to "${activeProfileName}". Load example configuration anyway?`
        : 'You have unsaved changes. Load example configuration anyway?';
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }
    fillExample();
    triggerButtonFeedback(exampleProfileBtn, 'Loaded!');
  });
}

newProfileBtn.addEventListener('click', () => {
  const dirty = checkDirtyState();
  if (dirty.hasUnsavedChanges) {
    const confirmMessage = activeProfileName
      ? `You have unsaved changes to "${activeProfileName}". Start a new profile anyway?`
      : 'You have unsaved changes. Start a new profile anyway?';
    if (!window.confirm(confirmMessage)) {
      return;
    }
  }
  createNewProfile();
});

panelCountButtons.forEach((button) => {
  button.addEventListener('click', () => {
    panelCountEl.value = button.dataset.panelCount;
    syncPanelButtons();
    renderPanelRows();
    generateQr();
    checkDirtyState();
  });
});

panelCountEl.addEventListener('change', () => {
  syncPanelButtons();
  renderPanelRows();
  generateQr();
  checkDirtyState();
});

if (browserSource1El) {
  browserSource1El.addEventListener('input', () => {
    generateQr();
    checkDirtyState();
  });
}
if (browserSource2El) {
  browserSource2El.addEventListener('input', () => {
    generateQr();
    checkDirtyState();
  });
}

if (profileNameEl) {
  profileNameEl.addEventListener('input', () => {
    const trimmed = profileNameEl.value.trim();
    const profiles = getStoredProfiles();
    if (trimmed && profiles[trimmed]) {
      profileSelectEl.value = trimmed;
    } else {
      profileSelectEl.value = '';
    }
    generateQr();
    checkDirtyState();
  });

  profileNameEl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveProfile();
    }
  });
}

profileSelectEl.addEventListener('change', () => {
  const selectedName = profileSelectEl.value;
  if (!selectedName) {
    profileSelectEl.value = activeProfileName || '';
    return;
  }

  if (selectedName === activeProfileName) {
    return;
  }

  const dirty = checkDirtyState();
  if (dirty.hasUnsavedChanges) {
    const confirmMessage = activeProfileName
      ? `You have unsaved changes to "${activeProfileName}". Discard changes and load "${selectedName}"?`
      : `You have unsaved changes. Discard changes and load "${selectedName}"?`;

    const discardChanges = window.confirm(confirmMessage);
    if (!discardChanges) {
      profileSelectEl.value = activeProfileName || '';
      return;
    }
  }

  switchToProfile(selectedName);
});

// Two-way JSON editing/importing
if (jsonOutputEl) {
  jsonOutputEl.addEventListener('change', () => {
    try {
      const parsed = JSON.parse(jsonOutputEl.value);
      if (parsed && typeof parsed === 'object') {
        setFormValues(parsed);
        const importedName = typeof parsed.name === 'string' ? parsed.name : '';
        if (profileNameEl) {
          profileNameEl.value = importedName;
        }
        generateQr();
        checkDirtyState();
      }
    } catch {
      // Invalid JSON during manual typing, ignore
    }
  });
}

function openUrlQrModal(url, label, targetInput) {
  const cleanUrl = (url || '').trim();
  if (!cleanUrl) {
    showFieldError(targetInput, `Please enter a URL for ${label} before displaying its QR code.`);
    return;
  }

  currentModalUrl = cleanUrl;
  if (urlQrTitleEl) {
    urlQrTitleEl.textContent = label;
  }
  if (urlQrValueEl) {
    urlQrValueEl.textContent = cleanUrl;
  }
  if (modalCopyUrlBtn) {
    modalCopyUrlBtn.textContent = 'Copy URL';
  }

  if (typeof QRCode === 'undefined') {
    showFieldError(targetInput, 'QRCode library failed to load.');
    return;
  }

  QRCode.toCanvas(
    urlQrCanvas,
    cleanUrl,
    {
      width: 280,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    },
    (err) => {
      if (err) {
        console.error('Failed to generate URL QR code:', err);
        showFieldError(targetInput, 'Failed to generate QR code for this URL.');
        return;
      }
      if (urlQrModal) {
        urlQrModal.classList.remove('hidden');
      }
    }
  );
}

function closeUrlQrModal() {
  if (urlQrModal) {
    urlQrModal.classList.add('hidden');
  }
}

if (qrBtnBrowserSource1) {
  qrBtnBrowserSource1.addEventListener('click', () => {
    openUrlQrModal(browserSource1El.value, 'Overlay URL 1', browserSource1El);
  });
}

if (qrBtnBrowserSource2) {
  qrBtnBrowserSource2.addEventListener('click', () => {
    openUrlQrModal(browserSource2El.value, 'Overlay URL 2', browserSource2El);
  });
}

if (urlQrCloseBtn) {
  urlQrCloseBtn.addEventListener('click', closeUrlQrModal);
}

if (modalCloseActionBtn) {
  modalCloseActionBtn.addEventListener('click', closeUrlQrModal);
}

if (urlQrModal) {
  urlQrModal.addEventListener('click', (event) => {
    if (event.target === urlQrModal) {
      closeUrlQrModal();
    }
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && urlQrModal && !urlQrModal.classList.contains('hidden')) {
    closeUrlQrModal();
  }
});

if (modalCopyUrlBtn) {
  modalCopyUrlBtn.addEventListener('click', async () => {
    if (!currentModalUrl) return;
    try {
      await navigator.clipboard.writeText(currentModalUrl);
      modalCopyUrlBtn.textContent = 'Copied!';
      setTimeout(() => {
        if (modalCopyUrlBtn) {
          modalCopyUrlBtn.textContent = 'Copy URL';
        }
      }, 1500);
    } catch {
      // Fallback
    }
  });
}

function init() {
  const profiles = getStoredProfiles();
  const names = Object.keys(profiles).sort((a, b) => a.localeCompare(b));

  if (names.length > 0) {
    refreshProfileSelect();
    switchToProfile(names[0]);
  } else {
    refreshProfileSelect();
    createNewProfile();
    generateQr();
  }
}

init();
