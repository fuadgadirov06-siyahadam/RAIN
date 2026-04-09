const STORAGE_KEYS = {
  inquiries: "rain_inquiries",
  portalUser: "rain_portal_user",
};

const state = {
  siteData: null,
  activeSector: "all",
  solutionQuery: "",
};

document.addEventListener("DOMContentLoaded", () => {
  bootstrap().catch((error) => {
    console.error(error);
    showToast("Site data could not be loaded.");
  });
});

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

function byId(id) {
  return document.getElementById(id);
}

function writeText(id, value) {
  const node = byId(id);
  if (node) {
    node.textContent = value;
  }
}

function renderFooterLinks(links) {
  const container = byId("footer-links");
  if (!container) {
    return;
  }

  container.innerHTML = links
    .map((link) => `<a href="${link.href}">${link.label}</a>`)
    .join("");
}

function markCurrentNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === page) {
      link.classList.add("is-current");
    }
  });
}

function setupRevealAnimations() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  items.forEach((item) => observer.observe(item));
}

function setupSearchForms() {
  document.querySelectorAll('[data-role="solution-search"]').forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = String(new FormData(form).get("query") || "").trim();

      if (document.body.dataset.page === "solutions") {
        state.solutionQuery = query;
        updateSolutionsUrl();
        renderSolutionsPage();
        return;
      }

      const url = new URL("./solutions.html", window.location.href);
      if (query) {
        url.searchParams.set("q", query);
      }
      window.location.href = url.toString();
    });
  });
}

function showToast(message) {
  const toast = byId("site-toast");
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
}

function loadInquiries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.inquiries) || "[]");
  } catch {
    return [];
  }
}

function saveInquiry(record) {
  const current = loadInquiries();
  current.unshift(record);
  localStorage.setItem(STORAGE_KEYS.inquiries, JSON.stringify(current));
}

function generateRequestId() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randomPart = Math.floor(Math.random() * 900 + 100);
  return `RAIN-${datePart}-${randomPart}`;
}

function clearFieldErrors(form) {
  form.querySelectorAll("[data-error-for]").forEach((node) => {
    node.textContent = "";
  });
  form.querySelectorAll("input, textarea, select").forEach((field) => {
    field.classList.remove("field-error");
  });
}

function applyFieldErrors(form, errors) {
  Object.entries(errors).forEach(([fieldName, message]) => {
    const field = form.elements.namedItem(fieldName);
    if (field) {
      field.classList.add("field-error");
    }

    const errorNode = form.querySelector(`[data-error-for="${fieldName}"]`);
    if (errorNode) {
      errorNode.textContent = message;
    }
  });
}

function validateInquiry(payload) {
  const errors = {};

  if (!payload.name || payload.name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  }
  if (!payload.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!payload.company || payload.company.trim().length < 2) {
    errors.company = "Please enter an organization.";
  }
  if (!payload.message || payload.message.trim().length < 18) {
    errors.message = "Please add a few more details.";
  }

  return errors;
}

function renderFaqStack(containerId, faqItems) {
  const container = byId(containerId);
  if (!container) {
    return;
  }

  container.innerHTML = faqItems
    .map(
      (item) => `
        <details class="faq-item">
          <summary>${item.question}</summary>
          <p>${item.answer}</p>
        </details>
      `
    )
    .join("");
}

function renderSharedFrame() {
  const { company, status, footer } = state.siteData;
  writeText("status-label", status.label);
  writeText("status-value", status.value);
  writeText("footer-summary", footer.summary);
  writeText("footer-year", `${String.fromCharCode(169)} ${new Date().getFullYear()} ${company.name}`);
  renderFooterLinks(footer.links);
  markCurrentNav();
}

function renderHomePage() {
  const { company, stats, shortcuts, news, faq, sectors } = state.siteData;

  writeText("hero-headline", company.headline);
  writeText("hero-tagline", company.tagline);
  writeText("hero-mission", company.mission);
  writeText("company-intro", company.intro);

  const statsContainer = byId("home-stats");
  if (statsContainer) {
    statsContainer.innerHTML = stats
      .map(
        (item) => `
          <article class="stat-card">
            <strong>${item.value}</strong>
            <span>${item.label}</span>
            <small>${item.detail}</small>
          </article>
        `
      )
      .join("");
  }

  const shortcutsContainer = byId("home-shortcuts");
  if (shortcutsContainer) {
    shortcutsContainer.innerHTML = shortcuts
      .map(
        (item) => `
          <a class="shortcut-card" href="${item.href}">
            <strong>${item.title}</strong>
            <span>${item.description}</span>
          </a>
        `
      )
      .join("");
  }

  const newsContainer = byId("news-list");
  if (newsContainer) {
    newsContainer.innerHTML = news
      .map(
        (item) => `
          <article class="news-card">
            <div class="news-meta">
              <span>${item.category}</span>
              <span>${item.date}</span>
            </div>
            <h3>${item.title}</h3>
            <p>${item.summary}</p>
            <button class="button button-secondary button-small" type="button" data-toast="${item.content}">
              Read summary
            </button>
          </article>
        `
      )
      .join("");
  }

  renderFaqStack("faq-preview", faq.slice(0, 4));

  const sectorPreview = byId("sector-preview-grid");
  if (sectorPreview) {
    sectorPreview.innerHTML = sectors
      .map(
        (sector) => `
          <article class="sector-preview-card">
            <span class="card-tag">${sector.badge}</span>
            <h3>${sector.name}</h3>
            <p>${sector.summary}</p>
            <div class="card-actions">
              <a class="button button-secondary button-small" href="./solutions.html?sector=${encodeURIComponent(sector.id)}">View fit</a>
              <a class="button button-ghost button-small" href="./contact.html?sector=${encodeURIComponent(sector.name)}">Discuss</a>
            </div>
          </article>
        `
      )
      .join("");
  }
}

function updateSolutionsUrl() {
  const url = new URL(window.location.href);
  if (state.solutionQuery) {
    url.searchParams.set("q", state.solutionQuery);
  } else {
    url.searchParams.delete("q");
  }

  if (state.activeSector !== "all") {
    url.searchParams.set("sector", state.activeSector);
  } else {
    url.searchParams.delete("sector");
  }

  window.history.replaceState({}, "", url.toString());
}

function matchesSector(sector, query) {
  if (!query) {
    return true;
  }

  const haystack = [
    sector.name,
    sector.badge,
    sector.use_case,
    sector.summary,
    ...sector.applications,
    ...sector.benefits,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function renderSolutionsPage() {
  const params = new URLSearchParams(window.location.search);
  if (!state.solutionQuery) {
    state.solutionQuery = params.get("q") || "";
  }
  if (state.activeSector === "all" && params.get("sector")) {
    state.activeSector = params.get("sector");
  }

  const searchInput = byId("solutions-search");
  if (searchInput) {
    searchInput.value = state.solutionQuery;
  }

  const filters = [{ id: "all", name: "All sectors" }, ...state.siteData.sectors.map((item) => ({ id: item.id, name: item.name }))];
  const filterBar = byId("sector-filters");
  if (filterBar) {
    filterBar.innerHTML = filters
      .map(
        (filter) => `
          <button
            class="filter-pill ${filter.id === state.activeSector ? "is-active" : ""}"
            type="button"
            data-sector-filter="${filter.id}"
          >
            ${filter.name}
          </button>
        `
      )
      .join("");

    filterBar.querySelectorAll("[data-sector-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeSector = button.dataset.sectorFilter;
        updateSolutionsUrl();
        renderSolutionsPage();
      });
    });
  }

  const filtered = state.siteData.sectors.filter((sector) => {
    const sectorMatch = state.activeSector === "all" || sector.id === state.activeSector;
    return sectorMatch && matchesSector(sector, state.solutionQuery);
  });

  writeText(
    "solutions-results-caption",
    `${filtered.length} result${filtered.length === 1 ? "" : "s"} shown${state.solutionQuery ? ` for "${state.solutionQuery}"` : ""}.`
  );

  const grid = byId("solutions-grid");
  if (grid) {
    grid.innerHTML = filtered
      .map(
        (sector) => `
          <article class="solution-card">
            <div class="solution-card-head">
              <span class="card-tag">${sector.badge}</span>
              <h3>${sector.name}</h3>
              <p class="solution-use-case">${sector.use_case}</p>
            </div>
            <p>${sector.summary}</p>
            <div class="solution-lists">
              <div class="list-block">
                <h4>Applications</h4>
                <ul class="list-clean">
                  ${sector.applications.map((item) => `<li>${item}</li>`).join("")}
                </ul>
              </div>
              <div class="list-block">
                <h4>Why it fits</h4>
                <ul class="list-clean">
                  ${sector.benefits.map((item) => `<li>${item}</li>`).join("")}
                </ul>
              </div>
            </div>
            <div class="card-actions">
              <a class="button button-primary button-small" href="./contact.html?sector=${encodeURIComponent(sector.name)}">Discuss sector</a>
              <a class="button button-ghost button-small" href="./platform.html">View platform</a>
            </div>
          </article>
        `
      )
      .join("");
  }
}

function renderPlatformPage() {
  const { platform } = state.siteData;

  const layerContainer = byId("platform-layers");
  if (layerContainer) {
    layerContainer.innerHTML = platform.layers
      .map(
        (layer) => `
          <article class="layer-card">
            <span class="layer-stage">${layer.stage}</span>
            <h3>${layer.title}</h3>
            <p>${layer.summary}</p>
            <ul class="list-clean">
              ${layer.items.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </article>
        `
      )
      .join("");
  }

  const modules = byId("platform-modules");
  if (modules) {
    modules.innerHTML = platform.modules
      .map(
        (item) => `
          <article class="module-card">
            <h3>${item.title}</h3>
            <p>${item.copy}</p>
          </article>
        `
      )
      .join("");
  }

  const implementation = byId("implementation-grid");
  if (implementation) {
    implementation.innerHTML = platform.implementation
      .map(
        (item) => `
          <article class="implementation-card">
            <h3>${item.title}</h3>
            <p>${item.copy}</p>
          </article>
        `
      )
      .join("");
  }

  const resources = byId("resource-grid");
  if (resources) {
    resources.innerHTML = platform.resources
      .map(
        (item) => `
          <article class="resource-card">
            <span class="card-tag">${item.meta}</span>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <button class="button button-secondary button-small" type="button" data-toast="${item.actionMessage}">
              ${item.actionLabel}
            </button>
          </article>
        `
      )
      .join("");
  }
}

function renderContactPage() {
  const { methods, office } = state.siteData.contact;
  const methodsContainer = byId("contact-methods");
  if (methodsContainer) {
    methodsContainer.innerHTML = methods
      .map(
        (item) => `
          <article class="contact-method-card">
            <p class="card-eyebrow">${item.detail}</p>
            <h3>${item.title}</h3>
            <p>${item.copy}</p>
            <a class="button button-secondary button-small" href="${item.actionHref}">${item.actionLabel}</a>
          </article>
        `
      )
      .join("");
  }

  const officeInfo = byId("office-info");
  if (officeInfo) {
    officeInfo.innerHTML = `
      <h3>${office.title}</h3>
      <p>${office.address}</p>
      <p>${office.hours}</p>
      <p>${office.note}</p>
    `;
  }

  setupContactForm();
}

function setupContactForm() {
  const form = byId("contact-form");
  const status = byId("form-status");
  const sectorSelect = byId("sector-select");
  const receipt = byId("inquiry-receipt");

  if (!form || !sectorSelect) {
    return;
  }

  sectorSelect.innerHTML = `
    <option value="">Select a sector</option>
    ${state.siteData.sectors.map((sector) => `<option value="${sector.name}">${sector.name}</option>`).join("")}
  `;

  const preselectedSector = new URLSearchParams(window.location.search).get("sector");
  if (preselectedSector) {
    sectorSelect.value = preselectedSector;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    status.textContent = "";
    status.className = "form-status";

    const payload = Object.fromEntries(new FormData(form).entries());
    const errors = validateInquiry(payload);

    if (Object.keys(errors).length > 0) {
      applyFieldErrors(form, errors);
      status.textContent = "Please review the highlighted fields.";
      status.classList.add("error");
      return;
    }

    const record = {
      id: generateRequestId(),
      createdAt: new Date().toLocaleString(),
      ...payload,
    };

    saveInquiry(record);
    form.reset();
    if (preselectedSector) {
      sectorSelect.value = preselectedSector;
    }

    if (receipt) {
      receipt.innerHTML = `
        <h3>Request received</h3>
        <p><strong>Reference:</strong> ${record.id}</p>
        <p><strong>Sector:</strong> ${record.sector || "General inquiry"}</p>
        <p><strong>Submitted:</strong> ${record.createdAt}</p>
        <p>Our team will review your request under this reference number.</p>
      `;
    }

    status.textContent = "Your request has been recorded successfully.";
    status.classList.add("success");
    showToast(`Inquiry ${record.id} submitted successfully.`);
  });
}

function getPortalUser() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.portalUser) || "null");
  } catch {
    return null;
  }
}

function setPortalUser(user) {
  sessionStorage.setItem(STORAGE_KEYS.portalUser, JSON.stringify(user));
}

function clearPortalUser() {
  sessionStorage.removeItem(STORAGE_KEYS.portalUser);
}

function renderPortalPage() {
  const { portal } = state.siteData;
  writeText("portal-title", portal.welcome);
  writeText("portal-subtitle", portal.subtitle);

  const loginView = byId("portal-login-view");
  const dashboard = byId("portal-dashboard");
  const loginForm = byId("portal-login-form");
  const status = byId("portal-status");
  const logout = byId("portal-logout");

  const showDashboard = (user) => {
    if (loginView) {
      loginView.classList.add("hidden");
    }
    if (dashboard) {
      dashboard.classList.remove("hidden");
    }
    writeText("portal-user-name", `Welcome, ${user.name}`);

    const metrics = byId("portal-metrics");
    if (metrics) {
      metrics.innerHTML = portal.metrics
        .map(
          (item) => `
            <article class="stat-card">
              <strong>${item.value}</strong>
              <span>${item.label}</span>
            </article>
          `
        )
        .join("");
    }

    const tools = byId("portal-tools");
    if (tools) {
      tools.innerHTML = portal.tools
        .map(
          (tool) => `
            <article class="tool-card">
              <h3>${tool.title}</h3>
              <p>${tool.description}</p>
              <button class="button button-secondary button-small" type="button" data-toast="${tool.message}">
                Open
              </button>
            </article>
          `
        )
        .join("");
    }

    const inquiryCount = loadInquiries().length;
    const history = byId("portal-history");
    if (history) {
      history.innerHTML = `
        <article class="history-card">
          <h3>Account snapshot</h3>
          <p><strong>Signed in as:</strong> ${user.email}</p>
          <p><strong>Recorded inquiries on this device:</strong> ${inquiryCount}</p>
          <p>Use the controls above to review reports, requests, and account tools.</p>
        </article>
      `;
    }
  };

  const storedUser = getPortalUser();
  if (storedUser) {
    showDashboard(storedUser);
  }

  if (loginForm && status) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      status.textContent = "";
      status.className = "form-status";

      const payload = Object.fromEntries(new FormData(loginForm).entries());
      const errors = [];

      if (!payload.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email.trim())) {
        errors.push("Enter a valid email.");
      }
      if (!payload.password || payload.password.length < 6) {
        errors.push("Password must be at least 6 characters.");
      }

      if (errors.length > 0) {
        status.textContent = errors.join(" ");
        status.classList.add("error");
        return;
      }

      const user = {
        email: payload.email.trim(),
        name: payload.email.trim().split("@")[0].replace(/[._-]/g, " "),
      };
      user.name = user.name.replace(/\b\w/g, (char) => char.toUpperCase());
      setPortalUser(user);
      status.textContent = "Signed in successfully.";
      status.classList.add("success");
      showDashboard(user);
      showToast("Portal access granted.");
    });
  }

  if (logout) {
    logout.addEventListener("click", () => {
      clearPortalUser();
      window.location.reload();
    });
  }
}

function setupToastButtons() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-toast]");
    if (!trigger) {
      return;
    }
    showToast(trigger.dataset.toast);
  });
}

async function bootstrap() {
  state.siteData = await fetchJson("./site-data.json");
  renderSharedFrame();
  setupSearchForms();
  setupToastButtons();

  const page = document.body.dataset.page;
  if (page === "home") {
    renderHomePage();
  }
  if (page === "solutions") {
    renderSolutionsPage();
  }
  if (page === "platform") {
    renderPlatformPage();
  }
  if (page === "contact") {
    renderContactPage();
  }
  if (page === "portal") {
    renderPortalPage();
  }

  setupRevealAnimations();
}
