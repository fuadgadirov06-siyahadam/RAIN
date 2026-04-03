const state = {
  siteData: null,
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Request failed.");
    error.payload = data;
    throw error;
  }

  return data;
}

function renderHero(company) {
  document.getElementById("hero-headline").textContent = company.headline;
  document.getElementById("hero-tagline").textContent = company.tagline;
  document.getElementById("hero-mission").textContent = company.mission;
}

function renderStats(stats) {
  const container = document.getElementById("stats-grid");
  container.innerHTML = stats
    .map(
      (item) => `
        <article class="signal-stat">
          <strong>${item.value}</strong>
          <span>${item.label}</span>
          <span>${item.detail}</span>
        </article>
      `
    )
    .join("");
}

function renderLayers(layers) {
  const container = document.getElementById("layers-grid");
  container.innerHTML = layers
    .map(
      (layer) => `
        <article class="layer-card">
          <span class="stage">${layer.stage}</span>
          <h3>${layer.title}</h3>
          <p>${layer.summary}</p>
          <ul>
            ${layer.features.map((feature) => `<li>${feature}</li>`).join("")}
          </ul>
        </article>
      `
    )
    .join("");
}

function renderCapabilities(capabilities) {
  const container = document.getElementById("capabilities-grid");
  container.innerHTML = capabilities
    .map(
      (capability) => `
        <article class="capability-card">
          <h3>${capability.title}</h3>
          <p>${capability.copy}</p>
        </article>
      `
    )
    .join("");
}

function renderSectors(sectors) {
  const sectorGrid = document.getElementById("sectors-grid");
  const sectorSelect = document.getElementById("sector-select");

  sectorGrid.innerHTML = sectors
    .map(
      (sector) => `
        <article class="sector-card">
          <h3>${sector.name}</h3>
          <p><strong>Use case:</strong> ${sector.use_case}</p>
          <p>${sector.benefit}</p>
        </article>
      `
    )
    .join("");

  sectorSelect.innerHTML = `
    <option value="">Select a sector</option>
    ${sectors.map((sector) => `<option value="${sector.name}">${sector.name}</option>`).join("")}
  `;
}

function renderRevenue(revenueModel) {
  const container = document.getElementById("revenue-grid");
  container.innerHTML = revenueModel
    .map(
      (item) => `
        <article class="revenue-card">
          <h3>${item.name}</h3>
          <p>${item.detail}</p>
        </article>
      `
    )
    .join("");
}

function renderRoadmap(roadmap) {
  const container = document.getElementById("roadmap-grid");
  container.innerHTML = roadmap
    .map(
      (item) => `
        <article class="roadmap-card">
          <h3>${item.title}</h3>
          <p>${item.copy}</p>
        </article>
      `
    )
    .join("");
}

function renderFaq(faq) {
  const container = document.getElementById("faq-list");
  container.innerHTML = faq
    .map(
      (item) => `
        <article class="faq-item">
          <h3>${item.question}</h3>
          <p>${item.answer}</p>
        </article>
      `
    )
    .join("");
}

function setupRevealAnimations() {
  const items = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  items.forEach((item) => observer.observe(item));
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

    const messageNode = form.querySelector(`[data-error-for="${fieldName}"]`);
    if (messageNode) {
      messageNode.textContent = message;
    }
  });
}

function setupContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFieldErrors(form);
    status.textContent = "Submitting...";
    status.className = "form-status";

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetchJson("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      status.textContent = response.message;
      status.classList.add("success");
      form.reset();
    } catch (error) {
      status.textContent = error.message;
      status.classList.add("error");

      if (error.payload?.errors) {
        applyFieldErrors(form, error.payload.errors);
      }
    }
  });
}

async function loadHealth() {
  try {
    const data = await fetchJson("/api/health");
    document.getElementById("health-text").textContent = `${data.service} online`;
  } catch (error) {
    document.getElementById("health-text").textContent = "Backend unavailable";
  }
}

async function bootstrap() {
  state.siteData = await fetchJson("/api/site-data");
  renderHero(state.siteData.company);
  renderStats(state.siteData.stats);
  renderLayers(state.siteData.layers);
  renderCapabilities(state.siteData.capabilities);
  renderSectors(state.siteData.sectors);
  renderRevenue(state.siteData.revenue_model);
  renderRoadmap(state.siteData.roadmap);
  renderFaq(state.siteData.faq);
  document.getElementById("footer-year").textContent = `© ${new Date().getFullYear()} RAIN`;
  setupRevealAnimations();
  setupContactForm();
  loadHealth();
}

bootstrap().catch((error) => {
  console.error(error);
  document.getElementById("hero-headline").textContent = "RAIN";
  document.getElementById("hero-tagline").textContent = "The website could not load startup data.";
  document.getElementById("hero-mission").textContent = "Check the backend server and refresh the page.";
});
