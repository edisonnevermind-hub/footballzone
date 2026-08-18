const CATEGORY_ICONS = {
  news: "⚽",
  transfers: "🔄",
  clubs: "👕",
  leagues: "🏆",
  players: "🌟",
};

function iconForCategory(category) {
  const key = (category || "").toLowerCase();
  return CATEGORY_ICONS[key] || "⚽";
}

function formatFixtureDate(isoString) {
  const date = new Date(isoString);
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const day = date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
  return { time, day };
}

async function loadNews() {
  const grid = document.getElementById("news-grid");
  if (!grid) return;

  try {
    const res = await fetch("/api/news");
    if (!res.ok) throw new Error("Failed to load news");
    const items = await res.json();

    if (items.length === 0) {
      grid.innerHTML = '<p class="empty-text">No news yet. Add your first story from the Dashboard.</p>';
      return;
    }

    grid.innerHTML = items
      .map((item, index) => `
        <article class="news-card${index === 0 ? " featured" : ""}">
          <div class="news-image">${iconForCategory(item.category)}</div>
          <div class="news-content">
            <span class="category">${escapeHtml((item.category || "News").toUpperCase())}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.excerpt || "")}</p>
            <small>${escapeHtml(item.author || "FootballZone Staff")}</small>
          </div>
        </article>
      `)
      .join("");
  } catch {
    grid.innerHTML = '<p class="empty-text">Unable to load news right now.</p>';
  }
}

async function loadFixtures() {
  const list = document.getElementById("fixture-list");
  if (!list) return;

  try {
    const res = await fetch("/api/fixtures");
    if (!res.ok) throw new Error("Failed to load fixtures");
    const items = await res.json();

    if (items.length === 0) {
      list.innerHTML = '<p class="empty-text">No fixtures scheduled yet. Add one from the Dashboard.</p>';
      return;
    }

    list.innerHTML = items
      .map((item) => {
        const { time, day } = formatFixtureDate(item.matchDate);
        return `
          <div class="fixture-card">
            <div>
              <span class="competition">${escapeHtml(item.competition.toUpperCase())}</span>
              <h3>${escapeHtml(item.homeTeam)} <strong>vs</strong> ${escapeHtml(item.awayTeam)}</h3>
            </div>
            <div class="fixture-time">
              <strong>${time}</strong>
              <small>${day}</small>
            </div>
          </div>
        `;
      })
      .join("");
  } catch {
    list.innerHTML = '<p class="empty-text">Unable to load fixtures right now.</p>';
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

loadNews();
loadFixtures();
