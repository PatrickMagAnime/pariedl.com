const revealItems = document.querySelectorAll(".reveal");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const themeButton = document.querySelector(".secret-theme-button");
let themeClicks = [];
let prideRainInterval;
let heartRainInterval;
const prideFlags = ["rainbow", "trans", "lesbian", "pan", "bi"];
const heartEmojis = ["💗", "❤️", "💜", "💙", "💛"];
const themeStorageKey = "pariedl-theme";
const languageStorageKey = "pariedl-language";
const projectToggle = document.querySelector(".project-toggle");
const languageButton = document.querySelector(".language-button");
let currentLanguage = "de";

const translations = {
  index: {
    ".main-nav a": [["Über mich", "About"], ["Projekte", "Projects"], ["Stack", "Stack"], ["Kontakt", "Contact"], ["Links ↗", "Links ↗"]],
    ".header-cta": ["Kontakt <span>↗</span>", "Contact <span>↗</span>"],
    ".kicker": ["Hallo, ich bin Patrick :§", "Hi, I'm Patrick :§"],
    ".hero-text": ["Ich bin gelangweilter HTL Schüler und probiere gerne aus, was man mit Code bauen kann. Auf dieser Seite findest du meine Projekte, Notizen und Dinge, die mir eigentlich nichts bringen.", "I'm a bored HTL student who likes finding out what can be built with code. This site is a collection of my projects, notes and things that are not really useful."],
    ".hero-actions .button-primary": ["Meine Projekte <span>↓</span>", "My projects <span>↓</span>"],
    ".note-label": ["Ein paar Dinge über mich", "A few things about me"],
    ".hero-note li": [["Ich besuche seit 2022 eine HTL.", "I've been attending an HTL since 2022."], ["Ich habe 2025 GitHub ernsthaft angefangen.", "I seriously started using GitHub in 2025."], ["Ich lerne durch Projekte.", "I learn through projects."]],
    "#about h2": ["Ein bisschen<br /><em>über mich</em>", "A little<br /><em>about me</em>"],
    ".large-copy": ["Ich mag es, wenn aus einer Idee etwas entsteht, das man wirklich benutzen kann. (Die meisten Projekte darf ich nicht publishen weil ich mich nicht Strafbar machen will.)", "I like it when an idea turns into something people can actually use. (I cannot publish most projects because I do not want to get into legal trouble.)"],
    ".about-copy p:not(.large-copy)": ["In der HTL lerne ich Softwareentwicklung und probiere daneben viele Dinge aus. Manche Projekte sind nützlich, manche sind nur zum Lernen da und manche existieren hauptsächlich, weil ich wissen wollte, ob es funktioniert.", "At the HTL I am learning software development and trying out many things on the side. Some projects are useful, some are just for learning, and some exist because I wanted to know whether they would work."],
    ".arrow-link": ["Schreib mir <span>→</span>", "Write to me <span>→</span>"],
    ".portrait-label span": ["me and my future wife", "me and my future wife"],
    ".section-heading h2": ["Projekte, an denen<br /><em>ich gearbeitet habe</em>", "Projects I have<br /><em>worked on</em>"],
    ".section-heading p": ["Nicht alles ist gut<br />Darum geht es auch nicht.", "Not everything is good<br />That is not the point."],
    ".project-info p": [["Das Internet brauchte definitiv noch einen Ort für Katzen.", "The internet definitely needed another place for cats."], ["Das Gegenstück zum cat-hub – für die andere Hälfte des Internets.", "The counterpart to cat-hub – for the other half of the internet."], ["Noch ein kleines Tier-Internetprojekt, weil warum nicht.", "Another small animal internet project, because why not."], ["Ein zentraler Ort für Mitschriften, Wissen und den Versuch, organisiert durch die HTL zu kommen.", "A central place for notes, knowledge and trying to stay organized through the HTL."], ["Schulprojekte, Java-Syntax und viele Lernmomente.", "School projects, Java syntax and plenty of learning moments."], ["Videos für Discord kleiner machen, ohne großes Drama.", "Making videos smaller for Discord without unnecessary drama."], ["Ein eigenes Skin-Projekt für osu!.", "A custom skin project for osu!."], ["Meine Konfigurationen und der ewige Versuch, das Setup zu perfektionieren.", "My configurations and the eternal attempt to perfect the setup."]],
    ".visual-tag": [["EXPERIMENT", "EXPERIMENT"], ["EXPERIMENT", "EXPERIMENT"], ["EXPERIMENT", "EXPERIMENT"], ["WEB APP", "WEB APP"], ["SCHOOL", "SCHOOL"], ["TOOL", "TOOL"], ["CUSTOM", "CUSTOM"], ["SETUP", "SETUP"]],
    ".project-toggle": ["mehr <span>↓</span>", "more <span>↓</span>"],
    ".all-projects > a.button": ["GitHub <span>↗</span>", "GitHub <span>↗</span>"],
    ".stack-heading h2": ["Mein <em>Werkzeugkasten</em>", "My <em>toolbox</em>"],
    ".stack-heading p": ["Technologien sind Werkzeuge.<br />Neugier ist das wichtigste.", "Technologies are tools.<br />Curiosity matters most."],
    ".stack-row strong": [["Frontend", "Frontend"], ["Backend & Tools", "Backend & tools"], ["Currently learning", "Currently learning"]],
    ".timeline-section h2": ["Die <em>Timeline</em>", "The <em>timeline</em>"],
    ".timeline-item h3": [["HTL & side quests", "HTL & side quests"], ["Mehr als nur Schulcode", "More than school code"], ["Start in der HTL", "Starting at the HTL"]],
    ".timeline-item p": [["Softwareentwicklung lernen und Projekte starten.", "Learning software development and starting projects."], ["GitHub entdeckt, erste Projekte online gebracht.", "Discovered GitHub and published my first projects."], ["Der Einstieg in die HTL, Softwareentwicklung, Design und Technik.", "Starting at the HTL: software development, design and technology."]],
    ".contact-inner h2": ["Eine Idee?<br /><em>Lass sie uns bauen.</em>", "Have an idea?<br /><em>Let's build it.</em>"],
    ".contact-inner p": ["Ob Projekt, Feedback oder einfach eine Frage", "A project, feedback or just a question"],
    ".footer-links a": [["Back to top ↑", "Back to top ↑"], ["Impressum", "Legal notice"], ["GitHub ↗", "GitHub ↗"]]
  },
  impressum: {
    ".header-cta": ["← Zur Startseite", "← Home"],
    ".header-links": ["Links ↗", "Links ↗"],
    ".legal-page h1": ["Impressum<span class=\"legal-dot\">.</span>", "Legal notice<span class=\"legal-dot\">.</span>"],
    ".legal-grid section:nth-child(1) h2": ["Angaben gemäß § 5 ECG", "Information according to § 5 ECG"],
    ".legal-grid section:nth-child(1) p:nth-of-type(1)": ["<strong>Patrick Riedl</strong><br />Seventwentyseven Street 727<br />72727 WYSI<br />Österreich", "<strong>Patrick Riedl</strong><br />Seventwentyseven Street 727<br />72727 WYSI<br />Austria"],
    ".legal-grid section:nth-child(1) p:nth-of-type(2)": ["Hinweis: Diese Website ist ein nicht ernst zu nehmendes Portfolio von einem HTL Schüler.", "Note: This website is a not-too-serious portfolio by an HTL student."],
    ".legal-grid section:nth-child(2) h2": ["Kontakt", "Contact"],
    ".legal-grid section:nth-child(2) p:nth-of-type(2)": ["Für Fragen oder Feedback kannst du mich jederzeit per E-Mail erreichen.", "For questions or feedback, you can reach me by email at any time."],
    ".legal-grid section:nth-child(3) h2": ["Haftung für Inhalte", "Liability for content"],
    ".legal-grid section:nth-child(3) p": ["Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt (Eig nicht). Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden. (pew pew)", "The content of this website was created with the greatest possible care (well, not really). No guarantee can be given for its accuracy, completeness or timeliness. (pew pew)"],
    ".legal-grid section:nth-child(4) h2": ["Haftung für Links", "Liability for links"],
    ".legal-grid section:nth-child(4) p": ["Diese Website enthält Links zu externen Websites. Auf deren Inhalte habe ich keinen Einfluss und übernehme dafür keine Haftung. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Betreiber verantwortlich.", "This website contains links to external websites. I have no influence over their content and accept no liability for it. The respective operator is responsible for the content of linked pages."],
    ".legal-grid section:nth-child(5) h2": ["Urheberrecht", "Copyright"],
    ".legal-grid section:nth-child(5) p": ["Die auf dieser Website erstellten Inhalte und Werke unterliegen dem österreichischen Urheberrecht. Eine Verwendung außerhalb der Grenzen des Urheberrechts bedarf der vorherigen Zustimmung. MIT Lizensiert (Aber wer braucht meine Seite schon)", "The content and works created on this website are subject to Austrian copyright law. Use outside the limits of copyright requires prior consent. MIT licensed (but who needs my site anyway)"],
    ".footer-note": ["© 2026 Patrick. ilmgf Valentina<3", "© 2026 Patrick. ilmgf Valentina<3"]
  },
  links: {
    ".header-cta": ["← Startseite", "← Home"],
    ".links-profile p": ["Holy OSINT treasure", "Holy OSINT treasure"],
    ".social-link[data-account=\"\"] .social-state": ["No account", "No account"],
    ".links-email": ["info@pariedl.com <span>↗</span>", "info@pariedl.com <span>↗</span>"],
    ".footer-note": ["© 2026 Patrick. ilmgf Valentina<3", "© 2026 Patrick. ilmgf Valentina<3"]
  }
};

function setTranslated(selector, value) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element, index) => {
    const entry = Array.isArray(value[0]) ? value[index] : value;
    if (!entry) return;
    element.innerHTML = entry[currentLanguage === "en" ? 1 : 0];
  });
}

function applyLanguage(language) {
  currentLanguage = language;
  const page = document.body.classList.contains("links-page") ? "links" : window.location.pathname.endsWith("impressum.html") ? "impressum" : "index";
  Object.entries(translations[page]).forEach(([selector, value]) => setTranslated(selector, value));
  document.documentElement.lang = language;
  document.title = page === "impressum"
    ? (language === "de" ? "Impressum — pariedl.com" : "Legal notice — pariedl.com")
    : page === "links"
      ? (language === "de" ? "Links — pariedl.com" : "Links — pariedl.com")
      : "pariedl.com";
  languageButton.textContent = language === "de" ? "DE" : "EN";
  languageButton.setAttribute("aria-label", language === "de" ? "Sprache wechseln" : "Switch language");
  languageButton.title = language === "de" ? "Sprache wechseln" : "Switch language";
  menuToggle?.setAttribute("aria-label", language === "de" ? "Menü öffnen" : "Open menu");
  if (projectToggle) {
    const expanded = projectToggle.getAttribute("aria-expanded") === "true";
    projectToggle.innerHTML = expanded
      ? (language === "de" ? "weniger <span>↑</span>" : "less <span>↑</span>")
      : (language === "de" ? "mehr <span>↓</span>" : "more <span>↓</span>");
  }
  try {
    window.localStorage.setItem(languageStorageKey, language);
  } catch {
    // Continue with the selected language if storage is unavailable.
  }
}

function restoreLanguage() {
  let savedLanguage = "de";
  try {
    savedLanguage = window.localStorage.getItem(languageStorageKey) ?? "de";
  } catch {
    savedLanguage = "de";
  }
  applyLanguage(savedLanguage === "en" ? "en" : "de");
}

restoreLanguage();

function saveTheme(theme) {
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Some local file/browser configurations can block storage.
  }
}

function restoreTheme() {
  let savedTheme = "dark";

  try {
    savedTheme = window.localStorage.getItem(themeStorageKey) ?? "dark";
  } catch {
    savedTheme = "dark";
  }

  if (savedTheme === "light" || savedTheme === "pride") {
    document.body.classList.add("white-mode");
  }

  if (savedTheme === "pride") {
    document.body.classList.add("pride-mode");
    startPrideRain();
  }
}

restoreTheme();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => observer.observe(item));

projectToggle?.addEventListener("click", () => {
  const expanded = projectToggle.getAttribute("aria-expanded") === "true";
  projectToggle.setAttribute("aria-expanded", String(!expanded));
  projectToggle.innerHTML = expanded
    ? (currentLanguage === "de" ? "mehr <span>↓</span>" : "more <span>↓</span>")
    : (currentLanguage === "de" ? "weniger <span>↑</span>" : "less <span>↑</span>");
  document.querySelectorAll(".extra-project").forEach((project) => {
    project.classList.toggle("is-visible", !expanded);
  });
});

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen
    ? (currentLanguage === "de" ? "Menü öffnen" : "Open menu")
    : (currentLanguage === "de" ? "Menü schließen" : "Close menu"));
  nav?.classList.toggle("is-open", !isOpen);
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", currentLanguage === "de" ? "Menü öffnen" : "Open menu");
    nav.classList.remove("is-open");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
    menuToggle.click();
  }
});

languageButton?.addEventListener("click", () => {
  applyLanguage(currentLanguage === "de" ? "en" : "de");
});

document.querySelectorAll(".social-link").forEach((link) => {
  if (!link.dataset.account) {
    link.addEventListener("click", (event) => event.preventDefault());
  }
});

themeButton?.addEventListener("click", () => {
  document.body.classList.toggle("white-mode");
  const now = Date.now();
  themeClicks = [...themeClicks.filter((time) => now - time < 2000), now];

  if (themeClicks.length >= 10) {
    document.body.classList.add("pride-mode");
    saveTheme("pride");
    themeClicks = [];
    startPrideRain();
    return;
  }

  saveTheme(document.body.classList.contains("white-mode") ? "light" : "dark");
});

function startPrideRain() {
  if (prideRainInterval) {
    return;
  }

  spawnPrideFlags();
  prideRainInterval = window.setInterval(spawnPrideFlags, 700);
  spawnHearts();
  heartRainInterval = window.setInterval(spawnHearts, 533);
}

function spawnPrideFlags() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 5; index += 1) {
    const flag = document.createElement("span");
    flag.className = "pride-flag";
    flag.dataset.flag = prideFlags[Math.floor(Math.random() * prideFlags.length)];
    flag.style.left = `${Math.random() * 92 + 4}%`;
    flag.style.setProperty("--flag-delay", `${Math.random() * 400}ms`);
    flag.style.setProperty("--flag-drift", `${(Math.random() - 0.5) * 180}px`);
    flag.style.setProperty("--flag-size", `${1.3 + Math.random() * 1.5}rem`);
    fragment.appendChild(flag);
    window.setTimeout(() => flag.remove(), 4200);
  }

  document.body.appendChild(fragment);
}

function spawnHearts() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 5; index += 1) {
    const heart = document.createElement("span");
    heart.className = "pride-heart";
    heart.style.left = `${Math.random() * 92 + 4}%`;
    heart.style.setProperty("--heart-delay", `${Math.random() * 250}ms`);
    heart.style.setProperty("--heart-drift", `${(Math.random() - 0.5) * 160}px`);
    heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    heart.style.setProperty("--heart-size", `${1 + Math.random() * 1.5}rem`);
    fragment.appendChild(heart);
    window.setTimeout(() => heart.remove(), 4200);
  }

  document.body.appendChild(fragment);
}

document.querySelectorAll("a[href^='#']").forEach((link) => {
  link.addEventListener("click", () => window.setTimeout(() => document.activeElement?.blur(), 0));
});
