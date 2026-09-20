(() => {
  const cfg = window.HBD_CONFIG || {};

  const $ = (id) => document.getElementById(id);

  function normalizePhotos() {
    const raw = cfg.photos || [];
    return raw.map((item, i) => {
      if (typeof item === "string") {
        return { src: item, caption: `Kỷ niệm ${i + 1}` };
      }
      return {
        src: item.src,
        caption: item.caption || `Kỷ niệm ${i + 1}`,
      };
    });
  }

  function applyConfig() {
    const name = cfg.recipientName || "bạn";
    $("inviteTitle").textContent = cfg.inviteTitle || "Một món quà nhỏ";
    $("inviteSubtitle").textContent = cfg.inviteSubtitle || "";
    $("inviteTo").innerHTML = `Gửi đến <strong>${escapeHtml(name)}</strong>`;
    $("openGift").querySelector("span").textContent =
      cfg.openButtonText || "Mở quà 🎁";
    $("mainWish").textContent = cfg.mainWish || "Happy Birthday";
    $("subWish").textContent = cfg.subWish || "Tuổi mới thật hạnh phúc";
    $("sceneLabel").textContent = `Chúc mừng sinh nhật ${name}`;
    $("letterTitle").textContent = cfg.letterTitle || "Gửi bạn,";
    $("letterBody").textContent = cfg.letterBody || "";
    $("letterSign").textContent = cfg.letterSign || "";
    $("galleryTitle").textContent =
      cfg.galleryTitle || "Những khoảnh khắc của chúng mình";
    $("gallerySubtitle").textContent = cfg.gallerySubtitle || "";
    document.title = `Happy Birthday — ${name} 🎂`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initStars() {
    const canvas = $("bgCanvas");
    const ctx = canvas.getContext("2d");
    let w, h, stars, raf;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      stars = Array.from({ length: 90 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.3,
        a: Math.random(),
        s: Math.random() * 0.015 + 0.004,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        st.a += st.s;
        const alpha = 0.25 + Math.abs(Math.sin(st.a)) * 0.75;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 210, 230, ${alpha})`;
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }

  function spawnFloats() {
    const layer = $("floatLayer");
    layer.innerHTML = "";
    const msgs = cfg.floatingMessages || ["Happy Birthday"];

    msgs.forEach((text, i) => {
      const el = document.createElement("div");
      el.className = "float-msg";
      el.textContent = text;
      const left = 4 + Math.random() * 88;
      const delay = i * 1.1 + Math.random() * 2;
      const dur = 10 + Math.random() * 8;
      const dx = (Math.random() - 0.5) * 80;
      el.style.left = `${left}%`;
      el.style.bottom = `-${10 + Math.random() * 20}%`;
      el.style.animationDelay = `${delay}s`;
      el.style.animationDuration = `${dur}s`;
      el.style.setProperty("--dx", `${dx}px`);
      el.style.fontSize = `${0.95 + Math.random() * 0.55}rem`;
      layer.appendChild(el);
    });

    setInterval(() => {
      if ($("scene").classList.contains("hidden")) return;
      const text = msgs[Math.floor(Math.random() * msgs.length)];
      const el = document.createElement("div");
      el.className = "float-msg";
      el.textContent = text;
      el.style.left = `${8 + Math.random() * 80}%`;
      el.style.bottom = "-5%";
      el.style.animationDuration = `${11 + Math.random() * 7}s`;
      el.style.setProperty("--dx", `${(Math.random() - 0.5) * 90}px`);
      layer.appendChild(el);
      setTimeout(() => el.remove(), 20000);
    }, 2200);
  }

  function spawnCubes() {
    const layer = $("cubeLayer");
    layer.innerHTML = "";
    const photos = normalizePhotos();
    if (!photos.length) return;

    const positions = [
      { x: 12, y: 22 },
      { x: 86, y: 18 },
      { x: 10, y: 68 },
      { x: 88, y: 62 },
      { x: 22, y: 42 },
      { x: 78, y: 40 },
    ];

    positions.forEach((pos, i) => {
      const cube = document.createElement("div");
      cube.className = "photo-cube";
      cube.style.left = `${pos.x}%`;
      cube.style.top = `${pos.y}%`;
      cube.style.animationDuration = `${14 + (i % 4) * 3}s`;
      cube.style.animationDelay = `${-i * 1.5}s`;

      for (let f = 1; f <= 6; f++) {
        const face = document.createElement("span");
        face.className = `f${f}`;
        const src = photos[(i + f) % photos.length].src;
        face.style.backgroundImage = `url("${src}")`;
        cube.appendChild(face);
      }
      layer.appendChild(cube);
    });
  }

  function makePolaroid(photo) {
    const card = document.createElement("article");
    card.className = "polaroid";
    card.innerHTML = `
      <img class="polaroid__img" src="${photo.src}" alt="${escapeHtml(photo.caption)}" loading="lazy" />
      <p class="polaroid__caption">${escapeHtml(photo.caption)}</p>
    `;
    return card;
  }

  function fillTrack(trackEl, photos, offset) {
    trackEl.innerHTML = "";
    const list = [...photos.slice(offset), ...photos.slice(0, offset)];
    // Duplicate for seamless loop
    const doubled = [...list, ...list];
    doubled.forEach((photo) => trackEl.appendChild(makePolaroid(photo)));
  }

  function spawnGalleryHearts() {
    const layer = $("galleryHearts");
    layer.innerHTML = "";
    for (let i = 0; i < 18; i++) {
      const h = document.createElement("span");
      h.className = "g-heart";
      h.textContent = i % 3 === 0 ? "💗" : "♡";
      h.style.left = `${Math.random() * 100}%`;
      h.style.fontSize = `${0.7 + Math.random() * 1.1}rem`;
      h.style.animationDuration = `${7 + Math.random() * 8}s`;
      h.style.animationDelay = `${Math.random() * 6}s`;
      layer.appendChild(h);
    }
  }

  function buildGallery() {
    const photos = normalizePhotos();
    if (!photos.length) return;
    fillTrack($("galleryRow1"), photos, 0);
    fillTrack($("galleryRow2"), photos, 2);
    fillTrack($("galleryRow3"), photos, 4);
    spawnGalleryHearts();
  }

  function burstConfetti() {
    const colors = ["#ff6b9d", "#c77dff", "#ffd6a5", "#fff", "#ff8fab", "#e8b4ff"];
    for (let i = 0; i < 60; i++) {
      const bit = document.createElement("div");
      bit.className = "confetti";
      bit.style.left = `${Math.random() * 100}vw`;
      bit.style.top = `${-10 + Math.random() * 20}vh`;
      bit.style.background = colors[i % colors.length];
      bit.style.width = `${6 + Math.random() * 8}px`;
      bit.style.height = `${6 + Math.random() * 10}px`;
      bit.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
      document.body.appendChild(bit);
      setTimeout(() => bit.remove(), 2800);
    }
  }

  let blown = false;
  let holdTimer = null;

  function blowCandle() {
    if (blown) return;
    blown = true;
    $("flame").classList.add("out");
    $("blowHint").textContent = "Ước gì đã thành hiện thực ✨";
    $("blowBtn").textContent = "Đã thổi nến";
    $("blowBtn").disabled = true;
    burstConfetti();
    setTimeout(() => {
      $("letter").classList.remove("hidden");
    }, 900);
  }

  function startHold() {
    if (blown) return;
    $("blowBtn").classList.add("holding");
    holdTimer = setTimeout(blowCandle, 900);
  }

  function endHold() {
    $("blowBtn").classList.remove("holding");
    clearTimeout(holdTimer);
  }

  function openShare() {
    const url = window.location.href.split("#")[0];
    $("shareUrl").value = url;
    const box = $("qrBox");
    box.innerHTML = "";
    if (window.QRCode) {
      QRCode.toCanvas(
        url,
        { width: 180, margin: 2, color: { dark: "#c9184a", light: "#ffffff" } },
        (err, canvas) => {
          if (!err) box.appendChild(canvas);
          else box.textContent = "Không tạo được QR";
        }
      );
    } else {
      box.innerHTML = `<img alt="QR" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}" />`;
    }
    $("shareModal").classList.remove("hidden");
  }

  async function copyLink() {
    const url = $("shareUrl").value;
    try {
      await navigator.clipboard.writeText(url);
      $("copyLink").textContent = "Đã copy!";
      setTimeout(() => ($("copyLink").textContent = "Copy link"), 1500);
    } catch {
      $("shareUrl").select();
      document.execCommand("copy");
      $("copyLink").textContent = "Đã copy!";
    }
  }

  function openGift() {
    $("invite").classList.add("hidden");
    $("scene").classList.remove("hidden");
    initStars();
    spawnFloats();
    spawnCubes();
  }

  function openGallery() {
    buildGallery();
    $("letter").classList.add("hidden");
    $("gallery").classList.remove("hidden");
    burstConfetti();
  }

  function backToLetter() {
    $("gallery").classList.add("hidden");
    $("letter").classList.remove("hidden");
  }

  function replay() {
    blown = false;
    $("letter").classList.add("hidden");
    $("gallery").classList.add("hidden");
    $("flame").classList.remove("out");
    $("blowHint").textContent = "Giữ để thổi nến 💨";
    $("blowBtn").textContent = "Thổi nến";
    $("blowBtn").disabled = false;
    burstConfetti();
  }

  function init() {
    applyConfig();

    $("openGift").addEventListener("click", openGift);

    const blow = $("blowBtn");
    blow.addEventListener("mousedown", startHold);
    blow.addEventListener("mouseup", endHold);
    blow.addEventListener("mouseleave", endHold);
    blow.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        startHold();
      },
      { passive: false }
    );
    blow.addEventListener("touchend", endHold);
    blow.addEventListener("click", () => {
      if (!blown) setTimeout(blowCandle, 200);
    });

    $("shareBtn").addEventListener("click", openShare);
    $("galleryShareBtn").addEventListener("click", openShare);
    $("closeModal").addEventListener("click", () =>
      $("shareModal").classList.add("hidden")
    );
    $("modalClose").addEventListener("click", () =>
      $("shareModal").classList.add("hidden")
    );
    $("copyLink").addEventListener("click", copyLink);
    $("openGalleryBtn").addEventListener("click", openGallery);
    $("backLetterBtn").addEventListener("click", backToLetter);
    $("replayBtn").addEventListener("click", replay);
  }

  init();
})();
