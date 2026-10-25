(() => {
  const S = window.SITE;
  const $ = (sel) => document.querySelector(sel);

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  const isVideo = (src) => /\.(mp4|webm|mov)$/i.test(src);

  // ---------- Clock ----------
  function tick() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    $("#lockTime").textContent = time.replace(/\s?[AP]M$/i, "");
    $("#lockDate").textContent = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
    $("#menuClock").textContent = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) + "  " + time;
  }
  tick();
  setInterval(tick, 1000);

  // ---------- Fill content ----------
  document.title = S.name;
  $("#lockBg").style.backgroundImage = `url("${S.lockscreen}")`;
  $("#lockNoteApp").textContent = S.menuName;
  $("#lockNoteTitle").textContent = S.lockNote.title;
  $("#lockNoteText").textContent = S.lockNote.text;
  $("#menuName").textContent = S.menuName;

  const wp = $("#wallpaper");
  if (isVideo(S.wallpaper)) {
    wp.innerHTML = `<video src="${esc(S.wallpaper)}" autoplay muted loop playsinline></video>`;
  } else {
    wp.style.backgroundImage = `url("${S.wallpaper}")`;
  }

  // ---------- Unlock ----------
  const lock = $("#lock");
  const desktop = $("#desktop");
  let unlocked = false;

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    lock.classList.add("unlocked");
    desktop.classList.add("on");
    desktop.setAttribute("aria-hidden", "false");
    setTimeout(() => openApp("about"), 500);
  }

  let startY = null;
  lock.addEventListener("pointerdown", (e) => { startY = e.clientY; });
  lock.addEventListener("pointermove", (e) => {
    if (startY === null) return;
    const dy = Math.min(0, e.clientY - startY);
    lock.style.transition = "none";
    lock.style.transform = `translateY(${dy}px)`;
  });
  lock.addEventListener("pointerup", (e) => {
    if (startY === null) return;
    const dy = e.clientY - startY;
    startY = null;
    lock.style.transition = "";
    lock.style.transform = "";
    if (dy < -80 || Math.abs(dy) < 6) unlock(); // swipe up, or a simple tap/click
  });
  lock.addEventListener("wheel", (e) => { if (e.deltaY > 20) unlock(); });
  document.addEventListener("keydown", (e) => {
    if (!unlocked && ["Enter", " ", "ArrowUp"].includes(e.key)) unlock();
  });

  // ---------- Icons ----------
  const ICONS = {
    notes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 11h12M6 15h12M6 19h8"/></svg>`,
    photos: `<svg viewBox="0 0 24 24">${[["#f87171",0],["#fb923c",45],["#facc15",90],["#4ade80",135],["#2dd4bf",180],["#60a5fa",225],["#a78bfa",270],["#f472b6",315]]
      .map(([c, r]) => `<ellipse cx="12" cy="6.5" rx="3.2" ry="5.5" fill="${c}" opacity=".85" transform="rotate(${r} 12 12)"/>`).join("")}</svg>`,
    projects: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6Z" fill="currentColor"/></svg>`,
    terminal: `&gt;_`,
    instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z"/></svg>`,
    github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>`
  };

  // ---------- Apps ----------
  const APPS = {
    about: {
      label: "About Me", icon: "notes", title: "About — " + S.name,
      render: () => `
        <div class="about">
          <div class="about-head">
            <img src="${esc(S.avatar || S.lockscreen)}" alt="${esc(S.name)}">
            <div><h1>${esc(S.headline)}</h1><div class="tag">${esc(S.tagline)}</div></div>
          </div>
          ${S.bio.map((p) => `<p>${rich(p)}</p>`).join("")}
        </div>`
    },
    photos: {
      label: "Photos", icon: "photos", title: "Photos",
      render: () => `<div class="photos">${S.photos.map((p) => `<img src="${esc(p)}" alt="" loading="lazy">`).join("")}</div>`,
      mount: (body) => body.querySelectorAll("img").forEach((img) => img.addEventListener("click", () => {
        const v = document.createElement("div");
        v.className = "viewer";
        v.innerHTML = `<img src="${img.src}" alt="">`;
        v.onclick = () => v.remove();
        document.body.appendChild(v);
      }))
    },
    projects: {
      label: "Projects", icon: "projects", title: "Projects",
      render: () => S.projects.length
        ? S.projects.map((p) => `<a class="project" href="${esc(p.url || "#")}" target="_blank" rel="noopener"><strong>${esc(p.title)}</strong><p>${esc(p.description || "")}</p></a>`).join("")
        : `<div class="empty"><div class="big">🚧</div>Projects are being built right now.<br>Follow along on <a href="${esc(S.socials.github)}" target="_blank" rel="noopener">GitHub</a>.</div>`
    },
    terminal: {
      label: "Terminal", icon: "terminal", title: "hassan — zsh", cls: "term",
      render: () => `<div class="out">Type <span class="p">help</span> to see commands.</div><div id="termLog"></div>
        <label class="term-line"><span class="p">${esc(S.menuName)}@mac ~ %</span><input autocomplete="off" spellcheck="false" aria-label="Terminal input"></label>`,
      mount: (body) => {
        const input = body.querySelector("input");
        const log = body.querySelector("#termLog");
        const cmds = {
          help: "whoami · about · skills · socials · goals · clear",
          whoami: `${S.name} — ${S.tagline}`,
          about: S.bio[0],
          skills: "HTML · CSS · JavaScript · AI tools · learning by building",
          goals: "Build full-stack apps and AI-driven systems that solve real problems.",
          socials: Object.entries(S.socials).map(([k, v]) => `${k}: ${v}`).join("\n")
        };
        input.addEventListener("keydown", (e) => {
          if (e.key !== "Enter") return;
          const c = input.value.trim().toLowerCase();
          input.value = "";
          if (c === "clear") { log.innerHTML = ""; return; }
          const out = c ? (cmds[c] || `command not found: ${c}`) : "";
          log.insertAdjacentHTML("beforeend", `<div><span class="p">%</span> ${esc(c)}</div>${out ? `<div class="out">${esc(out)}</div>` : ""}`);
          body.scrollTop = body.scrollHeight;
        });
        body.addEventListener("click", () => input.focus());
        setTimeout(() => input.focus(), 50);
      }
    }
  };

  const LINKS = {
    instagram: { label: "Instagram" },
    x: { label: "X" },
    github: { label: "GitHub" }
  };

  // ---------- Windows ----------
  const open = {};
  let z = 10;
  let cascade = 0;

  function focusWin(win) { win.style.zIndex = ++z; }

  function openApp(id) {
    if (open[id]) { focusWin(open[id]); return; }
    const app = APPS[id];
    const win = document.createElement("section");
    win.className = "win" + (app.cls ? " " + app.cls : "");
    win.innerHTML = `
      <div class="win-bar">
        <button class="win-btn close" aria-label="Close"></button>
        <button class="win-btn min" aria-label="Minimize"></button>
        <button class="win-btn max" aria-label="Maximize"></button>
        <div class="win-title">${esc(app.title)}</div>
      </div>
      <div class="win-body">${app.render()}</div>`;
    $("#windows").appendChild(win);

    const w = win.offsetWidth, h = win.offsetHeight;
    const off = (cascade++ % 5) * 28;
    win.style.left = Math.max(8, (innerWidth - w) / 2 - 60 + off) + "px";
    win.style.top = Math.max(40, (innerHeight - h) / 2 - 40 + off) + "px";
    focusWin(win);

    const close = () => {
      win.classList.add("closing");
      setTimeout(() => win.remove(), 180);
      delete open[id];
      setRunning();
    };
    win.querySelector(".close").onclick = close;
    win.querySelector(".min").onclick = close;
    win.querySelector(".max").onclick = () => win.classList.toggle("maxed");
    win.addEventListener("pointerdown", () => focusWin(win));
    makeDraggable(win, win.querySelector(".win-bar"));

    if (app.mount) app.mount(win.querySelector(".win-body"));
    open[id] = win;
    setRunning();
  }

  function makeDraggable(win, handle) {
    let sx, sy, ox, oy, dragging = false;
    handle.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".win-btn") || innerWidth <= 640) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ox = win.offsetLeft; oy = win.offsetTop;
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const x = Math.min(innerWidth - 80, Math.max(-win.offsetWidth + 80, ox + e.clientX - sx));
      const y = Math.min(innerHeight - 60, Math.max(28, oy + e.clientY - sy));
      win.style.left = x + "px";
      win.style.top = y + "px";
    });
    handle.addEventListener("pointerup", () => { dragging = false; });
  }

  // ---------- Dock ----------
  const dock = $("#dock");

  function dockItem(key, label, iconKey, onClick, href) {
    const el = document.createElement(href ? "a" : "button");
    el.className = "dock-item";
    el.dataset.app = key;
    if (href) { el.href = href; el.target = "_blank"; el.rel = "noopener"; }
    else el.onclick = onClick;
    el.setAttribute("aria-label", label);
    el.innerHTML = `<span class="dock-label">${esc(label)}</span><span class="dock-icon ic-${iconKey}">${ICONS[iconKey]}</span><span class="dock-dot"></span>`;
    dock.appendChild(el);
  }

  Object.entries(APPS).forEach(([id, app]) => dockItem(id, app.label, app.icon, () => openApp(id)));
  const sep = document.createElement("span");
  sep.className = "dock-sep";
  dock.appendChild(sep);
  Object.entries(S.socials).forEach(([k, url]) => {
    if (url && LINKS[k]) dockItem(k, LINKS[k].label, k, null, url);
  });

  function setRunning() {
    dock.querySelectorAll(".dock-item").forEach((el) => el.classList.toggle("running", !!open[el.dataset.app]));
  }

  // Magnify neighbours on hover
  const items = [...dock.querySelectorAll(".dock-item")];
  items.forEach((el, i) => {
    el.addEventListener("mouseenter", () => items.forEach((o, j) => {
      const d = Math.abs(i - j);
      o.classList.toggle("mag2", d === 0);
      o.classList.toggle("mag1", d === 1);
    }));
  });
  dock.addEventListener("mouseleave", () => items.forEach((o) => o.classList.remove("mag1", "mag2")));
})();
