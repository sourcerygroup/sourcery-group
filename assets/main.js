/* Sourcery Group — sigil + inquiry form */
(() => {
  "use strict";

  /* ---------------- Sigil ----------------
     A summoning circle drawn like a circuit board.
     The outer ring encodes "SOURCERY GROUP" in binary:
     long tick = 1, dot = 0. */
  const svg = document.getElementById("sigil");
  if (svg) {
    const NS = "http://www.w3.org/2000/svg";
    const C = 500;
    const TAU = Math.PI * 2;

    // tiny seeded PRNG so the sigil is the same on every visit
    let seed = 0x50c3e7;
    const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

    const el = (tag, attrs, parent = svg) => {
      const n = document.createElementNS(NS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      parent.appendChild(n);
      return n;
    };
    const pt = (r, a) => [C + r * Math.cos(a), C + r * Math.sin(a)];
    const f = (n) => n.toFixed(2);
    const circle = (r, cls, delay, parent) =>
      el("circle", { cx: C, cy: C, r, pathLength: 1, class: `s draw ${cls || ""}`, style: `animation-delay:${delay}s` }, parent);

    // ---- outer binary ring (slow rotation)
    const ring = el("g", { class: "spin" });
    circle(478, "faint", 0, ring);
    circle(462, "", 0.1, ring);
    circle(440, "faint", 0.2, ring);

    const word = "SOURCERY GROUP";
    const slots = [];
    for (const ch of word) {
      const bits = ch.charCodeAt(0).toString(2).padStart(8, "0");
      for (const b of bits) slots.push(b);
      slots.push("|"); // separator between letters
    }
    slots.forEach((b, i) => {
      const a = (i / slots.length) * TAU - Math.PI / 2;
      const delay = 1.4 + (i / slots.length) * 1.2;
      const style = `animation-delay:${f(delay)}s`;
      if (b === "1") {
        const [x1, y1] = pt(445, a), [x2, y2] = pt(457, a);
        el("line", { x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2), class: "s fade", style }, ring);
      } else if (b === "0") {
        const [x, y] = pt(451, a);
        el("circle", { cx: f(x), cy: f(y), r: 2, class: "dot fade", style }, ring);
      } else {
        const [x, y] = pt(451, a);
        el("rect", { x: f(x - 3), y: f(y - 3), width: 6, height: 6, class: "dot v fade", style, transform: `rotate(${f((a * 180) / Math.PI + 45)} ${f(x)} ${f(y)})` }, ring);
      }
    });

    // ---- heptagram {7/3} (counter-rotation)
    const star = el("g", { class: "spin-rev" });
    const verts = Array.from({ length: 7 }, (_, i) => pt(428, (i / 7) * TAU - Math.PI / 2));
    let d = "";
    for (let i = 0; i <= 7; i++) {
      const [x, y] = verts[(i * 3) % 7];
      d += `${i ? "L" : "M"}${f(x)} ${f(y)}`;
    }
    el("path", { d: d + "Z", pathLength: 1, class: "s draw", style: "animation-delay:.35s" }, star);
    verts.forEach(([x, y], i) =>
      el("circle", { cx: f(x), cy: f(y), r: 7, pathLength: 1, class: "s v draw", style: `animation-delay:${f(1.1 + i * 0.08)}s` }, star)
    );

    // ---- inner circles
    circle(300, "", 0.7);
    circle(214, "faint", 0.9);
    circle(122, "", 1.0);

    // ---- circuit traces between the inner circles
    const traces = 14;
    for (let i = 0; i < traces; i++) {
      const a0 = (i / traces) * TAU + rand() * 0.12;
      const r1 = 140 + rand() * 50;
      const bend = (rand() < 0.5 ? -1 : 1) * (0.06 + rand() * 0.1);
      const r2 = r1 + 28 + rand() * 30;
      const r3 = Math.min(r2 + 20 + rand() * 50, 284);
      const p = [pt(122, a0), pt(r1, a0), pt(r2, a0 + bend), pt(r3, a0 + bend)];
      const path = p.map(([x, y], j) => `${j ? "L" : "M"}${f(x)} ${f(y)}`).join("");
      const delay = 1.2 + i * 0.05;
      el("path", { d: path, pathLength: 1, class: "s draw", style: `animation-delay:${f(delay)}s` });
      const [vx, vy] = p[3];
      el("circle", { cx: f(vx), cy: f(vy), r: 5, class: "dot v fade", style: `animation-delay:${f(delay + 1)}s` });
    }

    // ---- core: the blinking cursor at the centre of the circle
    circle(54, "v", 1.6);
    el("rect", { x: C - 7, y: C - 24, width: 14, height: 48, class: "dot core" });
  }

  /* ---------------- Inquiry form (Web3Forms) ---------------- */
  const form = document.getElementById("inquiry");
  if (form) {
    const status = document.getElementById("form-status");
    const button = form.querySelector('button[type="submit"]');
    const say = (msg, kind) => { status.textContent = msg; status.className = `form-status ${kind || ""}`; };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // validate
      let firstBad = null;
      form.querySelectorAll("[required]").forEach((f) => {
        const bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
        f.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) {
        say("Add your name, a valid email and a short message, then send again.", "err");
        firstBad.focus();
        return;
      }

      const data = Object.fromEntries(new FormData(form));
      if (data.botcheck) return; // honeypot tripped: quietly do nothing

      if (!data.access_key || data.access_key.startsWith("YOUR_")) {
        say("This form isn't connected yet. Add a Web3Forms access key in index.html to start receiving inquiries.", "err");
        return;
      }

      button.disabled = true;
      button.textContent = "Sending…";
      say("");

      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.success) {
          form.reset();
          say("Inquiry sent. We'll be in touch within a few business days.", "ok");
        } else {
          say(json.message ? `Inquiry not sent: ${json.message}` : "Inquiry not sent. Try again in a moment.", "err");
        }
      } catch {
        say("Inquiry not sent: couldn't reach the server. Check your connection and try again.", "err");
      } finally {
        button.disabled = false;
        button.textContent = "Send inquiry";
      }
    });
  }

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
