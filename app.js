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

  // ---------- Music ----------
  // Browsers only allow sound after a click/tap/key, so it starts on unlock.
  const M = S.music || {};
  const musicBtn = $("#musicBtn");
  let audio = null;
  let fadeId = 0;

  function fadeTo(target, ms) {
    const id = ++fadeId; // a newer fade cancels this one
    const start = audio.volume, t0 = performance.now();
    const step = (t) => {
      if (id !== fadeId) return;
      const k = Math.min(1, (t - t0) / ms);
      audio.volume = start + (target - start) * k;
      if (k < 1) requestAnimationFrame(step);
      else if (target === 0) audio.pause();
    };
    requestAnimationFrame(step);
  }

  function setMusicUI(playing) {
    musicBtn.classList.toggle("paused", !playing);
    musicBtn.setAttribute("aria-label", playing ? "Pause music" : "Play music");
  }

  function playMusic() {
    audio.volume = 0;
    audio.play().then(() => { fadeTo(M.volume ?? 0.35, 2500); setMusicUI(true); })
      .catch(() => {
        // Blocked (e.g. unlocked by scrolling) — start on the next click instead
        setMusicUI(false);
        document.addEventListener("pointerdown", (e) => { if (!e.target.closest("#musicBtn")) playMusic(); }, { once: true });
      });
  }

  function startMusic() {
    if (!M.src) return;
    audio = new Audio(M.src);
    audio.loop = true;
    $("#musicTitle").textContent = M.title || "";
    musicBtn.title = M.credit || (M.title ? "Now playing: " + M.title : "Music");
    musicBtn.hidden = false;
    musicBtn.onclick = () => {
      if (audio.paused || musicBtn.classList.contains("paused")) playMusic();
      else { fadeTo(0, 600); setMusicUI(false); }
    };
    playMusic();
  }

  function unlock(firstApp = "about") {
    if (unlocked) return;
    unlocked = true;
    startMusic();
    lock.classList.add("unlocked");
    desktop.classList.add("on");
    desktop.setAttribute("aria-hidden", "false");
    setTimeout(() => openApp(firstApp), 500);
  }

  let startY = null;
  lock.addEventListener("pointerdown", (e) => { startY = e.target.closest(".lock-act") ? null : e.clientY; });
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
    if (dy < -80) unlock();
    else if (Math.abs(dy) < 6) unlock(e.target.closest("#lockNote") ? "notes" : "about"); // tap the note → Notes app
  });
  lock.addEventListener("wheel", (e) => { if (e.deltaY > 20) unlock(); });
  document.addEventListener("keydown", (e) => {
    if (!unlocked && !e.target.closest("button, .cam") && ["Enter", " ", "ArrowUp"].includes(e.key)) unlock();
  });

  // ---------- Torch ----------
  // Websites can only switch on the real flashlight in Chrome on Android.
  // Everywhere else the screen itself lights up white.
  const torchBtn = $("#torchBtn");
  const screenTorch = $("#screenTorch");
  let torchTrack = null;

  function setTorchUI(on) {
    torchBtn.classList.toggle("on", on);
    torchBtn.setAttribute("aria-pressed", on);
  }

  async function torchOn() {
    if (/Android/i.test(navigator.userAgent) && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const track = stream.getVideoTracks()[0];
        if (track.getCapabilities?.().torch) {
          await track.applyConstraints({ advanced: [{ torch: true }] });
          torchTrack = track;
          setTorchUI(true);
          return;
        }
        track.stop();
      } catch { /* no permission or no torch — fall back to the screen */ }
    }
    screenTorch.hidden = false;
    setTorchUI(true);
  }

  function torchOff() {
    if (torchTrack) { torchTrack.stop(); torchTrack = null; }
    screenTorch.hidden = true;
    setTorchUI(false);
  }

  torchBtn.addEventListener("click", () => (torchBtn.classList.contains("on") ? torchOff() : torchOn()));
  screenTorch.addEventListener("click", torchOff);

  // ---------- Camera ----------
  // Everything happens inside the visitor's browser; the photo is never uploaded.
  const cam = $("#cam");
  const camVideo = $("#camVideo");
  const camShot = $("#camShot");
  const camMsg = $("#camMsg");
  let camStream = null;
  let facing = "user";
  let shotBlob = null;

  function camShow(msg) {
    camMsg.textContent = msg;
    camMsg.hidden = !msg;
  }

  async function camStart() {
    camStop();
    camShow("");
    try {
      camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false });
      camVideo.srcObject = camStream;
      camVideo.classList.toggle("mirror", facing === "user");
    } catch (err) {
      camShow(err && err.name === "NotAllowedError"
        ? "Camera permission was blocked. Allow camera access in your browser settings and try again."
        : "No camera was found on this device.");
    }
  }

  function camStop() {
    if (camStream) camStream.getTracks().forEach((t) => t.stop());
    camStream = null;
  }

  function camReview(show) {
    $("#camLive").hidden = show;
    $("#camReview").hidden = !show;
    camShot.hidden = !show;
    camVideo.hidden = show;
  }

  function camOpen() {
    if (torchBtn.classList.contains("on")) torchOff();
    cam.hidden = false;
    camReview(false);
    if (!navigator.mediaDevices?.getUserMedia) { camShow("This browser can't open the camera."); return; }
    camStart();
  }

  function camClose() {
    camStop();
    cam.hidden = true;
    if (camShot.src) URL.revokeObjectURL(camShot.src);
    shotBlob = null;
  }

  function takePhoto() {
    if (!camStream || !camVideo.videoWidth) return;
    const w = camVideo.videoWidth, h = camVideo.videoHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (facing === "user") { ctx.translate(w, 0); ctx.scale(-1, 1); } // save selfies the way they looked
    ctx.drawImage(camVideo, 0, 0, w, h);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Small watermark with the site address
    const size = Math.max(14, Math.round(w / 40));
    ctx.font = `600 ${size}px Inter, sans-serif`;
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = size / 2;
    ctx.fillText(location.hostname.replace(/^www\./, "") || "iamhassan.online", w - size, h - size);
    canvas.toBlob((blob) => {
      shotBlob = blob;
      camShot.src = URL.createObjectURL(blob);
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      $("#camShare").hidden = !(navigator.canShare && navigator.canShare({ files: [file] }));
      camReview(true);
    }, "image/jpeg", 0.92);
  }

  $("#cameraBtn").addEventListener("click", camOpen);
  $("#camClose").addEventListener("click", camClose);
  $("#camShutter").addEventListener("click", takePhoto);
  $("#camFlip").addEventListener("click", () => { facing = facing === "user" ? "environment" : "user"; camStart(); });
  $("#camRetake").addEventListener("click", () => camReview(false));
  $("#camSave").addEventListener("click", () => {
    if (!shotBlob) return;
    const a = document.createElement("a");
    a.href = camShot.src;
    a.download = "selfie-" + Date.now() + ".jpg";
    a.click();
  });
  $("#camShare").addEventListener("click", () => {
    if (!shotBlob) return;
    navigator.share({ files: [new File([shotBlob], "selfie.jpg", { type: "image/jpeg" })] }).catch(() => {});
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !cam.hidden) camClose(); });

  // ---------- Icons ----------
  const ICONS = {
    notes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 11h12M6 15h12M6 19h8"/></svg>`,
    photos: `<svg viewBox="0 0 24 24">${[["#f87171",0],["#fb923c",45],["#facc15",90],["#4ade80",135],["#2dd4bf",180],["#60a5fa",225],["#a78bfa",270],["#f472b6",315]]
      .map(([c, r]) => `<ellipse cx="12" cy="6.5" rx="3.2" ry="5.5" fill="${c}" opacity=".85" transform="rotate(${r} 12 12)"/>`).join("")}</svg>`,
    projects: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6Z" fill="currentColor"/></svg>`,
    terminal: `&gt;_`,
    message: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.4 6.1-.2 1.4-.9 2.7-1.9 3.6 2.1 0 3.9-.7 5.2-1.7.99.3 2.1.4 3.3.4 5.5 0 10-3.6 10-8s-4.5-8-10-8Z"/></svg>`,
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>`,
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
          ${S.music && S.music.credit ? `<p class="credit">${esc(S.music.credit)}</p>` : ""}
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
    notes: {
      label: "Leave a Note", icon: "message", title: "Leave a Note",
      render: () => {
        const N = S.notes || {};
        return `
        <div class="msg">
          <h2>Leave ${esc(S.name.split(" ")[0])} a note ✍️</h2>
          <p class="sub">Say hi, share feedback, ask a question or pitch an idea. It comes straight to me.</p>
          <input class="msg-name" maxlength="60" placeholder="Your name (optional)" autocomplete="name">
          <textarea class="msg-text" maxlength="1000" rows="5" placeholder="Write your message…"></textarea>
          <div class="msg-row">
            ${N.instagram ? `<button class="btn primary" data-send="instagram">Send on Instagram</button>` : ""}
            ${N.email ? `<button class="btn" data-send="email">Send by email</button>` : ""}
          </div>
          <p class="msg-status" role="status"></p>
        </div>`;
      },
      mount: (body) => {
        const N = S.notes || {};
        const status = body.querySelector(".msg-status");
        body.querySelectorAll("[data-send]").forEach((btn) => btn.addEventListener("click", () => {
          const text = body.querySelector(".msg-text").value.trim();
          const name = body.querySelector(".msg-name").value.trim();
          if (!text) { status.textContent = "Write a message first 🙂"; body.querySelector(".msg-text").focus(); return; }
          const full = text + (name ? `\n\n— ${name}` : "");
          if (btn.dataset.send === "email") {
            location.href = `mailto:${N.email}?subject=${encodeURIComponent("A note from your portfolio" + (name ? " — " + name : ""))}&body=${encodeURIComponent(full)}`;
            status.textContent = "Your email app should open with the message ready to send.";
            return;
          }
          // Instagram can't pre-fill a DM, so copy the message and open the chat
          window.open(`https://ig.me/m/${encodeURIComponent(N.instagram)}`, "_blank", "noopener");
          (navigator.clipboard ? navigator.clipboard.writeText(full) : Promise.reject())
            .then(() => { status.textContent = "Message copied! Paste it into the Instagram chat that just opened."; })
            .catch(() => { status.textContent = "Instagram chat opened — copy your message and paste it there."; });
        }));
      }
    },
    encourage: {
      label: "Encouragement", icon: "sun", title: "Words of Encouragement", cls: "encourage-win",
      render: () => `
        <div class="boost">
          <div class="boost-label">Today's encouragement</div>
          <blockquote class="boost-quote"></blockquote>
          <div class="boost-from">— ${esc(S.name)}</div>
          <div class="msg-row">
            <button class="btn primary" data-act="next">Another one ✨</button>
            <button class="btn" data-act="copy">Copy</button>
          </div>
        </div>`,
      mount: (body) => {
        const list = S.encouragement || [];
        const q = body.querySelector(".boost-quote");
        const label = body.querySelector(".boost-label");
        let i = Math.floor(Date.now() / 86400000) % list.length; // same one all day
        const show = () => {
          q.classList.remove("in");
          void q.offsetWidth; // restart the fade-in
          q.textContent = list[i];
          q.classList.add("in");
        };
        show();
        body.querySelector("[data-act=next]").onclick = () => {
          let n;
          do { n = Math.floor(Math.random() * list.length); } while (list.length > 1 && n === i);
          i = n;
          label.textContent = "Just for you";
          show();
        };
        body.querySelector("[data-act=copy]").onclick = (e) => {
          const b = e.currentTarget;
          navigator.clipboard?.writeText(list[i]).then(() => { b.textContent = "Copied ✓"; setTimeout(() => (b.textContent = "Copy"), 1500); });
        };
      }
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
