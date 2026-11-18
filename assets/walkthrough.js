const stepList = document.querySelector(".steps");
const tabs = Array.from(stepList.querySelectorAll("[data-step]"));
const panels = tabs.map(tab => document.getElementById(tab.dataset.step));

stepList.setAttribute("role", "tablist");
tabs.forEach((tab, index) => {
  const panel = panels[index];
  tab.id = "tab-" + tab.dataset.step;
  tab.setAttribute("role", "tab");
  tab.setAttribute("aria-controls", panel.id);
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", tab.id);

  tab.addEventListener("click", event => {
    event.preventDefault();
    selectStep(index);
  });
});

function selectStep(index, focus = false) {
  tabs.forEach((tab, position) => {
    const selected = position === index;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    panels[position].hidden = !selected;
    panels[position].tabIndex = selected ? 0 : -1;
  });

  if (focus) tabs[index].focus();
}

stepList.addEventListener("keydown", event => {
  const index = tabs.indexOf(event.target);
  if (index === -1) return;

  let next;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    next = (index + 1) % tabs.length;
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    next = (index + tabs.length - 1) % tabs.length;
  } else if (event.key === "Home") {
    next = 0;
  } else if (event.key === "End") {
    next = tabs.length - 1;
  } else if (event.key === " ") {
    event.preventDefault();
    selectStep(index);
    return;
  } else {
    return;
  }

  event.preventDefault();
  selectStep(next, true);
});

function readHash() {
  const requested = panels.findIndex(panel => "#" + panel.id === location.hash);
  if (requested >= 0) selectStep(requested);
}

selectStep(0);
readHash();
window.addEventListener("hashchange", readHash);

const diagram = document.querySelector(".system-map");
const replay = diagram.querySelector(".replay");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function playFlow() {
  diagram.classList.remove("flow-ready");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!reducedMotion.matches) diagram.classList.add("flow-ready");
    });
  });
}

function syncMotionPreference() {
  replay.hidden = reducedMotion.matches;
  if (reducedMotion.matches) diagram.classList.remove("flow-ready");
}

syncMotionPreference();
reducedMotion.addEventListener("change", syncMotionPreference);
replay.addEventListener("click", playFlow);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      playFlow();
      observer.disconnect();
    }
  });
  observer.observe(diagram);
}
