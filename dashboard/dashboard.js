function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function showMessage(el, text, kind) {
  el.textContent = text;
  el.className = `cr-form-message ${kind === "error" ? "is-error" : "is-success"}`;
}

function formatKickoff(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

async function loadFixturesList() {
  const container = document.getElementById("fixtures-list");
  try {
    const res = await fetch("/api/fixtures");
    if (!res.ok) throw new Error("failed");
    const items = await res.json();

    if (items.length === 0) {
      container.innerHTML = '<p class="cr-empty">No fixtures yet. Add one on the left.</p>';
      return;
    }

    container.innerHTML = items
      .map(
        (item) => `
          <div class="cr-list-row" data-id="${item.id}">
            <div class="cr-list-row-main">
              <div class="cr-list-row-title">${escapeHtml(item.homeTeam)} vs ${escapeHtml(item.awayTeam)}</div>
              <div class="cr-list-row-meta">${escapeHtml(item.competition)} · ${formatKickoff(item.matchDate)}</div>
            </div>
            <button class="cr-delete" data-type="fixtures" data-id="${item.id}" aria-label="Remove fixture" title="Remove">×</button>
          </div>
        `,
      )
      .join("");
  } catch {
    container.innerHTML = '<p class="cr-empty">Could not load fixtures.</p>';
  }
}

async function loadNewsList() {
  const container = document.getElementById("news-list");
  try {
    const res = await fetch("/api/news");
    if (!res.ok) throw new Error("failed");
    const items = await res.json();

    if (items.length === 0) {
      container.innerHTML = '<p class="cr-empty">No stories yet. Add one on the right.</p>';
      return;
    }

    container.innerHTML = items
      .map(
        (item) => `
          <div class="cr-list-row" data-id="${item.id}">
            <div class="cr-list-row-main">
              <div class="cr-list-row-title">${escapeHtml(item.title)}</div>
              <div class="cr-list-row-meta">${escapeHtml(item.category)} · ${escapeHtml(item.author)}</div>
            </div>
            <button class="cr-delete" data-type="news" data-id="${item.id}" aria-label="Remove story" title="Remove">×</button>
          </div>
        `,
      )
      .join("");
  } catch {
    container.innerHTML = '<p class="cr-empty">Could not load news.</p>';
  }
}

async function handleDelete(event) {
  const button = event.target.closest(".cr-delete");
  if (!button) return;

  const { type, id } = button.dataset;
  button.disabled = true;

  try {
    const res = await fetch(`/api/${type}?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("failed");
    if (type === "fixtures") await loadFixturesList();
    else await loadNewsList();
  } catch {
    button.disabled = false;
  }
}

function setupFixtureForm() {
  const form = document.getElementById("fixture-form");
  const message = document.getElementById("fixture-message");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector(".cr-submit");
    submitBtn.disabled = true;

    const data = Object.fromEntries(new FormData(form).entries());
    const matchDate = data.matchDate ? new Date(data.matchDate).toISOString() : "";

    try {
      const res = await fetch("/api/fixtures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, matchDate }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Could not publish fixture");
      }

      form.reset();
      showMessage(message, "Fixture published to the site.", "success");
      await loadFixturesList();
    } catch (err) {
      showMessage(message, err.message, "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function setupNewsForm() {
  const form = document.getElementById("news-form");
  const message = document.getElementById("news-message");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector(".cr-submit");
    submitBtn.disabled = true;

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Could not publish story");
      }

      form.reset();
      showMessage(message, "Story published to the site.", "success");
      await loadNewsList();
    } catch (err) {
      showMessage(message, err.message, "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

document.addEventListener("click", handleDelete);
setupFixtureForm();
setupNewsForm();
loadFixturesList();
loadNewsList();
