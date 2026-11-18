const tours = {
  instance: [
    ["A request from the workspace portal reaches the HTTPS gateway. The gateway routes it to the web API, where the platform can check who is making the request.", "gateway", "M222 84 H295"],
    ["The API resolves the user’s company and records the task in PostgreSQL. Row-level policies keep the task within that company’s workspace.", "web", "M488 86 H550"],
    ["PostgreSQL signals that work is ready. The leader worker picks up the task in the background while the web API continues serving the portal.", "worker", "M647 122 V198"],
    ["The worker requests a lease for the run. The runner controller holds the Kubernetes permissions needed to provision the execution environment.", "control", "M759 244 H848"],
    ["The controller prepares an isolated runner for the assigned agent. The runner receives a scoped workspace and only the tools permitted for the job.", "task", "M957 285 V334 H706 V376"],
    ["Once provisioned, the isolated agent runner sends its request through Agent Connect, carrying the context of the current workspace and run.", "exec-connect", "M603 421 H499 V514 H128 V707"],
    ["The gateway is the entry point. Workspace policy determines which execution capabilities the agent can use for this request.", "exec-gateway", "M234 749 H310"],
    ["For agent execution, the platform invokes the configured adapter. Claude Code, Codex, Gemini and Hermes are examples of supported runtimes.", "exec-adapter", "M505 749 H570 V645 H656"],
    ["For an LLM call, the platform selects the model and provider configured for the workspace and sends the inference request.", "exec-llm", "M505 749 H656"],
    ["For a connected tool, the MCP proxy checks the agent’s permissions and forwards the call to the authorised workspace server.", "exec-mcp", "M505 749 H570 V853 H656"]
  ],
  run: [
    ["A weekly schedule triggers the data-quality brief. Once the schedule and agent are configured, the task can start without someone opening a chat.", "scope", "M100 119 V174"],
    ["The worker dispatches the brief to the analyst agent. Its assignment determines who owns the output and which budget applies to the run.", "dispatch", "M225 220 H296"],
    ["The analyst retrieves permitted context and uses its approved tools to prepare the brief. Tenant and agent permissions determine which records it can draw on.", "runner", "M514 220 H584"],
    ["The analyst submits the brief with its supporting validation results. The server checks the recorded outcomes for this run before the task can advance as verified work.", "proof", "M823 220 H890"],
    ["The reviewer compares the brief with the underlying results. If an anomaly count lacks support, the reviewer can request a correction or escalate the decision to an operator.", "review", "M989 275 V342"],
    ["In this example, sharing the brief requires human approval. The operator can inspect the draft and its review evidence before authorizing release.", "operator", "M990 425 V478"],
    ["Once approved, the workflow can release the brief. The run record keeps the checks, usage and review decision together for the operator to inspect later.", "audit", "M883 514 H650 V430 M539 385 H478"]
  ]
};
const panels = [...document.querySelectorAll(".plate")];
const stepDuration = 9500;
const ns = "http://www.w3.org/2000/svg";
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const video = document.querySelector(".film video");
if (!reduced.matches) video.play().catch(() => {});

function initialise(panel) {
  const object = panel.querySelector("object");
  const controls = panel.querySelector(".controls");
  const play = controls.querySelector(".play");
  const steps = tours[panel.id];
  const output = panel.querySelector("output");
  const zoom = controls.querySelector(".zoom");
  zoom.addEventListener("click", () => {
    const enlarged = panel.classList.toggle("enlarged");
    zoom.setAttribute("aria-pressed", String(enlarged));
    zoom.title = enlarged ? "Fit diagram" : "Enlarge diagram";
    zoom.setAttribute("aria-label", zoom.title);
    if (!enlarged) panel.querySelector(".paper").scrollLeft = 0;
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
    output.textContent = (index + 1) + " / " + steps.length + "   " + caption;
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
  let timer;
  let visible = false;
  let manualPause = reduced.matches;
  let remaining = stepDuration;
  let startedAt = 0;
  const drawing = () => object.contentDocument?.documentElement;
  function pause() {
    if (timer !== undefined) {
      clearTimeout(timer);
      remaining = Math.max(1, remaining - (performance.now() - startedAt));
      timer = undefined;
    }
    drawing()?.pauseAnimations?.();
    play.title = "Play flow";
    play.setAttribute("aria-label", play.title);
  }
  function sync() {
    if (!visible || panel.hidden || document.hidden || manualPause || controls.hidden) {
      pause();
      return;
    }
    if (timer !== undefined) return;
    drawing()?.unpauseAnimations?.();
    if (index < 0) step();
    output.setAttribute("aria-live", "off");
    play.title = "Pause";
    play.setAttribute("aria-label", play.title);
    startedAt = performance.now();
    timer = setTimeout(() => {
      timer = undefined;
      remaining = stepDuration;
      step();
      sync();
    }, remaining);
  }
  function toggle() { manualPause = timer !== undefined; sync(); }
  function ready() {
    const doc = object.contentDocument;
    if (doc?.documentElement.localName !== "svg" || doc.getElementById("tour-style")) return;
    const style = doc.createElementNS(ns, "style");
    style.id = "tour-style";
    style.textContent = "svg{cursor:pointer}.lit path{stroke:#154eb0;stroke-width:4}.lit text{fill:#154eb0;font-weight:bold}";
    doc.documentElement.append(style);
    doc.addEventListener("click", toggle);
    controls.hidden = false;
    sync();
  }
  object.addEventListener("load", ready);
  ready();
  play.addEventListener("click", toggle);
  controls.querySelector(".next").addEventListener("click", () => {
    manualPause = true;
    output.setAttribute("aria-live", "polite");
    pause();
    step();
    remaining = stepDuration;
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }, {threshold: 0.15}).observe(object);
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", () => { manualPause = reduced.matches; sync(); });
}
panels.forEach(initialise);
