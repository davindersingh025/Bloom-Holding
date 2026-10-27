/* Tabs with a sliding indicator. ARIA tabs pattern, arrow-key navigation. */

export function tabsMarkup(id, tabs, active) {
  return `
    <div class="tabs" role="tablist" aria-label="Sections" data-tabs="${id}">
      ${tabs.map((tb) => `
        <button class="tab" role="tab" id="${id}-tab-${tb.id}" aria-controls="${id}-panel-${tb.id}"
          aria-selected="${tb.id === active}" tabindex="${tb.id === active ? 0 : -1}" data-tab="${tb.id}">${tb.label}</button>`).join("")}
      <span class="tabs__ink" aria-hidden="true"></span>
    </div>`;
}

export function wireTabs(root, id, onChange) {
  const list = root.querySelector(`[data-tabs="${id}"]`);
  const tabs = [...list.querySelectorAll("[data-tab]")];
  const ink = list.querySelector(".tabs__ink");

  const moveInk = (tab) => {
    ink.style.width = `${tab.offsetWidth}px`;
    ink.style.transform = `translateX(${tab.offsetLeft}px)`;
  };

  const select = (tab, focus = true) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = root.querySelector(`#${t.getAttribute("aria-controls")}`);
      if (panel) {
        panel.hidden = !on;
        if (on) { panel.classList.remove("is-entering"); void panel.offsetWidth; panel.classList.add("is-entering"); }
      }
    });
    moveInk(tab);
    if (focus) tab.focus();
    onChange?.(tab.dataset.tab);
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => select(tab)));
  list.addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const rtl = document.documentElement.dir === "rtl";
    const fwd = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    if (e.key === fwd) { e.preventDefault(); select(tabs[(i + 1) % tabs.length]); }
    if (e.key === back) { e.preventDefault(); select(tabs[(i - 1 + tabs.length) % tabs.length]); }
    if (e.key === "Home") { e.preventDefault(); select(tabs[0]); }
    if (e.key === "End") { e.preventDefault(); select(tabs[tabs.length - 1]); }
  });

  const current = () => tabs.find((t) => t.getAttribute("aria-selected") === "true");
  requestAnimationFrame(() => moveInk(current()));
  document.fonts?.ready.then(() => moveInk(current()));
  const onResize = () => {
    if (!document.contains(list)) { removeEventListener("resize", onResize); return; }
    moveInk(current());
  };
  addEventListener("resize", onResize);
}
