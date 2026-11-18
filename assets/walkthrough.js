const tours = {
  instance: [
    ["The portal opens a workspace request.", "gateway", "M222 84 H295"],
    ["The web API resolves the workspace and records the task.", "web", "M488 86 H550"],
    ["A database notification wakes the leader worker.", "worker", "M647 122 V198"],
    ["The worker requests an execution lease.", "control", "M759 244 H848"],
    ["The controller provisions an isolated runner.", "task", "M957 285 V334 H706 V376"],
    ["The runner uses the model and tools selected for this job.", "models", "M606 453 H529 V534 H363"]
  ],
  run: [
    ["A schedule starts the weekly quality brief.", "scope", "M100 119 V174"],
    ["The worker assigns the analyst and applies its budget.", "dispatch", "M225 220 H296"],
    ["The runner uses scoped context and approved tools.", "runner", "M514 220 H584"],
    ["The server checks the evidence attached to this run.", "proof", "M823 220 H890"],
    ["Passing checks advance the brief to its review policy.", "review", "M989 275 V342"],
    ["This example requires an operator to approve release.", "operator", "M990 425 V478"],
    ["Approval releases the result and preserves the checks and usage.", "audit", "M883 514 H650 V430 M539 385 H478"]
  ]
};
const panels = [...document.querySelectorAll(".plate")];
const tabs = [...document.querySelectorAll(".views a")];
const ns = "http://www.w3.org/2000/svg";
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let timer;
function stop() {
  clearTimeout(timer);
  timer = undefined;
  document.querySelectorAll(".play").forEach(button => { button.textContent = "Play flow"; });
}
function initialise(panel) {
  const object = panel.querySelector("object");
  const controls = panel.querySelector(".controls");
  const play = controls.querySelector(".play");
  const steps = tours[panel.id];
  const zoom = document.createElement("button");
  zoom.type = "button";
  zoom.className = "zoom";
  zoom.textContent = "Enlarge labels";
  zoom.setAttribute("aria-pressed", "false");
  controls.insertBefore(zoom, controls.querySelector("output"));
  zoom.addEventListener("click", () => {
    const enlarged = panel.classList.toggle("enlarged");
    zoom.setAttribute("aria-pressed", String(enlarged));
    zoom.textContent = enlarged ? "Fit diagram" : "Enlarge labels";
  });
  let index = -1;
  function step() {
    const doc = object.contentDocument;
    if (doc?.documentElement.localName !== "svg") return;
    index = (index + 1) % steps.length;
    const [caption, id, path] = steps[index];
    doc.querySelector(".lit")?.classList.remove("lit");
    doc.getElementById("signal")?.remove();
    const target = doc.getElementById(id);
    target.classList.add("lit");
    controls.querySelector("output").textContent = (index + 1) + " / " + steps.length + "   " + caption;
    if (!reduced.matches) {
      const dot = doc.createElementNS(ns, "circle");
      dot.id = "signal";
      dot.setAttribute("r","6");
      dot.setAttribute("fill","#164eae");
      dot.setAttribute("stroke","white");
      const motion = doc.createElementNS(ns, "animateMotion");
      motion.setAttribute("path", path);
      motion.setAttribute("dur","1.25s");
      motion.setAttribute("begin","indefinite");
      motion.setAttribute("fill","freeze");
      dot.append(motion);
      doc.documentElement.append(dot);
      motion.beginElement();
    }
    const paper = panel.querySelector(".paper");
    if (paper.scrollWidth > paper.clientWidth) {
      const box = target.getBoundingClientRect();
      paper.scrollLeft = box.x + box.width / 2 - paper.clientWidth / 2;
    }
  }
  function advance() {
    step();
    if (index === steps.length - 1) stop();
    else timer = setTimeout(advance, 3000);
  }
  function ready() {
    const doc = object.contentDocument;
    if (doc?.documentElement.localName !== "svg") return;
    const style = doc.createElementNS(ns, "style");
    style.textContent = ".lit path{stroke:#154eb0;stroke-width:4}.lit text{fill:#154eb0;font-weight:bold}";
    doc.documentElement.append(style);
    controls.hidden = false;
  }
  object.addEventListener("load", ready);
  ready();
  play.addEventListener("click", () => {
    if (timer) { stop(); return; }
    play.textContent = "Pause";
    advance();
  });
  controls.querySelector(".next").addEventListener("click", () => { stop(); step(); });
}
function select(index) {
  stop();
  tabs.forEach((tab,i) => {
    tab.setAttribute("aria-selected", String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    panels[i].hidden = i !== index;
  });
}
document.querySelector(".views").setAttribute("role","tablist");
tabs.forEach((tab,i) => {
  const panel = panels[i];
  tab.id = "view-" + panel.id;
  tab.setAttribute("role","tab");
  tab.setAttribute("aria-controls",panel.id);
  panel.setAttribute("role","tabpanel");
  panel.setAttribute("aria-labelledby",tab.id);
  tab.addEventListener("click", e => {
    e.preventDefault(); select(i); history.replaceState(null,"",tab.hash);
  });
  tab.addEventListener("keydown", e => {
    const positions = {ArrowLeft:1-i, ArrowRight:1-i, Home:0, End:tabs.length-1};
    if (!(e.key in positions)) return;
    e.preventDefault();
    const next = positions[e.key];
    select(next); tabs[next].focus(); history.replaceState(null,"",tabs[next].hash);
  });
  initialise(panel);
});
function readHash() {
  const i = tabs.findIndex(tab => tab.hash === location.hash);
  select(i < 0 ? 0 : i);
}
readHash();
window.addEventListener("hashchange",readHash);
document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
