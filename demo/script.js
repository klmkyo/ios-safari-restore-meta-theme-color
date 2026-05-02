import { highlight } from 'sugar-high';

const RAINBOW_CHROMA = 0.15;
const RAINBOW_LIGHTNESS = 0.8;
const RAINBOW_DEGREES_PER_SECOND = 180;
const IOS_BROWSER_TOKENS = /\b(CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|YaBrowser)\//;

const TOP_INVISIBLE_PRESET = Object.freeze({ width: 89, offset: 4, height: 11 });
const BOTTOM_INVISIBLE_PRESET = Object.freeze({ width: 89, offset: 3, height: 11 });

function getElement(selector, elementType) {
  const element = document.querySelector(selector);

  if (!(element instanceof elementType)) {
    throw new Error(`Expected ${selector} to match ${elementType.name}.`);
  }

  return element;
}

function getInput(id) {
  return getElement(`#${id}`, HTMLInputElement);
}

function createBarControls(side) {
  const isTop = side === 'top';

  return {
    enabled: getInput(`${side}Enabled`),
    rainbow: getInput(`${side}Rainbow`),
    color: getInput(`${side}Color`),
    invisibleMask: getInput(`${side}InvisibleMask`),
    width: getInput(`${side}Width`),
    offset: getInput(`${side}Offset`),
    height: getInput(`${side}Height`),
    widthValue: getElement(`#${side}WidthValue`, HTMLElement),
    offsetValue: getElement(`#${side}OffsetValue`, HTMLElement),
    heightValue: getElement(`#${side}HeightValue`, HTMLElement),
    bar: getElement(`#${side}Bar`, HTMLElement),
    invisiblePreset: isTop ? TOP_INVISIBLE_PRESET : BOTTOM_INVISIBLE_PRESET,
    widthThreshold: 89,
    offsetThreshold: isTop ? 4 : 3,
    heightThreshold: 11,
  };
}

const topControls = createBarControls('top');
const bottomControls = createBarControls('bottom');
const allControls = [topControls, bottomControls];

const compatibilityNotice = getElement('#compatibilityNotice', HTMLElement);
const compatibilityMessage = getElement('#compatibilityMessage', HTMLElement);
const htmlSnippet = getElement('#htmlSnippet', HTMLElement);
const copyButton = getElement('#copyHtml', HTMLButtonElement);
const copyLabel = getElement('#copyHtml .copy-label', HTMLElement);

function parseVersionMajor(version) {
  if (!version) {
    return null;
  }

  const major = Number.parseInt(version.split(/[._]/)[0], 10);
  return Number.isNaN(major) ? null : major;
}

function detectIPhoneSafari26(userAgent) {
  const iosMatch = userAgent.match(/\b(?:iPhone )?OS ([\d_]+) like Mac OS X\b/);
  const safariVersionMatch = userAgent.match(/\bVersion\/([\d.]+)\b/);
  const reportedIosMajor = parseVersionMajor(iosMatch?.[1]);
  const safariMajor = parseVersionMajor(safariVersionMatch?.[1]);
  const isIPhone = /\biPhone\b/.test(userAgent);
  const isSafari = /\bSafari\//.test(userAgent) && !IOS_BROWSER_TOKENS.test(userAgent);

  return {
    isIPhone,
    isSafari,
    isIPhoneSafari26: isIPhone && isSafari && (reportedIosMajor >= 26 || safariMajor >= 26),
  };
}

function updateCompatibilityNotice() {
  const detection = detectIPhoneSafari26(window.navigator.userAgent);

  if (detection.isIPhoneSafari26) {
    compatibilityNotice.classList.remove('is-visible');
    return;
  }

  compatibilityNotice.classList.add('is-visible');

  if (detection.isIPhone && detection.isSafari) {
    compatibilityMessage.textContent =
      'Detected iPhone Safari, but not Safari 26 or newer. This demo is meant for iPhone Safari on iOS 26+.';
    return;
  }

  compatibilityMessage.textContent =
    'For best results, view this demo on iPhone Safari running iOS 26 or newer.';
}

function setInvisibleMask(element, enabled) {
  if (enabled) {
    element.style.maskImage = 'linear-gradient(to right, transparent, transparent)';
    element.style.webkitMaskImage = 'linear-gradient(to right, transparent, transparent)';
    return;
  }

  element.style.removeProperty('mask-image');
  element.style.removeProperty('-webkit-mask-image');
}

function rainbowColor(hue) {
  const wrappedHue = ((hue % 360) + 360) % 360;
  return `oklch(${RAINBOW_LIGHTNESS} ${RAINBOW_CHROMA} ${wrappedHue})`;
}

function hexToOklch(hexColor) {
  return new Color(hexColor).to('oklch').toString({ precision: 4 });
}

function oklchToHex(oklchColor) {
  return new Color(oklchColor).to('srgb').toString({ format: 'hex', collapse: false }).toLowerCase();
}

function syncPickerFromColorString(colorInput, colorString) {
  colorInput.value = oklchToHex(colorString);
}

function applyInvisiblePreset(controls) {
  controls.width.value = String(controls.invisiblePreset.width);
  controls.offset.value = String(controls.invisiblePreset.offset);
  controls.height.value = String(controls.invisiblePreset.height);
}

function updateReadout(readout, value, isWarning) {
  readout.textContent = `${isWarning ? '⚠ ' : ''}${value}`;
  readout.classList.toggle('is-warning', isWarning);
}

function updateReadouts(controls) {
  updateReadout(
    controls.widthValue,
    `${controls.width.value}%`,
    Number(controls.width.value) < controls.widthThreshold,
  );
  updateReadout(
    controls.offsetValue,
    `${controls.offset.value}px`,
    Number(controls.offset.value) > controls.offsetThreshold,
  );
  updateReadout(
    controls.heightValue,
    `${controls.height.value}px`,
    Number(controls.height.value) < controls.heightThreshold,
  );
}

function applyBarGeometry(controls, side) {
  controls.bar.style.left = '50%';
  controls.bar.style.transform = 'translateX(-50%)';
  controls.bar.style.width = `${controls.width.value}%`;
  controls.bar.style.height = `${controls.height.value}px`;

  if (side === 'top') {
    controls.bar.style.top = `${controls.offset.value}px`;
    return;
  }

  controls.bar.style.bottom = `${controls.offset.value}px`;
}

function applyControlState(controls) {
  const disabled = !controls.enabled.checked;

  [
    controls.rainbow,
    controls.invisibleMask,
    controls.color,
    controls.width,
    controls.offset,
    controls.height,
  ].forEach((input) => {
    input.disabled = disabled;
  });

  controls.color.classList.toggle('is-muted', disabled);

  if (controls.invisibleMask.checked) {
    applyInvisiblePreset(controls);
  }

  updateReadouts(controls);
  setInvisibleMask(controls.bar, controls.invisibleMask.checked);
}

function syncInterface() {
  applyControlState(topControls);
  applyControlState(bottomControls);
  applyBarGeometry(topControls, 'top');
  applyBarGeometry(bottomControls, 'bottom');
  updateSnippet();
}

function getStaticColor(controls, fallbackHue) {
  return controls.rainbow.checked ? rainbowColor(fallbackHue) : hexToOklch(controls.color.value);
}

function getSnippetConfig(controls) {
  return {
    enabled: controls.enabled.checked,
    mask: controls.invisibleMask.checked,
    color: getStaticColor(controls, 0),
    width: Number(controls.width.value),
    offset: Number(controls.offset.value),
    height: Number(controls.height.value),
  };
}

function getRainbowComment(controls) {
  return controls.rainbow.checked
    ? '        /* Rainbow effect disabled for clarity, static color used instead */\n'
    : '';
}

function getMaskStyles(enabled) {
  return enabled
    ? `        /* Hack to style the browser UI while making it invisible to the user */
        mask-image: linear-gradient(to right, transparent, transparent);
        -webkit-mask-image: linear-gradient(to right, transparent, transparent);
`
    : '';
}

function buildHtmlSnippet() {
  const top = getSnippetConfig(topControls);
  const bottom = getSnippetConfig(bottomControls);

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
        top: ${top.offset}px;
        width: ${top.width}%;
        height: ${top.height}px;
        display: ${top.enabled ? 'block' : 'none'};
${getRainbowComment(topControls)}        background: ${top.color};
${getMaskStyles(top.mask)}      }

      .bottombar {
        bottom: ${bottom.offset}px;
        width: ${bottom.width}%;
        height: ${bottom.height}px;
        display: ${bottom.enabled ? 'block' : 'none'};
${getRainbowComment(bottomControls)}        background: ${bottom.color};
${getMaskStyles(bottom.mask)}      }
    </style>
  </head>
  <body>
    <div class="topbar" aria-hidden="true"></div>
    <div class="bottombar" aria-hidden="true"></div>
  </body>
</html>`;
}

function updateSnippet() {
  htmlSnippet.innerHTML = highlight(buildHtmlSnippet());
}

function setCopyButtonLabel(text) {
  copyLabel.textContent = text;
}

function flashCopyButtonLabel(temporaryLabel) {
  const oldLabel = copyLabel.textContent || copyButton.textContent || 'Copy';

  setCopyButtonLabel(temporaryLabel);
  setTimeout(() => {
    setCopyButtonLabel(oldLabel);
  }, 900);
}

async function copySnippet() {
  try {
    await navigator.clipboard.writeText(buildHtmlSnippet());
    flashCopyButtonLabel('Copied');
  } catch {
    flashCopyButtonLabel('Failed');
  }
}

function renderBarColor(controls, hue) {
  if (!controls.enabled.checked) {
    controls.bar.style.display = 'none';
    return;
  }

  controls.bar.style.display = 'block';

  if (controls.rainbow.checked) {
    const color = rainbowColor(hue);
    controls.bar.style.backgroundColor = color;
    syncPickerFromColorString(controls.color, color);
    return;
  }

  controls.bar.style.backgroundColor = hexToOklch(controls.color.value);
}

function render(timestamp) {
  const hue = (timestamp / 1000) * RAINBOW_DEGREES_PER_SECOND;

  renderBarColor(topControls, hue);
  renderBarColor(bottomControls, hue);
  requestAnimationFrame(render);
}

function disableRainbowWhenPickingSolidColor(controls) {
  if (controls.color.disabled || !controls.rainbow.checked) {
    return;
  }

  controls.rainbow.checked = false;
  syncInterface();
}

function handleAdvancedInput(controls) {
  if (controls.invisibleMask.checked) {
    controls.invisibleMask.checked = false;
  }

  syncInterface();
}

function bindEvents() {
  allControls.forEach((controls) => {
    [controls.enabled, controls.rainbow, controls.color, controls.invisibleMask].forEach((input) => {
      input.addEventListener('input', syncInterface);
    });

    ['pointerdown', 'focus'].forEach((eventName) => {
      controls.color.addEventListener(eventName, () => disableRainbowWhenPickingSolidColor(controls));
    });

    [controls.width, controls.offset, controls.height].forEach((input) => {
      input.addEventListener('input', () => handleAdvancedInput(controls));
    });
  });

  copyButton.addEventListener('click', copySnippet);
}

function init() {
  lucide.createIcons();
  bindEvents();
  updateCompatibilityNotice();
  syncInterface();
  requestAnimationFrame(render);
}

init();
