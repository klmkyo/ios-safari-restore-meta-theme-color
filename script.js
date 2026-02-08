const state = {
  topEnabled: document.getElementById('topEnabled'),
  topRainbow: document.getElementById('topRainbow'),
  topColor: document.getElementById('topColor'),
  bottomEnabled: document.getElementById('bottomEnabled'),
  bottomRainbow: document.getElementById('bottomRainbow'),
  bottomColor: document.getElementById('bottomColor'),
  topInvisibleMask: document.getElementById('topInvisibleMask'),
  bottomInvisibleMask: document.getElementById('bottomInvisibleMask'),
  topWidth: document.getElementById('topWidth'),
  topOffset: document.getElementById('topOffset'),
  topHeight: document.getElementById('topHeight'),
  bottomWidth: document.getElementById('bottomWidth'),
  bottomOffset: document.getElementById('bottomOffset'),
  bottomHeight: document.getElementById('bottomHeight'),
  topWidthValue: document.getElementById('topWidthValue'),
  topOffsetValue: document.getElementById('topOffsetValue'),
  topHeightValue: document.getElementById('topHeightValue'),
  bottomWidthValue: document.getElementById('bottomWidthValue'),
  bottomOffsetValue: document.getElementById('bottomOffsetValue'),
  bottomHeightValue: document.getElementById('bottomHeightValue'),
  topBar: document.getElementById('topBar'),
  bottomBar: document.getElementById('bottomBar'),
  htmlSnippet: document.getElementById('htmlSnippet'),
  copyHtml: document.getElementById('copyHtml'),
  copyLabel: document.querySelector('#copyHtml .copy-label'),
};

const RAINBOW_CHROMA = 0.15;
const RAINBOW_LIGHTNESS = 0.8;
const RAINBOW_DEGREES_PER_SECOND = 180;
const TOP_DISCREET_PRESET = Object.freeze({ width: 89, offset: 4, height: 11 });
const BOTTOM_DISCREET_PRESET = Object.freeze({ width: 89, offset: 3, height: 11 });

function setMask(element, enabled) {
  if (enabled) {
    element.style.maskImage = 'linear-gradient(to right, transparent, transparent)';
    element.style.webkitMaskImage = 'linear-gradient(to right, transparent, transparent)';
  } else {
    element.style.removeProperty('mask-image');
    element.style.removeProperty('-webkit-mask-image');
  }
}

function rainbowColor(hue) {
  const wrappedHue = ((hue % 360) + 360) % 360;
  return `oklch(${RAINBOW_LIGHTNESS} ${RAINBOW_CHROMA} ${wrappedHue})`;
}

function applyControlStates() {
  const topDisabled = !state.topEnabled.checked;
  const bottomDisabled = !state.bottomEnabled.checked;

  state.topRainbow.disabled = topDisabled;
  state.topInvisibleMask.disabled = topDisabled;
  state.topColor.disabled = topDisabled;
  state.topWidth.disabled = topDisabled;
  state.topOffset.disabled = topDisabled;
  state.topHeight.disabled = topDisabled;
  state.topColor.classList.toggle('is-muted', topDisabled);

  state.bottomRainbow.disabled = bottomDisabled;
  state.bottomInvisibleMask.disabled = bottomDisabled;
  state.bottomColor.disabled = bottomDisabled;
  state.bottomWidth.disabled = bottomDisabled;
  state.bottomOffset.disabled = bottomDisabled;
  state.bottomHeight.disabled = bottomDisabled;
  state.bottomColor.classList.toggle('is-muted', bottomDisabled);

  if (state.topInvisibleMask.checked) {
    applyDiscreetPreset('top');
  }
  if (state.bottomInvisibleMask.checked) {
    applyDiscreetPreset('bottom');
  }

  updateAdvancedReadouts();
  applyBarGeometry();
  setMask(state.topBar, state.topInvisibleMask.checked);
  setMask(state.bottomBar, state.bottomInvisibleMask.checked);
  updateSnippets();
}

function applyDiscreetPreset(side) {
  const preset = side === 'top' ? TOP_DISCREET_PRESET : BOTTOM_DISCREET_PRESET;
  if (side === 'top') {
    state.topWidth.value = String(preset.width);
    state.topOffset.value = String(preset.offset);
    state.topHeight.value = String(preset.height);
  } else {
    state.bottomWidth.value = String(preset.width);
    state.bottomOffset.value = String(preset.offset);
    state.bottomHeight.value = String(preset.height);
  }
}

function updateAdvancedReadouts() {
  const topWidthRisk = Number(state.topWidth.value) < 89;
  const topOffsetRisk = Number(state.topOffset.value) > 4;
  const topHeightRisk = Number(state.topHeight.value) < 11;
  const bottomWidthRisk = Number(state.bottomWidth.value) < 89;
  const bottomOffsetRisk = Number(state.bottomOffset.value) > 3;
  const bottomHeightRisk = Number(state.bottomHeight.value) < 11;

  state.topWidthValue.textContent = `${topWidthRisk ? '⚠ ' : ''}${state.topWidth.value}%`;
  state.topOffsetValue.textContent = `${topOffsetRisk ? '⚠ ' : ''}${state.topOffset.value}px`;
  state.topHeightValue.textContent = `${topHeightRisk ? '⚠ ' : ''}${state.topHeight.value}px`;
  state.bottomWidthValue.textContent = `${bottomWidthRisk ? '⚠ ' : ''}${state.bottomWidth.value}%`;
  state.bottomOffsetValue.textContent = `${bottomOffsetRisk ? '⚠ ' : ''}${state.bottomOffset.value}px`;
  state.bottomHeightValue.textContent = `${bottomHeightRisk ? '⚠ ' : ''}${state.bottomHeight.value}px`;

  state.topWidthValue.classList.toggle('is-warning', topWidthRisk);
  state.topOffsetValue.classList.toggle('is-warning', topOffsetRisk);
  state.topHeightValue.classList.toggle('is-warning', topHeightRisk);
  state.bottomWidthValue.classList.toggle('is-warning', bottomWidthRisk);
  state.bottomOffsetValue.classList.toggle('is-warning', bottomOffsetRisk);
  state.bottomHeightValue.classList.toggle('is-warning', bottomHeightRisk);
}

function applyBarGeometry() {
  state.topBar.style.left = '50%';
  state.topBar.style.transform = 'translateX(-50%)';
  state.topBar.style.width = `${state.topWidth.value}%`;
  state.topBar.style.top = `${state.topOffset.value}px`;
  state.topBar.style.height = `${state.topHeight.value}px`;

  state.bottomBar.style.left = '50%';
  state.bottomBar.style.transform = 'translateX(-50%)';
  state.bottomBar.style.width = `${state.bottomWidth.value}%`;
  state.bottomBar.style.bottom = `${state.bottomOffset.value}px`;
  state.bottomBar.style.height = `${state.bottomHeight.value}px`;
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getStaticColor(useRainbow, solid, fallbackHue) {
  return useRainbow ? rainbowColor(fallbackHue) : hexToOklch(solid);
}

function hexToOklch(hexColor) {
  return new Color(hexColor).to('oklch').toString({ precision: 4 });
}

function oklchToHex(oklchColor) {
  return new Color(oklchColor).to('srgb').toString({ format: 'hex', collapse: false }).toLowerCase();
}

function syncPickerFromColorString(colorString, colorInput) {
  colorInput.value = oklchToHex(colorString);
}

function buildHtmlSnippet() {
  const topEnabled = state.topEnabled.checked;
  const bottomEnabled = state.bottomEnabled.checked;
  const useTopMask = state.topInvisibleMask.checked;
  const useBottomMask = state.bottomInvisibleMask.checked;
  const topColor = getStaticColor(state.topRainbow.checked, state.topColor.value, 0);
  const bottomColor = getStaticColor(state.bottomRainbow.checked, state.bottomColor.value, 0);
  const topWidth = Number(state.topWidth.value);
  const topOffset = Number(state.topOffset.value);
  const topHeight = Number(state.topHeight.value);
  const bottomWidth = Number(state.bottomWidth.value);
  const bottomOffset = Number(state.bottomOffset.value);
  const bottomHeight = Number(state.bottomHeight.value);
  const topDisplay = topEnabled ? 'block' : 'none';
  const bottomDisplay = bottomEnabled ? 'block' : 'none';
  const topRainbowComment = state.topRainbow.checked
    ? '        /* Rainbow effect disabled for clarity, static color used instead */\n'
    : '';
  const bottomRainbowComment = state.bottomRainbow.checked
    ? '        /* Rainbow effect disabled for clarity, static color used instead */\n'
    : '';
  const topMaskStyles = useTopMask
    ? `        /* Hack to style the browser UI while making it invisible to the user */
        mask-image: linear-gradient(to right, transparent, transparent);
        -webkit-mask-image: linear-gradient(to right, transparent, transparent);
`
    : '';
  const bottomMaskStyles = useBottomMask
    ? `        /* Hack to style the browser UI while making it invisible to the user */
        mask-image: linear-gradient(to right, transparent, transparent);
        -webkit-mask-image: linear-gradient(to right, transparent, transparent);
`
    : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>iOS Safari Browser UI Tint Demo</title>
    <style>
      body {
        margin: 0;
        min-height: 100%;
        background: #ffffff;
      }

      .topbar,
      .bottombar {
        pointer-events: none;
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999;
      }

      .topbar {
        top: ${topOffset}px;
        width: ${topWidth}%;
        height: ${topHeight}px;
        display: ${topDisplay};
${topRainbowComment}        background: ${topColor};
${topMaskStyles}      }

      .bottombar {
        bottom: ${bottomOffset}px;
        width: ${bottomWidth}%;
        height: ${bottomHeight}px;
        display: ${bottomDisplay};
${bottomRainbowComment}        background: ${bottomColor};
${bottomMaskStyles}      }
    </style>
  </head>
  <body>
    <div class="topbar" aria-hidden="true"></div>
    <div class="bottombar" aria-hidden="true"></div>
  </body>
</html>`;
}

function updateSnippets() {
  const html = buildHtmlSnippet();

  state.htmlSnippet.innerHTML = escapeHtml(html);
  Prism.highlightElement(state.htmlSnippet);
}

function setCopyButtonLabel(text) {
  if (state.copyLabel) {
    state.copyLabel.textContent = text;
  }
}

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    const old = state.copyLabel ? state.copyLabel.textContent : button.textContent;
    setCopyButtonLabel('Copied');
    setTimeout(() => {
      setCopyButtonLabel(old);
    }, 900);
  } catch {
    const old = state.copyLabel ? state.copyLabel.textContent : button.textContent;
    setCopyButtonLabel('Failed');
    setTimeout(() => {
      setCopyButtonLabel(old);
    }, 900);
  }
}

function render(timestamp) {
  const elapsedSeconds = timestamp / 1000;
  const baseHue = elapsedSeconds * RAINBOW_DEGREES_PER_SECOND;

  if (state.topEnabled.checked) {
    state.topBar.style.display = 'block';
    if (state.topRainbow.checked) {
      const topRainbow = rainbowColor(baseHue);
      state.topBar.style.backgroundColor = topRainbow;
      syncPickerFromColorString(topRainbow, state.topColor);
    } else {
      state.topBar.style.backgroundColor = hexToOklch(state.topColor.value);
    }
  } else {
    state.topBar.style.display = 'none';
  }

  if (state.bottomEnabled.checked) {
    state.bottomBar.style.display = 'block';
    if (state.bottomRainbow.checked) {
      const bottomRainbow = rainbowColor(baseHue);
      state.bottomBar.style.backgroundColor = bottomRainbow;
      syncPickerFromColorString(bottomRainbow, state.bottomColor);
    } else {
      state.bottomBar.style.backgroundColor = hexToOklch(state.bottomColor.value);
    }
  } else {
    state.bottomBar.style.display = 'none';
  }

  requestAnimationFrame(render);
}

function handleColorInputIntent(rainbowToggle, colorInput) {
  if (colorInput.disabled) {
    return;
  }
  if (rainbowToggle.checked) {
    rainbowToggle.checked = false;
    applyControlStates();
  }
}

function handleAdvancedInput(side) {
  if (side === 'top' && state.topInvisibleMask.checked) {
    state.topInvisibleMask.checked = false;
  }
  if (side === 'bottom' && state.bottomInvisibleMask.checked) {
    state.bottomInvisibleMask.checked = false;
  }
  applyControlStates();
}

[
  state.topEnabled,
  state.topRainbow,
  state.topColor,
  state.bottomEnabled,
  state.bottomRainbow,
  state.bottomColor,
  state.topWidth,
  state.topOffset,
  state.topHeight,
  state.bottomWidth,
  state.bottomOffset,
  state.bottomHeight,
  state.topInvisibleMask,
  state.bottomInvisibleMask,
].forEach((input) => {
  input.addEventListener('input', applyControlStates);
});

['pointerdown', 'focus'].forEach((eventName) => {
  state.topColor.addEventListener(eventName, () =>
    handleColorInputIntent(state.topRainbow, state.topColor),
  );
  state.bottomColor.addEventListener(eventName, () =>
    handleColorInputIntent(state.bottomRainbow, state.bottomColor),
  );
});

[state.topWidth, state.topOffset, state.topHeight].forEach((input) => {
  input.addEventListener('input', () => handleAdvancedInput('top'));
});

[state.bottomWidth, state.bottomOffset, state.bottomHeight].forEach((input) => {
  input.addEventListener('input', () => handleAdvancedInput('bottom'));
});

state.copyHtml.addEventListener('click', () => copyText(buildHtmlSnippet(), state.copyHtml));

lucide.createIcons();
applyControlStates();
requestAnimationFrame(render);
