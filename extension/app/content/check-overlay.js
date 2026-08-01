const CHECK_OVERLAY_ID = "__click_repeater_check_overlay";
const CHECK_POINT_EPSILON = 1;
const CHECK_BLUE = "#012292";
const CHECK_LINE_DASH = "10 10";
const CHECK_ICON_SIZE = 34;
const CHECK_MIN_LINE_LENGTH = 38;
const CHECK_LINE_NODE_GAP = 28;

const checkOverlayState = {
  isActive: false,
  clickId: null
};

function isCheckKeyboardAction(action) {
  return action && typeof action === "object" && (action.type === "keydown" || action.type === "keyup");
}

function isCheckClickAction(action) {
  return typeof action === "string" || (action && typeof action === "object" && action.type === "click");
}

function resolveCheckClickPoint(action) {
  const targetStep = action && typeof action === "object" && action.type === "click"
    ? action.target
    : action;
  const coordinatePoint = parseCoordinateStep(targetStep);
  if (coordinatePoint) {
    return coordinatePoint;
  }

  if (typeof targetStep !== "string" || !targetStep.trim()) {
    return null;
  }

  let element = null;
  try {
    element = document.querySelector(targetStep);
  } catch {
    return null;
  }

  if (!(element instanceof Element)) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  return normalizeViewportPoint({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  });
}

function sameCheckPoint(a, b) {
  return Boolean(a && b) && Math.abs(a.x - b.x) <= CHECK_POINT_EPSILON && Math.abs(a.y - b.y) <= CHECK_POINT_EPSILON;
}

function makeCheckRangeLabel(startIndex, endIndex) {
  return startIndex === endIndex ? String(startIndex) : `${startIndex}-${endIndex}`;
}

function buildCheckGroups(steps) {
  const groups = [];
  let latestClickPoint = null;

  steps.forEach((step, index) => {
    const actionIndex = index + 1;
    if (isCheckClickAction(step)) {
      const point = resolveCheckClickPoint(step);
      if (!point) {
        return;
      }

      const previous = groups[groups.length - 1];
      if (previous?.kind === "click" && sameCheckPoint(previous.point, point)) {
        previous.endIndex = actionIndex;
      } else {
        groups.push({ kind: "click", point, startIndex: actionIndex, endIndex: actionIndex });
      }
      latestClickPoint = point;
      return;
    }

    if (!isCheckKeyboardAction(step) || !latestClickPoint) {
      return;
    }

    const previous = groups[groups.length - 1];
    if (previous?.kind === "keyboard" && sameCheckPoint(previous.point, latestClickPoint)) {
      previous.endIndex = actionIndex;
      return;
    }

    groups.push({ kind: "keyboard", point: latestClickPoint, startIndex: actionIndex, endIndex: actionIndex });
  });

  return groups;
}

function getCheckPointKey(point) {
  return `${Math.round(point.x)}:${Math.round(point.y)}`;
}

function appendCheckArrowMarker(svg, id) {
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", id);
  marker.setAttribute("viewBox", "0 0 8 8");
  marker.setAttribute("refX", "7");
  marker.setAttribute("refY", "4");
  marker.setAttribute("markerWidth", "5");
  marker.setAttribute("markerHeight", "5");
  marker.setAttribute("orient", "auto");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M 0 0 L 8 4 L 0 8");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", CHECK_BLUE);
  path.setAttribute("stroke-width", "1.5");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  marker.append(path);
  svg.append(marker);
}

function appendCheckLine(svg, from, to, color, dashOffset, markerId = null) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", String(from.x));
  line.setAttribute("y1", String(from.y));
  line.setAttribute("x2", String(to.x));
  line.setAttribute("y2", String(to.y));
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", "2");
  line.setAttribute("stroke-linecap", "butt");
  line.setAttribute("stroke-dasharray", CHECK_LINE_DASH);
  line.setAttribute("stroke-dashoffset", String(dashOffset));
  line.setAttribute("opacity", "0.5");
  if (markerId) {
    line.setAttribute("marker-end", `url(#${markerId})`);
  }
  svg.append(line);
}

function isRenderableCheckLine(from, to) {
  return Math.hypot(to.x - from.x, to.y - from.y) >= CHECK_MIN_LINE_LENGTH;
}

function getInsetCheckLinePoints(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length < CHECK_MIN_LINE_LENGTH) {
    return null;
  }

  const unitX = dx / length;
  const unitY = dy / length;
  const gap = Math.min(CHECK_LINE_NODE_GAP, Math.max(0, (length - CHECK_MIN_LINE_LENGTH) / 2));
  return {
    from: {
      x: from.x + unitX * gap,
      y: from.y + unitY * gap
    },
    to: {
      x: to.x - unitX * gap,
      y: to.y - unitY * gap
    }
  };
}

function makeCheckOverlayElement(groups) {
  const overlay = document.createElement("div");
  overlay.id = CHECK_OVERLAY_ID;
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:2147483646",
    "pointer-events:none",
    "font-family:Arial,sans-serif",
    "color:#012292"
  ].join(";");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", `0 0 ${Math.max(1, window.innerWidth)} ${Math.max(1, window.innerHeight)}`);
  svg.style.cssText = "position:absolute;inset:0;overflow:visible;";
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  appendCheckArrowMarker(defs, "check-arrow-blue");
  svg.append(defs);

  const pointSequence = groups.map((group) => group.point);
  for (let index = 1; index < pointSequence.length; index += 1) {
    const linePoints = getInsetCheckLinePoints(pointSequence[index - 1], pointSequence[index]);
    if (!linePoints) {
      continue;
    }
    appendCheckLine(svg, linePoints.from, linePoints.to, "#ffffff", 0);
    appendCheckLine(svg, linePoints.from, linePoints.to, CHECK_BLUE, 10, "check-arrow-blue");
  }
  overlay.append(svg);

  const slotCounts = new Map();
  for (const group of groups) {
    const key = getCheckPointKey(group.point);
    const slot = slotCounts.get(key) ?? 0;
    slotCounts.set(key, slot + 1);

    const item = document.createElement("div");
    item.style.cssText = [
      "position:absolute",
      "display:flex",
      "align-items:center",
      "gap:4px",
      "font-size:12px",
      "font-weight:700",
      "line-height:1",
      "color:#012292",
      "transform:translate(-50%,-50%)"
    ].join(";");
    item.style.left = `${group.point.x}px`;
    item.style.top = `${group.point.y - slot * 46}px`;

    const icon = document.createElement("span");
    icon.style.cssText = `display:block;width:${CHECK_ICON_SIZE}px;height:${CHECK_ICON_SIZE}px;color:#012292;`;
    icon.innerHTML = group.kind === "keyboard"
      ? globalThis.clickRepeaterLucideIcons.keyboard
      : globalThis.clickRepeaterProjectIcons.mouseLeft;
    const svgIcon = icon.querySelector("svg");
    if (svgIcon) {
      svgIcon.style.width = `${CHECK_ICON_SIZE}px`;
      svgIcon.style.height = `${CHECK_ICON_SIZE}px`;
      svgIcon.style.fill = group.kind === "keyboard" ? "none" : "#ffffff";
      svgIcon.style.stroke = CHECK_BLUE;
      svgIcon.style.strokeWidth = "2";
      svgIcon.style.filter = "drop-shadow(0 1px 2px rgba(1,34,146,0.24))";
      if (group.kind === "keyboard") {
        const keyboardBody = svgIcon.querySelector("rect");
        if (keyboardBody) {
          keyboardBody.style.fill = "#ffffff";
        }
      }
    }

    const label = document.createElement("span");
    label.style.cssText = [
      "display:inline-flex",
      "align-items:center",
      "justify-content:center",
      "min-width:14px",
      "height:16px",
      "padding:1px 4px",
      "border-radius:8px",
      "background:#ffffff",
      "box-shadow:0 1px 4px rgba(1,34,146,0.25)",
      "box-sizing:border-box"
    ].join(";");
    label.textContent = makeCheckRangeLabel(group.startIndex, group.endIndex);

    item.append(icon, label);
    overlay.append(item);
  }

  return overlay;
}

function removeCheckOverlay() {
  const current = document.getElementById(CHECK_OVERLAY_ID);
  if (current) {
    current.remove();
  }
  checkOverlayState.isActive = false;
  checkOverlayState.clickId = null;
}

function renderCheckOverlay(payload) {
  removeCheckOverlay();
  const steps = Array.isArray(payload?.steps) ? payload.steps : [];
  const groups = buildCheckGroups(steps);
  checkOverlayState.isActive = true;
  checkOverlayState.clickId = typeof payload?.clickId === "string" ? payload.clickId : null;

  if (!groups.length) {
    return { ok: true, renderedCount: 0 };
  }

  document.documentElement.append(makeCheckOverlayElement(groups));
  return { ok: true, renderedCount: groups.length };
}

window.addEventListener("pagehide", removeCheckOverlay);
window.addEventListener("resize", () => {
  if (checkOverlayState.isActive) {
    removeCheckOverlay();
  }
});
