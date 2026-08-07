(() => {
  const VIEWPORT_GAP = 8;
  const OFFSET = 6;
  let tooltip = null;
  let activeTrigger = null;

  function getTooltip() {
    if (tooltip) return tooltip;
    tooltip = document.createElement("div");
    tooltip.className = "viewport-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.hidden = true;
    document.body.append(tooltip);
    return tooltip;
  }

  function tooltipText(trigger) {
    const { tooltip: label, tooltipDetail: detail } = trigger.dataset;
    return detail ? `${label}\n${detail}` : label;
  }

  function positionTooltip() {
    if (!activeTrigger || !tooltip || tooltip.hidden) return;

    const triggerRect = activeTrigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const canShowAbove = triggerRect.top - OFFSET - tooltipRect.height >= VIEWPORT_GAP;
    const preferredTop = canShowAbove
      ? triggerRect.top - OFFSET - tooltipRect.height
      : triggerRect.bottom + OFFSET;
    const top = Math.max(
      VIEWPORT_GAP,
      Math.min(preferredTop, viewportHeight - tooltipRect.height - VIEWPORT_GAP)
    );
    const left = Math.max(
      VIEWPORT_GAP,
      Math.min(
        triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
        viewportWidth - tooltipRect.width - VIEWPORT_GAP
      )
    );

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

  function show(trigger) {
    if (!trigger) return;
    const label = trigger.dataset.tooltip;
    if (!label) return;
    activeTrigger = trigger;
    const element = getTooltip();
    element.textContent = tooltipText(trigger);
    element.hidden = false;
    positionTooltip();
  }

  function hide(trigger) {
    if (trigger && trigger !== activeTrigger) return;
    activeTrigger = null;
    if (tooltip) tooltip.hidden = true;
  }

  function findTrigger(target) {
    return target instanceof Element ? target.closest("[data-tooltip]") : null;
  }

  document.addEventListener("pointerover", (event) => show(findTrigger(event.target)));
  document.addEventListener("pointerout", (event) => {
    const trigger = findTrigger(event.target);
    if (trigger && !trigger.contains(event.relatedTarget)) hide(trigger);
  });
  document.addEventListener("focusin", (event) => show(findTrigger(event.target)));
  document.addEventListener("focusout", (event) => {
    const trigger = findTrigger(event.target);
    if (trigger && !trigger.contains(event.relatedTarget)) hide(trigger);
  });
  window.addEventListener("resize", positionTooltip);
  document.addEventListener("scroll", positionTooltip, true);

  document.body.classList.add("viewport-tooltips-ready");
})();
