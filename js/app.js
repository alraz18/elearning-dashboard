const STORAGE = {
  progress: "edulearn_progress",
  xp: "edulearn_xp",
  theme: "edulearn_theme",
  user: "edulearn_user",
  completed: "edulearn_completed_lessons",
  activity: "edulearn_activity_log",
  quizScore: "edulearn_quiz_score",
};

const LESSONS = [
  {
    title: "HTML Semantik",
    level: "Pemula",
    duration: "12 menit",
    description:
      "Struktur halaman, heading, section, article, dan elemen semantik yang membuat markup lebih rapi.",
    video: "https://www.youtube.com/embed/UB1O30fR-EE",
    xp: 50,
    accent: "from-fuchsia-500 to-pink-500",
  },
  {
    title: "CSS Modern",
    level: "Pemula",
    duration: "15 menit",
    description:
      "Layout modern, spacing, responsive design, dan utility class yang konsisten.",
    video: "https://www.youtube.com/embed/yfoY53QXEnI",
    xp: 50,
    accent: "from-violet-500 to-indigo-500",
  },
  {
    title: "JavaScript Dasar",
    level: "Pemula",
    duration: "18 menit",
    description:
      "Variabel, fungsi, event, DOM, dan interaksi sederhana yang membentuk logika aplikasi.",
    video: "https://www.youtube.com/embed/W6NZfCO5SIk",
    xp: 60,
    accent: "from-cyan-500 to-sky-500",
  },
  {
    title: "Tailwind CSS",
    level: "Menengah",
    duration: "14 menit",
    description:
      "Membangun UI cepat, konsisten, dan modern dengan utility-first CSS.",
    video: "https://www.youtube.com/embed/dFgzHOX84xQ",
    xp: 60,
    accent: "from-amber-400 to-orange-500",
  },
  {
    title: "LocalStorage",
    level: "Menengah",
    duration: "10 menit",
    description:
      "Menyimpan progress belajar langsung di browser dengan JavaScript tanpa backend.",
    video: "https://www.youtube.com/embed/GihQAC1I39Q",
    xp: 70,
    accent: "from-emerald-500 to-teal-500",
  },
];

const BADGES = [
  { name: "Starter", minXp: 0, icon: "✨", hint: "Langkah awal yang solid." },
  {
    name: "Rising",
    minXp: 100,
    icon: "🚀",
    hint: "Momentum belajar mulai terasa.",
  },
  {
    name: "Consistent",
    minXp: 250,
    icon: "📘",
    hint: "Ritme belajar sudah stabil.",
  },
  { name: "Achiever", minXp: 500, icon: "🏆", hint: "Hasilmu sudah impresif." },
];

const ACTIVITY_LABEL = {
  login: "Login",
  lesson: "Materi",
  quiz: "Kuis",
  theme: "Tema",
  milestone: "Milestone",
};

let state = {
  progress: 0,
  xp: 0,
  theme: "dark",
  user: null,
  completedLessons: [],
  activity: [],
  quizScore: 0,
};

let activeLessonIndex = 0;

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, num));
}

function levelFromXp(xp) {
  return Math.floor(xp / 200) + 1;
}

function nowStamp() {
  return new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function loadState() {
  state.progress = Number(localStorage.getItem(STORAGE.progress) || 0);
  state.xp = Number(localStorage.getItem(STORAGE.xp) || 0);
  state.theme = localStorage.getItem(STORAGE.theme) || "light";
  state.user = safeParse(localStorage.getItem(STORAGE.user), null);
  state.completedLessons = safeParse(
    localStorage.getItem(STORAGE.completed),
    [],
  );
  state.activity = safeParse(localStorage.getItem(STORAGE.activity), []);
  state.quizScore = Number(localStorage.getItem(STORAGE.quizScore) || 0);

  state.progress = clamp(state.progress, 0, 100);
  state.xp = Math.max(0, state.xp);
  state.completedLessons = Array.isArray(state.completedLessons)
    ? [...new Set(state.completedLessons.filter(Boolean))]
    : [];
  state.activity = Array.isArray(state.activity)
    ? state.activity.slice(0, 8)
    : [];
}

function saveState() {
  localStorage.setItem(STORAGE.progress, String(state.progress));
  localStorage.setItem(STORAGE.xp, String(state.xp));
  localStorage.setItem(STORAGE.theme, state.theme);
  localStorage.setItem(STORAGE.user, JSON.stringify(state.user));
  localStorage.setItem(
    STORAGE.completed,
    JSON.stringify(state.completedLessons),
  );
  localStorage.setItem(STORAGE.activity, JSON.stringify(state.activity));
  localStorage.setItem(STORAGE.quizScore, String(state.quizScore));
}

function pushActivity(kind, title, detail = "") {
  state.activity.unshift({
    kind,
    title,
    detail,
    time: Date.now(),
  });
  state.activity = state.activity.slice(0, 8);
  saveState();
  renderActivityLog();
}

function showToast(message, tone = "default") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const palette = {
    default: "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900",
    success:
      "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10",
    info: "border-cyan-200 dark:border-cyan-500/20 bg-cyan-50 dark:bg-cyan-500/10",
    warning:
      "border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10",
  };

  const toast = document.createElement("div");
  toast.className = `pointer-events-auto rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl ${palette[tone] || palette.default}`;
  toast.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="mt-0.5 text-lg">
        ${tone === "success" ? "✅" : tone === "warning" ? "⚠️" : tone === "info" ? "💠" : "✨"}
      </div>
      <div>
        <p class="text-sm font-semibold">${message}</p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">${nowStamp()}</p>
      </div>
    </div>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transition = "all 220ms ease";
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    setTimeout(() => toast.remove(), 240);
  }, 2600);
}

function applyTheme() {
  const html = document.documentElement;

  if (state.theme === "dark") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
}

function updateThemeButtons() {
  const buttons = document.querySelectorAll("[data-theme-toggle]");

  buttons.forEach((btn) => {
    if (state.theme === "dark") {
      btn.innerHTML = `<iconify-icon icon="solar:sun-bold"></iconify-icon>`;
    } else {
      btn.innerHTML = `<iconify-icon icon="solar:moon-bold"></iconify-icon>`;
    }
  });
}

function toggleTheme() {
  if (state.theme === "dark") {
    state.theme = "light";
  } else {
    state.theme = "dark";
  }

  document.documentElement.classList.toggle("dark");

  updateThemeButtons();
  saveState();

  showToast(
    state.theme === "dark"
      ? "Tema diubah ke mode gelap."
      : "Tema diubah ke mode terang.",
    "info",
  );

  pushActivity(
    "theme",
    "Tema diubah",
    state.theme === "dark" ? "Mode gelap aktif" : "Mode terang aktif",
  );
}

applyTheme();
updateThemeButtons();
saveState();

showToast(
  state.theme === "dark"
    ? "Tema diubah ke mode gelap."
    : "Tema diubah ke mode terang.",
  "info",
);

pushActivity(
  "theme",
  "Tema diubah",
  state.theme === "dark" ? "Mode gelap aktif" : "Mode terang aktif",
);

function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  if (menu) menu.classList.toggle("hidden");
}

function openLoginModal() {
  const modal = document.getElementById("loginModal");
  modal?.classList.remove("hidden");
  document.getElementById("loginEmail")?.focus();
}

function closeLoginModal() {
  document.getElementById("loginModal")?.classList.add("hidden");
}

async function handleLogin(event) {
  event.preventDefault();
  const feedback = document.getElementById("loginFeedback");
  const email =
    document.getElementById("loginEmail")?.value?.trim() || "siswa@edulearn.id";
  const password =
    document.getElementById("loginPassword")?.value?.trim() || "";

  if (feedback) {
    feedback.textContent = "Memproses login demo...";
  }

  try {
    const response = await fetch("https://dummyjson.com/users/1");
    const data = await response.json();

    state.user = {
      name: `${data.firstName} ${data.lastName}`,
      email,
    };
  } catch {
    state.user = { name: "Siswa Demo", email };
  }

  state.user.email = email;
  saveState();
  pushActivity("login", `Masuk sebagai ${state.user.name}`, email);
  closeLoginModal();

  if (feedback) {
    feedback.textContent = password
      ? "Login demo berhasil disimpan di browser."
      : "Login demo berhasil.";
  }

  showToast(`Selamat datang, ${state.user.name}.`, "success");
}

function renderUser() {
  const userName = document.getElementById("userName");
  const sidebarUserName = document.getElementById("sidebarUserName");
  const userEmail = document.getElementById("userEmail");

  if (userName) userName.textContent = state.user?.name || "Siswa";
  if (sidebarUserName)
    sidebarUserName.textContent = state.user?.name || "Guest";
  if (userEmail) userEmail.textContent = state.user?.email || "Belum login";
}

function renderMetrics() {
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");
  const progressBarBig = document.getElementById("progressBarBig");
  const xpText = document.getElementById("xpText");
  const levelText = document.getElementById("levelText");
  const sidebarLevel = document.getElementById("sidebarLevel");
  const completedCountSide = document.getElementById("completedCountSide");
  const completedCountMain = document.getElementById("completedCountMain");
  const progressPercentText = document.getElementById("progressPercentText");
  const nextMilestoneText = document.getElementById("nextMilestoneText");
  const remainingXpText = document.getElementById("remainingXpText");

  if (progressText) progressText.textContent = `${state.progress}%`;
  if (progressBar) progressBar.style.width = `${state.progress}%`;
  if (progressBarBig) progressBarBig.style.width = `${state.progress}%`;
  if (xpText) xpText.textContent = `${state.xp} XP`;
  if (levelText) levelText.textContent = `Level ${levelFromXp(state.xp)}`;
  if (sidebarLevel) sidebarLevel.textContent = String(levelFromXp(state.xp));
  if (completedCountSide)
    completedCountSide.textContent = String(state.completedLessons.length);
  if (completedCountMain)
    completedCountMain.textContent = String(state.completedLessons.length);
  if (progressPercentText)
    progressPercentText.textContent = `${state.progress}%`;

  const nextXp = levelFromXp(state.xp) * 200;
  const remainingXp = Math.max(0, nextXp - state.xp);
  const milestone = Math.ceil((state.completedLessons.length + 1) / 5) * 5;

  if (nextMilestoneText) {
    nextMilestoneText.textContent = `${milestone} materi`;
  }

  if (remainingXpText) {
    remainingXpText.textContent = `${remainingXp} XP lagi`;
  }
}

function renderBadges() {
  const badgeGrid = document.getElementById("badgeGrid");
  if (!badgeGrid) return;

  badgeGrid.innerHTML = BADGES.map((badge) => {
    const unlocked = state.xp >= badge.minXp;
    return `
      <div class="rounded-3xl p-4 border transition duration-300 ${
        unlocked
          ? "bg-white dark:bg-slate-950/40 border-slate-200 dark:border-white/10 shadow-sm"
          : "bg-slate-100/70 dark:bg-slate-950/30 border-dashed border-slate-300 dark:border-white/10 opacity-60"
      }">
        <div class="flex items-start justify-between gap-3">
          <div class="text-2xl">${badge.icon}</div>
          <span class="text-[11px] uppercase tracking-[0.2em] ${unlocked ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}">
            ${unlocked ? "Unlocked" : "Locked"}
          </span>
        </div>
        <p class="mt-2 font-black">${badge.name}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${badge.hint}</p>
        <p class="text-xs mt-3 ${unlocked ? "text-fuchsia-600 dark:text-fuchsia-300" : "text-slate-400"}">
          ${unlocked ? "Badge aktif" : `Butuh ${badge.minXp} XP`}
        </p>
      </div>
    `;
  }).join("");
}

function renderCompletedLessons() {
  const list = document.getElementById("completedList");
  if (!list) return;

  if (!state.completedLessons.length) {
    list.innerHTML = `
      <div class="sm:col-span-2 xl:col-span-3 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 p-6 text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-950/30">
        Belum ada materi selesai. Klik tombol materi selesai untuk mengisi riwayat belajar.
      </div>
    `;
    return;
  }

  list.innerHTML = state.completedLessons
    .map(
      (lesson, index) => `
    <div class="rounded-3xl border border-slate-200 dark:border-white/10 p-4 bg-white dark:bg-slate-950/40 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <p class="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          Materi ${index + 1}
        </p>
        <span class="text-xs text-emerald-600 dark:text-emerald-400">Selesai</span>
      </div>
      <p class="font-black mt-3 leading-snug">${lesson}</p>
    </div>
  `,
    )
    .join("");
}

function renderActivityLog() {
  const feed = document.getElementById("activityFeed");
  if (!feed) return;

  if (!state.activity.length) {
    feed.innerHTML = `
      <div class="rounded-3xl border border-dashed border-slate-300 dark:border-white/10 p-5 text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-950/30">
        Aktivitas akan muncul di sini setelah kamu login, menyelesaikan materi, atau mengerjakan kuis.
      </div>
    `;
    return;
  }

  feed.innerHTML = state.activity
    .map(
      (item) => `
    <div class="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/40 p-4 shadow-sm">
      <div class="flex items-start gap-3">
        <div class="w-11 h-11 rounded-2xl grid place-items-center bg-slate-100 dark:bg-slate-800 text-lg shrink-0">
          ${item.kind === "quiz" ? "🧠" : item.kind === "lesson" ? "📚" : item.kind === "login" ? "👋" : item.kind === "theme" ? "🎨" : "🏅"}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-3">
            <p class="font-semibold truncate">${item.title}</p>
            <span class="text-[11px] text-slate-400 shrink-0">${new Date(item.time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${item.detail || ACTIVITY_LABEL[item.kind] || "Aktivitas"}</p>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

function addProgressAndXp(progressAmount, xpAmount, source = "") {
  state.progress = clamp(state.progress + progressAmount, 0, 100);
  state.xp = Math.max(0, state.xp + xpAmount);
  saveState();
  renderMetrics();
  renderBadges();
  if (source)
    pushActivity("milestone", source, `+${xpAmount} XP • +${progressAmount}%`);
}

function completeSelectedLesson() {
  const lesson = LESSONS[activeLessonIndex];
  if (!lesson) return;

  const alreadyDone = state.completedLessons.includes(lesson.title);

  if (!alreadyDone) {
    state.completedLessons.push(lesson.title);
    addProgressAndXp(10, lesson.xp, `Menyelesaikan ${lesson.title}`);
    showToast(`Materi "${lesson.title}" berhasil ditandai selesai.`, "success");
    pushActivity("lesson", lesson.title, `XP +${lesson.xp}`);
  } else {
    addProgressAndXp(2, 10, `Review ${lesson.title}`);
    showToast(`Review untuk "${lesson.title}" menambah XP.`, "info");
    pushActivity("lesson", `${lesson.title} dibuka lagi`, "Review tambahan");
  }

  if (state.completedLessons.length === LESSONS.length) {
    state.xp += 50;
    state.progress = clamp(state.progress + 5, 0, 100);
    saveState();
    renderMetrics();
    renderBadges();
    showToast(
      "Selamat, semua materi inti sudah selesai. Bonus milestone diberikan.",
      "success",
    );
    pushActivity("milestone", "Semua materi inti selesai", "+50 XP bonus");
  }

  renderCompletedLessons();
  renderMetrics();
  renderBadges();

  if (document.getElementById("lessonPreview")) renderLessonPreview();
}

function renderLessonGrid() {
  const grid = document.getElementById("lessonGrid");
  if (!grid) return;

  grid.innerHTML = LESSONS.map((lesson, index) => {
    const completed = state.completedLessons.includes(lesson.title);
    return `
      <button onclick="selectLesson(${index})"
        class="text-left rounded-[1.75rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/40 p-5 hover:-translate-y-1 hover:shadow-xl transition duration-300 ${
          index === activeLessonIndex ? "ring-2 ring-fuchsia-500 shadow-lg" : ""
        }">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-xs text-slate-500 dark:text-slate-400">${lesson.level} • ${lesson.duration}</p>
              ${completed ? `<span class="text-[10px] uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Selesai</span>` : ""}
            </div>
            <h4 class="mt-2 font-black text-lg leading-snug">${lesson.title}</h4>
          </div>
          <span class="shrink-0 text-xs px-3 py-1 rounded-full bg-gradient-to-r ${lesson.accent} text-white shadow-sm">
            +${lesson.xp} XP
          </span>
        </div>
        <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">${lesson.description}</p>
      </button>
    `;
  }).join("");

  renderLessonPreview();
}

function renderLessonPreview() {
  const preview = document.getElementById("lessonPreview");
  if (!preview) return;

  const lesson = LESSONS[activeLessonIndex];
  const done = state.completedLessons.includes(lesson.title);

  preview.innerHTML = `
    <div class="space-y-4">
      <div class="rounded-[1.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm bg-slate-100 dark:bg-slate-800">
        <iframe class="w-full aspect-video" src="${lesson.video}" title="${lesson.title}" allowfullscreen></iframe>
      </div>

      <div>
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            ${lesson.level} • ${lesson.duration}
          </p>
          <span class="text-xs px-3 py-1 rounded-full ${done ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"}">
            ${done ? "Sudah selesai" : "Belum selesai"}
          </span>
        </div>
        <h4 class="mt-3 text-2xl font-black">${lesson.title}</h4>
        <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">${lesson.description}</p>
      </div>

      <div class="rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 p-4">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-semibold">Aksi cepat</p>
          <span class="text-xs text-slate-400">${done ? "Review tersedia" : "Tandai selesai"}</span>
        </div>
        <button onclick="completeSelectedLesson()" class="mt-3 w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white font-semibold shadow-lg shadow-fuchsia-500/20 hover:scale-[1.01] transition">
          ${done ? "Tambah Review (+10 XP)" : "Tandai Selesai"}
        </button>
      </div>
    </div>
  `;
}

function renderDashboardFeed() {
  const feed = document.getElementById("feedGrid");
  if (!feed) return;

  feed.innerHTML = Array.from({ length: 3 })
    .map(
      () => `
    <div class="animate-pulse rounded-[1.5rem] p-5 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/40">
      <div class="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      <div class="mt-4 h-6 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      <div class="mt-3 h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      <div class="mt-6 h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
    </div>
  `,
    )
    .join("");

  fetch("https://dummyjson.com/posts?limit=6")
    .then((res) => res.json())
    .then((data) => {
      const posts = data.posts || [];
      feed.innerHTML = posts
        .map(
          (post, index) => `
        <article class="group rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 dark:from-violet-500/20 dark:to-fuchsia-500/20 dark:text-fuchsia-200">
              Materi ${index + 1}
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400">DummyJSON</span>
          </div>
          <h4 class="mt-4 font-black text-lg leading-snug group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-300 transition">
            ${post.title}
          </h4>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
            ${post.body}
          </p>
          <div class="mt-5 flex items-center justify-between gap-3">
            <span class="text-xs text-slate-400">Konten API</span>
            <a href="materi.html" class="px-4 py-2 rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-sm font-semibold shadow-sm">
              Buka
            </a>
          </div>
        </article>
      `,
        )
        .join("");
    })
    .catch(() => {
      feed.innerHTML = `
        <div class="rounded-[1.5rem] border border-dashed border-slate-300 dark:border-white/10 p-5 text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-950/30">
          Data API gagal dimuat, tetapi layout tetap siap.
        </div>
      `;
    });
}

function renderMaterialsFeed() {
  const feed = document.getElementById("materialsFeed");
  if (!feed) return;

  fetch("https://dummyjson.com/posts?limit=6")
    .then((res) => res.json())
    .then((data) => {
      const posts = data.posts || [];
      feed.innerHTML = posts
        .map(
          (post, index) => `
        <article class="rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40 p-5 hover:shadow-lg hover:-translate-y-1 transition">
          <div class="flex items-center justify-between">
            <span class="text-xs px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
              Materi ${index + 1}
            </span>
            <span class="text-xs text-slate-400">API</span>
          </div>
          <h4 class="mt-3 font-black text-lg leading-snug">${post.title}</h4>
          <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">${post.body}</p>
        </article>
      `,
        )
        .join("");
    })
    .catch(() => {
      feed.innerHTML = `
        <div class="rounded-[1.5rem] border border-dashed border-slate-300 dark:border-white/10 p-5 text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-950/30">
          API tidak tersedia saat ini.
        </div>
      `;
    });
}

function checkQuiz() {
  const answerKey = { q1: "a", q2: "a", q3: "a", q4: "a", q5: "a" };
  let score = 0;

  Object.entries(answerKey).forEach(([question, correct]) => {
    const selected = document.querySelector(
      `input[name="${question}"]:checked`,
    );
    if (selected && selected.value === correct) score++;
  });

  state.quizScore = score;
  saveState();

  const scoreText = document.getElementById("quizScore");
  const result = document.getElementById("quizResult");
  if (scoreText) scoreText.textContent = String(score);

  const percent = Math.round((score / 5) * 100);
  const xpGain = score * 40 + (score === 5 ? 30 : 0);
  const progressGain = score * 6 + (score === 5 ? 5 : 0);

  addProgressAndXp(progressGain, xpGain, `Hasil kuis ${score}/5`);
  pushActivity(
    "quiz",
    `Kuis selesai ${score}/5`,
    `+${xpGain} XP • +${progressGain}%`,
  );

  if (result) {
    result.innerHTML = `
      <div class="rounded-[1.5rem] border border-slate-200 dark:border-white/10 p-5 bg-white dark:bg-slate-950/40 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">Hasil Kuis</p>
          <span class="text-xs px-3 py-1 rounded-full ${score >= 4 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"}">
            ${score >= 4 ? "Bagus" : "Perlu latihan"}
          </span>
        </div>
        <p class="mt-3 text-4xl font-black">${score}/5</p>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">${percent}% ketepatan jawaban</p>
        <p class="mt-3 text-sm ${score >= 4 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}">
          ${score >= 4 ? "Keren, hasilmu sangat bagus!" : "Lumayan, coba ulang agar hasilnya lebih tinggi."}
        </p>
        <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Kamu mendapat +${xpGain} XP dan +${progressGain}% progress.
        </p>
      </div>
    `;
  }

  renderMetrics();
  renderBadges();
  renderCompletedLessons();
  renderActivityLog();

  showToast(
    `Kuis selesai dengan skor ${score}/5.`,
    score >= 4 ? "success" : "warning",
  );
}

function selectLesson(index) {
  activeLessonIndex = index;
  renderLessonGrid();
  showToast(`Materi "${LESSONS[index].title}" dibuka.`, "info");
}

function renderAll() {
  renderUser();
  renderMetrics();
  renderBadges();
  renderCompletedLessons();
  renderActivityLog();
  renderDashboardFeed();
  renderMaterialsFeed();
  renderLessonGrid();

  renderProfileImage(); // 🔥 TAMBAH INI
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  // applyTheme();
  updateThemeButtons();
  renderAll();

  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  const loginModal = document.getElementById("loginModal");
  if (loginModal) {
    loginModal.addEventListener("click", (event) => {
      if (event.target === loginModal) closeLoginModal();
    });
  }

  // const themeButtons = document.querySelectorAll("[data-theme-toggle]");
  // themeButtons.forEach((button) =>
  //   button.addEventListener("click", toggleTheme),
  // );

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLoginModal();
  });
});

function toggleProfileMenu() {
  const menu = document.getElementById("profileMenu");
  menu.classList.toggle("hidden");
}

function triggerUpload() {
  document.getElementById("uploadInput").click();
}

function handleUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const imageData = e.target.result;

    if (!state.user) state.user = {};
    state.user.photo = imageData;

    saveState();
    renderProfileImage(); // ← INI WAJIB ADA
  };

  reader.readAsDataURL(file);
}

function renderProfileImage() {
  const img = document.getElementById("profileImage");

  if (!img) return;

  img.src =
    state.user?.photo ||
    "https://ui-avatars.com/api/?name=User&background=ccc&color=555";
}


window.toggleTheme = toggleTheme;
window.toggleMobileMenu = toggleMobileMenu;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.completeSelectedLesson = completeSelectedLesson;
window.selectLesson = selectLesson;
window.checkQuiz = checkQuiz;
