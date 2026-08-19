/**
 * FootballZone Live Data Application
 * Fetches live football data from Football-Data.org API
 * Auto-refreshes every 60 seconds
 */

// Football-Data.org API endpoint (free tier)
const API_BASE = 'https://api.football-data.org/v4';
const API_KEY = 'demo'; // Using demo key - works with limited free tier

// Cache for storing fetched data
const cache = {
  matches: null,
  competitions: null,
  lastUpdate: null
};

// Leagues mapping
const LEAGUES = {
  'PL': 'Premier League',
  'CL': 'Champions League',
  'LA': 'La Liga',
  'SA': 'Serie A',
  'BL1': 'Bundesliga',
  'WC': 'World Cup'
};

/**
 * Fetch matches from the API with error handling
 */
async function fetchMatches() {
  try {
    // Fetch matches from the current and upcoming days
    const response = await fetch(`${API_BASE}/matches?status=SCHEDULED,LIVE,IN_PLAY&limit=50`, {
      headers: { 'X-Auth-Token': API_KEY }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}

/**
 * Fetch completed matches/results
 */
async function fetchResults() {
  try {
    const response = await fetch(`${API_BASE}/matches?status=FINISHED&limit=20`, {
      headers: { 'X-Auth-Token': API_KEY }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error('Error fetching results:', error);
    return [];
  }
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format time from date string
 */
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

/**
 * Format date only
 */
function formatDateOnly(dateString) {
  const date = new Date(dateString);
  const options = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Render upcoming fixtures
 */
async function renderFixtures() {
  const container = document.getElementById('fixture-list');
  
  try {
    const matches = await fetchMatches();
    
    if (!matches || matches.length === 0) {
      container.innerHTML = `
        <div class="error-message">
          <p>⚠️ No upcoming fixtures data available at the moment. Please try again later.</p>
        </div>
      `;
      return;
    }

    // Sort by date and limit to next 6 matches
    const sortedMatches = matches.sort((a, b) => 
      new Date(a.utcDate) - new Date(b.utcDate)
    ).slice(0, 6);

    const fixturesHTML = sortedMatches.map(match => `
      <div class="fixture-card">
        <div>
          <span class="competition">${match.competition?.name || 'COMPETITION'}</span>
          <h3>${match.homeTeam?.name || 'Team'} <strong>vs</strong> ${match.awayTeam?.name || 'Team'}</h3>
        </div>
        <div class="fixture-time">
          <strong>${formatTime(match.utcDate)}</strong>
          <small>${formatDateOnly(match.utcDate)}</small>
        </div>
      </div>
    `).join('');

    container.innerHTML = fixturesHTML;
  } catch (error) {
    console.error('Error rendering fixtures:', error);
    container.innerHTML = `
      <div class="error-message">
        <p>❌ Error loading fixtures. Please refresh the page.</p>
      </div>
    `;
  }
}

/**
 * Render latest results
 */
async function renderResults() {
  const container = document.getElementById('results-grid');
  
  try {
    const matches = await fetchResults();
    
    if (!matches || matches.length === 0) {
      container.innerHTML = `
        <div class="error-message" style="grid-column: 1/-1;">
          <p>⚠️ No completed matches available at the moment.</p>
        </div>
      `;
      return;
    }

    // Show last 6 results
    const recentMatches = matches.slice(0, 6);

    const resultsHTML = recentMatches.map(match => {
      const homeScore = match.score?.fullTime?.home !== null ? match.score.fullTime.home : '-';
      const awayScore = match.score?.fullTime?.away !== null ? match.score.fullTime.away : '-';
      
      return `
        <div class="result-card">
          <span class="competition">${match.competition?.name || 'COMPETITION'}</span>
          <h3>${match.homeTeam?.name || 'Team'}</h3>
          <div class="score">${homeScore} : ${awayScore}</div>
          <h3>${match.awayTeam?.name || 'Team'}</h3>
          <small>${formatDateOnly(match.utcDate)}</small>
        </div>
      `;
    }).join('');

    container.innerHTML = resultsHTML;
  } catch (error) {
    console.error('Error rendering results:', error);
    container.innerHTML = `
      <div class="error-message" style="grid-column: 1/-1;">
        <p>❌ Error loading results. Please refresh the page.</p>
      </div>
    `;
  }
}

/**
 * Render news section with sample data
 * (Note: Football-Data.org API doesn't provide news, so we'll create sample cards
 * that link to popular football news sources)
 */
function renderNews() {
  const container = document.getElementById('news-grid');
  
  const newsItems = [
    {
      category: 'FOOTBALL NEWS',
      title: 'Latest football stories',
      description: 'Follow verified football news, club updates and important stories from around the world.',
      author: 'FootballZone Staff',
      icon: '⚽'
    },
    {
      category: 'LEAGUES',
      title: 'Major league updates',
      description: 'Follow important updates from Europe\'s biggest football competitions with live scores.',
      author: 'FootballZone Staff',
      icon: '🏆'
    },
    {
      category: 'CLUBS',
      title: 'Club news',
      description: 'Publish verified news about clubs, managers and players from official sources.',
      author: 'FootballZone Staff',
      icon: '👕'
    }
  ];

  const newsHTML = newsItems.map((item, index) => `
    <article class="news-card ${index === 0 ? 'featured' : ''}">
      <div class="news-image football-image">${item.icon}</div>
      <div class="news-content">
        <span class="category">${item.category}</span>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <small>${item.author}</small>
      </div>
    </article>
  `).join('');

  container.innerHTML = newsHTML;
}

/**
 * Update breaking news with live fixture info
 */
async function updateBreakingNews() {
  try {
    const matches = await fetchMatches();
    const breakingText = document.getElementById('breaking-text');
    
    if (matches && matches.length > 0) {
      const nextMatch = matches[0];
      const breakingMessage = `⚡ Next Match: ${nextMatch.homeTeam?.name || 'Team A'} vs ${nextMatch.awayTeam?.name || 'Team B'} - ${formatTime(nextMatch.utcDate)}`;
      breakingText.textContent = breakingMessage;
    } else {
      breakingText.textContent = '✓ FootballZone is live and auto-updating every 60 seconds';
    }
  } catch (error) {
    console.error('Error updating breaking news:', error);
  }
}

/**
 * Update the last update timestamp
 */
function updateLastUpdate() {
  const lastUpdateEl = document.getElementById('last-update');
  const refreshStatus = document.getElementById('refresh-status');
  
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  lastUpdateEl.textContent = `Updated: ${timeString}`;
  refreshStatus.classList.add('active');
  
  // Fade out the indicator after a brief moment
  setTimeout(() => {
    refreshStatus.classList.remove('active');
  }, 1000);
}

/**
 * Initialize and load all data
 */
async function initializeApp() {
  console.log('FootballZone: Initializing live data...');
  
  updateLastUpdate();
  
  await Promise.all([
    renderFixtures(),
    renderResults(),
    updateBreakingNews()
  ]);
  
  renderNews();
}

/**
 * Set up automatic refresh every 60 seconds
 */
function setupAutoRefresh() {
  setInterval(() => {
    console.log('FootballZone: Auto-refreshing data...');
    initializeApp();
  }, 60000); // Refresh every 60 seconds
}

/**
 * Search functionality
 */
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    if (!query) {
      // Reset view if search is cleared
      location.hash = '#home';
      return;
    }
    
    // Simple search - navigate to relevant sections
    if (query.includes('fixture') || query.includes('match')) {
      location.hash = '#fixtures';
    } else if (query.includes('result') || query.includes('score')) {
      location.hash = '#results';
    } else if (query.includes('news') || query.includes('story')) {
      location.hash = '#latest';
    } else if (query.includes('league') || query.includes('competition')) {
      location.hash = '#leagues';
    } else if (query.includes('transfer')) {
      location.hash = '#transfers';
    }
  });
}

/**
 * Main initialization on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('FootballZone: Page loaded');
  
  // Initialize app
  initializeApp();
  
  // Setup auto-refresh
  setupAutoRefresh();
  
  // Setup search
  setupSearch();
});

/**
 * Graceful error handling for API failures
 */
window.addEventListener('error', (event) => {
  console.error('FootballZone Error:', event.error);
});
