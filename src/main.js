import './style.css';
import aiBrainImg from './assets/ai_gaming_core.png';

// Global variables & state
let state = {
  connected: false,
  apiKey: '',
  steamId: '',
  username: '',
  games: [],
  filters: {
    search: '',
    statuses: ['not-started', 'want-to-play', 'playing', 'played', 'abandoned'],
    genres: []
  }
};

// Target Steam Web API Proxy paths
const STEAM_PROXY_URL = '/api-steam';
const STEAM_STORE_PROXY_URL = '/api-steam-store';

// App elements
const elBrainImage = document.getElementById('ai-brain-image');
const elSearchInput = document.getElementById('search-input');
const elGamesGrid = document.getElementById('games-grid');
const elEmptyState = document.getElementById('empty-state');
const elGenreContainer = document.getElementById('genre-container');
const elFiltersStatusText = document.getElementById('filters-status-text');
const elBtnClearFilters = document.getElementById('btn-clear-filters');

// Stats counters
const elStatTotal = document.getElementById('stat-total');
const elStatPlaying = document.getElementById('stat-playing');
const elStatPlayed = document.getElementById('stat-played');
const elStatBacklog = document.getElementById('stat-backlog');
const elStatAbandoned = document.getElementById('stat-abandoned');

// Steam account display
const elSteamStatusLabel = document.getElementById('steam-status-label');
const elBtnSteamConnectTrigger = document.getElementById('btn-steam-connect-trigger');
const elBtnDemoMode = document.getElementById('btn-demo-mode');

// Modals
const elModalSync = document.getElementById('modal-sync');
const elModalAddGame = document.getElementById('modal-add-game');
const elFormSyncAccount = document.getElementById('form-sync-account');
const elFormAddGame = document.getElementById('form-add-game');

// Modal buttons
const elBtnAddGame = document.getElementById('btn-add-game');
const elBtnEmptyConnect = document.getElementById('btn-empty-connect');
const elBtnEmptyDemo = document.getElementById('btn-empty-demo');
const elBtnCloseSync = document.getElementById('btn-close-sync');
const elBtnCloseAdd = document.getElementById('btn-close-add');
const elBtnCancelSync = document.getElementById('btn-cancel-sync');
const elBtnCancelAdd = document.getElementById('btn-cancel-add');

// AI elements
const elBtnTriggerAi = document.getElementById('btn-trigger-ai');
const elAiConsoleLogs = document.getElementById('ai-console-logs');
const elAiResultCard = document.getElementById('ai-result-card');
const elAiBrainContainer = elBrainImage ? elBrainImage.parentElement : null;

// Initialize AI Core Art
if (elBrainImage) {
  elBrainImage.src = aiBrainImg;
}

/* ==========================================================================
   POPULAR STEAM GAMES DICTIONARY (For metadata enrichment)
   ========================================================================== */

const STEAM_GENRE_DICT = {
  570: ['MOBA', 'Estratégia', 'Competitivo', 'Multijogador'],
  730: ['FPS', 'Tiro', 'Competitivo', 'Multijogador'],
  292030: ['RPG', 'Aventura', 'Mundo Aberto', 'Narrativa'],
  1091500: ['RPG', 'Sci-Fi', 'Mundo Aberto', 'Ação'],
  1245620: ['RPG', 'Aventura', 'Fantasia', 'Difícil'],
  413150: ['Simulação', 'Casual', 'Indie', 'RPG'],
  1151640: ['Ação', 'Roguelike', 'Indie', 'Mitologia'],
  550: ['Tiro', 'Zumbis', 'Cooperativo', 'FPS'],
  252490: ['Sobrevivência', 'Mundo Aberto', 'Multijogador'],
  105600: ['Aventura', 'Sobrevivência', 'Crafting', 'Indie'],
  4000: ['Sandbox', 'Física', 'Multijogador'],
  218620: ['Tiro', 'Cooperativo', 'FPS', 'Ação'],
  271590: ['Ação', 'Mundo Aberto', 'Crime', 'Aventura'],
  359550: ['Tiro', 'FPS', 'Competitivo', 'Tático'],
  391540: ['RPG', 'Indie', 'Retro', 'Narrativa'],
  440: ['Tiro', 'FPS', 'Multijogador', 'Casual'],
  322330: ['Sobrevivência', 'Indie', 'Cooperativo', 'Crafting'],
  230410: ['Ação', 'Sci-Fi', 'Multijogador', 'Grátis'],
  578080: ['Battle Royale', 'Tiro', 'Multijogador', 'FPS'],
  1097150: ['Casual', 'Divertido', 'Multijogador', 'Plataforma'],
  1172470: ['Battle Royale', 'FPS', 'Tiro', 'Competitivo'],
  346110: ['Sobrevivência', 'Dinossauros', 'Mundo Aberto'],
  582010: ['Ação', 'RPG', 'Cooperativo', 'Monstros'],
  381210: ['Terror', 'Multijogador', 'Sobrevivência'],
  306130: ['RPG', 'Aventura', 'Mundo Aberto', 'Fantasia'],
  814380: ['Ação', 'Difícil', 'Aventura', 'Ninja'],
  268910: ['Ação', 'Plataforma', 'Retro', 'Difícil'],
  289070: ['Estratégia', 'Turnos', 'História'],
  620: ['Puzzle', 'Cooperativo', 'Física', 'Primeira Pessoa'],
  400: ['Puzzle', 'Física', 'Primeira Pessoa'],
  227300: ['Simulação', 'Dirigir', 'Casual'],
  236390: ['Simulação', 'Combate', 'Guerra'],
  242760: ['RPG', 'Fantasia', 'Aventura'],
  377160: ['RPG', 'Sobrevivência', 'Mundo Aberto', 'Sci-Fi'],
  251570: ['Ação', 'Aventura', 'Lindo'],
  211820: ['RPG', 'Aventura', 'Fantasia', 'Mundo Aberto'],
  220: ['Tiro', 'FPS', 'Sci-Fi', 'Clássico'],
  320: ['Tiro', 'FPS', 'Sci-Fi', 'Clássico']
};

function getGenresForApp(appid, title) {
  if (STEAM_GENRE_DICT[appid]) {
    return STEAM_GENRE_DICT[appid];
  }

  const titleLower = title.toLowerCase();
  const guessedGenres = [];

  if (titleLower.includes('simulator') || titleLower.includes('sim') || titleLower.includes('tycoon') || titleLower.includes('manager')) {
    guessedGenres.push('Simulação');
  }
  if (titleLower.includes('dead') || titleLower.includes('zombie') || titleLower.includes('evil') || titleLower.includes('fear') || titleLower.includes('horror')) {
    guessedGenres.push('Terror');
  }
  if (titleLower.includes('fifa') || titleLower.includes('fc') || titleLower.includes('football') || titleLower.includes('soccer') || titleLower.includes('tennis') || titleLower.includes('racing')) {
    guessedGenres.push('Esportes');
  }
  if (titleLower.includes('quest') || titleLower.includes('chronicles') || titleLower.includes('fantasy') || titleLower.includes('witch') || titleLower.includes('scrolls')) {
    guessedGenres.push('RPG');
  }
  if (titleLower.includes('duty') || titleLower.includes('strike') || titleLower.includes('shoot') || titleLower.includes('warfare')) {
    guessedGenres.push('Tiro', 'FPS');
  }
  if (titleLower.includes('lego') || titleLower.includes('party')) {
    guessedGenres.push('Casual');
  }
  if (titleLower.includes('space') || titleLower.includes('galaxy') || titleLower.includes('star')) {
    guessedGenres.push('Sci-Fi');
  }

  if (guessedGenres.length === 0) {
    guessedGenres.push('Aventura');
  }
  
  return guessedGenres;
}

/* ==========================================================================
   DEMO STEAM DATA
   ========================================================================== */

const DEMO_STEAM_GAMES = [
  {
    id: 'steam-292030',
    appid: 292030,
    title: 'The Witcher 3: Wild Hunt',
    platform: 'steam',
    genres: ['RPG', 'Mundo Aberto', 'Narrativa', 'Aventura'],
    playtime: 145,
    status: 'played',
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg',
    description: 'RPG de mundo aberto focado em história em um universo de fantasia visualmente deslumbrante.'
  },
  {
    id: 'steam-1091500',
    appid: 1091500,
    title: 'Cyberpunk 2077',
    platform: 'steam',
    genres: ['RPG', 'Sci-Fi', 'Mundo Aberto', 'Ação'],
    playtime: 48,
    status: 'playing',
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
    description: 'RPG de ação e aventura em mundo aberto ambientado em Night City.'
  },
  {
    id: 'steam-730',
    appid: 730,
    title: 'Counter-Strike 2',
    platform: 'steam',
    genres: ['FPS', 'Tiro', 'Competitivo', 'Multijogador'],
    playtime: 390,
    status: 'played',
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg',
    description: 'O jogo de tiro competitivo em primeira pessoa tático por excelência.'
  },
  {
    id: 'steam-1245620',
    appid: 1245620,
    title: 'Elden Ring',
    platform: 'steam',
    genres: ['RPG', 'Aventura', 'Fantasia', 'Difícil'],
    playtime: 110,
    status: 'played',
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg',
    description: 'RPG de ação e fantasia sombria desenvolvido pela FromSoftware. Desbrave as Terras Intermédias.'
  },
  {
    id: 'steam-1151640',
    appid: 1151640,
    title: 'Hades',
    platform: 'steam',
    genres: ['Ação', 'Roguelike', 'Indie', 'Mitologia'],
    playtime: 12,
    status: 'want-to-play',
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/1151640/header.jpg',
    description: 'Roguelike hack and slash onde você desafia o deus dos mortos enquanto batalha para sair do Submundo.'
  },
  {
    id: 'steam-413150',
    appid: 413150,
    title: 'Stardew Valley',
    platform: 'steam',
    genres: ['Simulação', 'Casual', 'Indie', 'RPG'],
    playtime: 8,
    status: 'want-to-play',
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/413150/header.jpg',
    description: 'RPG de vida no campo onde você decide começar uma nova vida herdando a fazenda do seu avô.'
  },
  {
    id: 'steam-620',
    appid: 620,
    title: 'Portal 2',
    platform: 'steam',
    genres: ['Puzzle', 'Cooperativo', 'Física', 'Primeira Pessoa'],
    playtime: 16,
    status: 'played',
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/620/header.jpg',
    description: 'O aclamado puzzle em primeira pessoa onde o jogador cria portais dimensionais para atravessar salas de teste.'
  },
  {
    id: 'steam-550',
    appid: 550,
    title: 'Left 4 Dead 2',
    platform: 'steam',
    genres: ['Tiro', 'Zumbis', 'Cooperativo', 'FPS'],
    playtime: 0,
    status: 'not-started',
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/550/header.jpg',
    description: 'Cooperativo de zumbis frenético ambientado em um apocalipse terrível.'
  },
  {
    id: 'steam-289070',
    appid: 289070,
    title: "Sid Meier's Civilization VI",
    platform: 'steam',
    genres: ['Estratégia', 'Turnos', 'História'],
    playtime: 0,
    status: 'not-started',
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/289070/header.jpg',
    description: 'Crie seu império e lidere-o desde a idade da pedra até a era da informação.'
  }
];

/* ==========================================================================
   APP STARTUP & LOCAL STORAGE CACHING
   ========================================================================== */

function initApp() {
  loadFromLocalStorage();
  setupEventListeners();
  updateStats();
  renderGenres();
  renderGames();
  updateAccountUI();
}

function loadFromLocalStorage() {
  const savedState = localStorage.getItem('steamhub_state');
  const savedGames = localStorage.getItem('steamhub_games');
  
  if (savedState) {
    const loadedState = JSON.parse(savedState);
    state.connected = loadedState.connected;
    state.apiKey = loadedState.apiKey;
    state.steamId = loadedState.steamId;
    state.username = loadedState.username;
  }
  
  if (savedGames) {
    state.games = JSON.parse(savedGames);
  }
}

function saveToLocalStorage() {
  const stateToSave = {
    connected: state.connected,
    apiKey: state.apiKey,
    steamId: state.steamId,
    username: state.username
  };
  localStorage.setItem('steamhub_state', JSON.stringify(stateToSave));
  localStorage.setItem('steamhub_games', JSON.stringify(state.games));
}

/* ==========================================================================
   STATISTICS & FILTERS RENDERING
   ========================================================================== */

function updateStats() {
  const total = state.games.length;
  const playing = state.games.filter(g => g.status === 'playing').length;
  const played = state.games.filter(g => g.status === 'played').length;
  const backlog = state.games.filter(g => g.status === 'want-to-play' || g.status === 'not-started').length;
  const abandoned = state.games.filter(g => g.status === 'abandoned').length;
  
  if (elStatTotal) elStatTotal.textContent = total;
  if (elStatPlaying) elStatPlaying.textContent = playing;
  if (elStatPlayed) elStatPlayed.textContent = played;
  if (elStatBacklog) elStatBacklog.textContent = backlog;
  if (elStatAbandoned) elStatAbandoned.textContent = abandoned;
}

function getUniqueGenres() {
  const genresSet = new Set();
  const sourceArray = state.games;
  sourceArray.forEach(game => {
    if (game.genres && Array.isArray(game.genres)) {
      game.genres.forEach(genre => genresSet.add(genre.trim()));
    }
  });
  return Array.from(genresSet).sort();
}

function renderGenres() {
  if (!elGenreContainer) return;
  
  const genres = getUniqueGenres();
  
  if (genres.length === 0) {
    elGenreContainer.innerHTML = '<span class="text-muted" style="font-size: 11px;">Nenhum gênero disponível.</span>';
    return;
  }
  
  elGenreContainer.innerHTML = genres.map(genre => {
    const isActive = state.filters.genres.includes(genre);
    return `<button class="genre-tag ${isActive ? 'active' : ''}" data-genre="${genre}">${genre}</button>`;
  }).join('');

  // Genre clicks
  elGenreContainer.querySelectorAll('.genre-tag').forEach(tagBtn => {
    tagBtn.addEventListener('click', () => {
      const genre = tagBtn.dataset.genre;
      if (state.filters.genres.includes(genre)) {
        state.filters.genres = state.filters.genres.filter(g => g !== genre);
      } else {
        state.filters.genres.push(genre);
      }
      renderGenres();
      renderGames();
    });
  });
}

function renderGames() {
  if (!elGamesGrid || !elEmptyState) return;

  const targetArray = state.games;

  // Empty Library state
  if (targetArray.length === 0) {
    elGamesGrid.style.display = 'none';
    elEmptyState.style.display = 'flex';
    
    elEmptyState.querySelector('h3').textContent = 'Sua biblioteca Steam está vazia';
    elEmptyState.querySelector('p').textContent = 'Sincronize com sua conta da Steam oficial utilizando sua chave de API ou carregue nossa biblioteca de demonstração para testar.';
    elEmptyState.querySelector('.empty-actions').style.display = 'flex';
    
    elFiltersStatusText.textContent = 'Mostrando 0 jogos';
    if (elBtnClearFilters) elBtnClearFilters.style.display = 'none';
    return;
  }

  elEmptyState.style.display = 'none';
  elGamesGrid.style.display = 'grid';

  // Apply filters
  const filteredGames = targetArray.filter(game => {
    // Search text match
    const matchesSearch = game.title.toLowerCase().includes(state.filters.search.toLowerCase());
    
    // Status match
    const matchesStatus = state.filters.statuses.includes(game.status);
    
    // Genre match
    const matchesGenres = state.filters.genres.every(g => game.genres.includes(g));

    return matchesSearch && matchesStatus && matchesGenres;
  });

  // Empty filtered state
  if (filteredGames.length === 0) {
    elGamesGrid.innerHTML = '';
    elGamesGrid.style.display = 'none';
    elEmptyState.style.display = 'flex';
    
    elEmptyState.querySelector('h3').textContent = 'Nenhum jogo encontrado';
    elEmptyState.querySelector('p').textContent = 'Altere as caixas de seleção de status ou limpe as tags de gêneros para voltar a ver seus títulos.';
    elEmptyState.querySelector('.empty-actions').style.display = 'none';
    
    elFiltersStatusText.textContent = 'Mostrando 0 jogos (filtros ativos)';
    if (elBtnClearFilters) elBtnClearFilters.style.display = 'inline-block';
    return;
  }

  // Restore empty actions layout
  elEmptyState.querySelector('.empty-actions').style.display = 'flex';
  
  if (elBtnClearFilters) {
    elBtnClearFilters.style.display = state.filters.genres.length > 0 || state.filters.search || state.filters.statuses.length < 5 ? 'inline-block' : 'none';
  }

  elFiltersStatusText.textContent = `Mostrando ${filteredGames.length} de ${targetArray.length} jogos`;


  // Draw Game Cards (Library)
  elGamesGrid.innerHTML = filteredGames.map(game => {
    const hoursText = game.playtime === 1 ? '1 hora' : `${game.playtime} horas`;
    const statusLabels = {
      'not-started': 'Não Iniciado (Backlog)',
      'want-to-play': 'Quero Jogar',
      'playing': 'Jogando',
      'played': 'Já Joguei',
      'abandoned': 'Abandonado'
    };

    return `
      <div class="game-card" data-id="${game.id}" data-status="${game.status}">
        <div class="game-image-wrapper">
          ${game.cover ? 
            `<img class="game-cover" src="${game.cover}" alt="Capa de ${game.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy">` : ''
          }
          <div class="game-cover-fallback" style="${game.cover ? 'display:none;' : ''}">
            <span class="fallback-title">${game.title}</span>
            <span class="fallback-logo">STEAM</span>
            <div class="fallback-genres">
              ${game.genres.slice(0, 3).map(g => `<span class="fallback-genre-pill">${g}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="game-info">
          <h4 class="game-title" title="${game.title}">${game.title}</h4>
          <div class="game-meta-row">
            <span class="game-playtime">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${hoursText}
            </span>
          </div>
          
          <!-- Dropdown Status Menu -->
          <div class="game-status-dropdown-wrapper">
            <button class="status-pill" onclick="window.toggleStatusDropdown(event, '${game.id}')">
              <span class="status-text-content">
                <span class="status-indicator"></span>
                ${statusLabels[game.status]}
              </span>
              <svg class="dropdown-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            <div class="status-dropdown-menu" id="menu-${game.id}">
              <div class="status-dropdown-item ${game.status === 'not-started' ? 'active' : ''}" data-status="not-started" onclick="window.changeGameStatus('${game.id}', 'not-started')">
                <span class="status-indicator"></span> Não Iniciado
              </div>
              <div class="status-dropdown-item ${game.status === 'want-to-play' ? 'active' : ''}" data-status="want-to-play" onclick="window.changeGameStatus('${game.id}', 'want-to-play')">
                <span class="status-indicator"></span> Quero Jogar
              </div>
              <div class="status-dropdown-item ${game.status === 'playing' ? 'active' : ''}" data-status="playing" onclick="window.changeGameStatus('${game.id}', 'playing')">
                <span class="status-indicator"></span> Jogando
              </div>
              <div class="status-dropdown-item ${game.status === 'played' ? 'active' : ''}" data-status="played" onclick="window.changeGameStatus('${game.id}', 'played')">
                <span class="status-indicator"></span> Já Joguei
              </div>
              <div class="status-dropdown-item ${game.status === 'abandoned' ? 'active' : ''}" data-status="abandoned" onclick="window.changeGameStatus('${game.id}', 'abandoned')">
                <span class="status-indicator"></span> Abandonado
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateAccountUI() {
  if (!elSteamStatusLabel || !elBtnSteamConnectTrigger) return;
  
  if (state.connected) {
    elSteamStatusLabel.textContent = `Status: Conectado (${state.username})`;
    elSteamStatusLabel.classList.add('connected');
    elBtnSteamConnectTrigger.textContent = 'Desconectar';
    elBtnSteamConnectTrigger.classList.add('disconnect');
  } else {
    elSteamStatusLabel.textContent = 'Status: Desconectado';
    elSteamStatusLabel.classList.remove('connected');
    elBtnSteamConnectTrigger.textContent = 'Sincronizar Steam';
    elBtnSteamConnectTrigger.classList.remove('disconnect');
  }
}

/* ==========================================================================
   MODAL DROPDOWN ACTIONS
   ========================================================================== */

window.toggleStatusDropdown = function(event, gameId) {
  event.stopPropagation();
  
  document.querySelectorAll('.status-dropdown-menu').forEach(menu => {
    if (menu.id !== `menu-${gameId}`) {
      menu.classList.remove('active');
    }
  });

  const menu = document.getElementById(`menu-${gameId}`);
  if (menu) {
    menu.classList.toggle('active');
  }
};

window.changeGameStatus = function(gameId, newStatus) {
  const game = state.games.find(g => g.id === gameId);
  if (game) {
    game.status = newStatus;
    saveToLocalStorage();
    updateStats();
    renderGames();
  }
};

// Global click outside listener to dismiss status menus
document.addEventListener('click', () => {
  document.querySelectorAll('.status-dropdown-menu').forEach(menu => {
    menu.classList.remove('active');
  });
});

/* ==========================================================================
   EVENT LISTENERS SETUP
   ========================================================================== */

function setupEventListeners() {
  // Search Box
  if (elSearchInput) {
    elSearchInput.addEventListener('input', (e) => {
      state.filters.search = e.target.value;
      renderGames();
    });
  }

  // Clear Filter button
  if (elBtnClearFilters) {
    elBtnClearFilters.addEventListener('click', () => {
      state.filters.search = '';
      if (elSearchInput) elSearchInput.value = '';
      
      state.filters.statuses = ['not-started', 'want-to-play', 'playing', 'played', 'abandoned'];
      document.querySelectorAll('.status-checkbox input').forEach(cb => {
        cb.checked = true;
      });

      state.filters.genres = [];
      renderGenres();
      renderGames();
    });
  }

  // Status Filter Checkboxes
  document.querySelectorAll('.status-checkbox input').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const activeStatuses = [];
      document.querySelectorAll('.status-checkbox input').forEach(cb => {
        if (cb.checked) {
          activeStatuses.push(cb.value);
        }
      });
      state.filters.statuses = activeStatuses;
      renderGames();
    });
  });

  // Account Sync Triggers
  if (elBtnSteamConnectTrigger) {
    elBtnSteamConnectTrigger.addEventListener('click', () => {
      if (state.connected) {
        if (confirm('Deseja realmente desconectar sua conta Steam? Isso apagará a biblioteca sincronizada localmente.')) {
          disconnectSteam();
        }
      } else {
        openModal(elModalSync);
      }
    });
  }

  // Modal Closures
  if (elBtnCloseSync) elBtnCloseSync.addEventListener('click', closeSyncModal);
  if (elBtnCancelSync) elBtnCancelSync.addEventListener('click', closeSyncModal);
  if (elBtnCloseAdd) elBtnCloseAdd.addEventListener('click', closeAddModal);
  if (elBtnCancelAdd) elBtnCancelAdd.addEventListener('click', closeAddModal);

  // Sync Form Submit
  if (elFormSyncAccount) {
    elFormSyncAccount.addEventListener('submit', runSteamApiConnection);
  }

  // Custom Adding Triggers
  if (elBtnAddGame) elBtnAddGame.addEventListener('click', () => openModal(elModalAddGame));
  
  if (elBtnEmptyDemo) elBtnEmptyDemo.addEventListener('click', triggerDemoImport);
  if (elBtnDemoMode) elBtnDemoMode.addEventListener('click', triggerDemoImport);

  // Form Add Game Manual submit
  if (elFormAddGame) {
    elFormAddGame.addEventListener('submit', handleAddCustomGameSubmit);
  }

  // AI Recommendation system trigger
  if (elBtnTriggerAi) {
    elBtnTriggerAi.addEventListener('click', triggerAiRecommendation);
  }
}

function openModal(modal) {
  if (modal) modal.classList.add('active');
}

function closeModal(modal) {
  if (modal) modal.classList.remove('active');
}

function closeSyncModal() {
  closeModal(elModalSync);
  document.getElementById('sync-progress-container').style.display = 'none';
  document.getElementById('modal-sync-actions').style.display = 'flex';
  document.getElementById('sync-steam-key').value = '';
  document.getElementById('sync-steam-id').value = '';
}

function closeAddModal() {
  closeModal(elModalAddGame);
  if (elFormAddGame) elFormAddGame.reset();
}

function disconnectSteam() {
  state.connected = false;
  state.apiKey = '';
  state.steamId = '';
  state.username = '';
  state.games = [];

  saveToLocalStorage();
  updateStats();
  renderGenres();
  renderGames();
  updateAccountUI();
}

/* ==========================================================================
   REAL STEAM WEB API INTEGRATION
   ========================================================================== */

async function runSteamApiConnection(event) {
  event.preventDefault();

  const apiKey = document.getElementById('sync-steam-key').value.trim();
  const inputSteamId = document.getElementById('sync-steam-id').value.trim();

  if (!apiKey || !inputSteamId) return;

  const progressContainer = document.getElementById('sync-progress-container');
  const progressFill = document.getElementById('sync-progress-fill');
  const logOutput = document.getElementById('sync-log-output');
  const actionButtons = document.getElementById('modal-sync-actions');

  progressContainer.style.display = 'flex';
  actionButtons.style.display = 'none';
  progressFill.style.width = '10%';
  logOutput.innerHTML = '<div>[10%] Inicializando comunicação com proxy local do Vite...</div>';

  const writeLog = (text, type = 'info') => {
    const div = document.createElement('div');
    div.textContent = text;
    if (type === 'success') div.style.color = '#4ade80';
    if (type === 'error') div.style.color = '#f87171';
    logOutput.appendChild(div);
    logOutput.scrollTop = logOutput.scrollHeight;
  };

  try {
    // Clean up input value in case it is a full profile URL
    let cleanSteamId = inputSteamId;
    if (inputSteamId.includes('steamcommunity.com/')) {
      const profileMatch = inputSteamId.match(/\/profiles\/(\d+)/);
      const idMatch = inputSteamId.match(/\/id\/([a-zA-Z0-9_\-]+)/);
      if (profileMatch) {
        cleanSteamId = profileMatch[1];
        writeLog(`[12%] URL de perfil identificada. Extraído ID numérico: ${cleanSteamId}`);
      } else if (idMatch) {
        cleanSteamId = idMatch[1];
        writeLog(`[12%] URL de perfil personalizada identificada. Extraído ID: ${cleanSteamId}`);
      }
    }

    let resolvedSteamId = cleanSteamId;

    // Stage 1: Resolve custom vanity name if cleanSteamId is not a 17-digit numeric string
    if (!/^\d{17}$/.test(cleanSteamId)) {
      writeLog(`[15%] Resolvendo URL personalizada "${cleanSteamId}" para SteamID64...`);
      progressFill.style.width = '20%';
      const resolveUrl = `${STEAM_PROXY_URL}/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${cleanSteamId}`;
      const resolveRes = await fetch(resolveUrl);
      if (resolveRes.ok) {
        const resolveData = await resolveRes.json();
        if (resolveData.response && resolveData.response.success === 1) {
          resolvedSteamId = resolveData.response.steamid;
          writeLog(`[25%] URL personalizada resolvida com sucesso: ID ${resolvedSteamId}`, 'success');
        } else {
          throw new Error('ID ou URL personalizada da Steam não encontrada.');
        }
      } else {
        throw new Error('Erro ao conectar com o serviço de resolução de URL.');
      }
    }

    // Call Steam API
    writeLog('[30%] Enviando requisição para a API da Steam (IPlayerService/GetOwnedGames)...');
    progressFill.style.width = '45%';

    // Build API url pointing to our proxy
    const apiUrl = `${STEAM_PROXY_URL}/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${resolvedSteamId}&format=json&include_appinfo=true&include_played_free_games=true`;

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    progressFill.style.width = '70%';

    if (!data.response || !data.response.games) {
      throw new Error('Nenhum jogo encontrado. Verifique se o SteamID está correto e se o seu perfil de jogos está definido como "Público".');
    }

    const rawGamesList = data.response.games;
    writeLog(`[80%] Conexão sucedida! Encontrados ${rawGamesList.length} jogos na biblioteca. Processando dados...`);

    // Stage 2: Parse games lists and cover images
    const importedGames = rawGamesList.map(game => {
      const appid = game.appid;
      const title = game.name;
      const playtimeHours = Math.round(game.playtime_forever / 60);

      // Steam official CDN Cover art
      const coverUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`;

      // Resolve genres (lookup dict or guess title keywords)
      const genres = getGenresForApp(appid, title);

      // Map playtime to status heuristics
      let status = 'not-started';
      if (playtimeHours > 5) {
        status = 'played';
      } else if (playtimeHours > 0) {
        status = 'playing';
      }

      return {
        id: `steam-${appid}`,
        appid: appid,
        title: title,
        platform: 'steam',
        genres: genres,
        playtime: playtimeHours,
        status: status,
        cover: coverUrl,
        description: `Jogo da Steam (AppID: ${appid}).`
      };
    });

    // Stage 3: Finish synchronization
    progressFill.style.width = '90%';
    writeLog('[85%] Importação de biblioteca finalizada. Processando perfil...', 'success');

    // Fetch Steam player profile to obtain their real nickname
    let nickname = 'Usuário Steam';
    try {
      const playerUrl = `${STEAM_PROXY_URL}/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${resolvedSteamId}`;
      const playerRes = await fetch(playerUrl);
      if (playerRes.ok) {
        const playerData = await playerRes.json();
        if (playerData.response && playerData.response.players && playerData.response.players[0]) {
          nickname = playerData.response.players[0].personaname;
        }
      }
    } catch (e) {
      console.warn('Erro ao obter sumário de perfil do jogador:', e);
    }

    progressFill.style.width = '100%';
    writeLog('[100%] Processamento completo!', 'success');

    state.connected = true;
    state.apiKey = apiKey;
    state.steamId = resolvedSteamId;
    state.username = nickname;
    state.games = importedGames;

    saveToLocalStorage();
    updateStats();
    renderGenres();
    renderGames();
    updateAccountUI();

    setTimeout(closeSyncModal, 1500);

  } catch (error) {
    progressFill.style.width = '100%';
    progressFill.style.backgroundColor = '#ef4444';
    writeLog(`[ERRO] Sincronização falhou: ${error.message}`, 'error');
    writeLog('Verifique se a chave de API é válida e se o seu perfil de jogos está aberto.', 'error');
    
    // Restore cancel button
    setTimeout(() => {
      actionButtons.style.display = 'flex';
    }, 1500);
  }
}

// Rapid Demo Import Flow
function triggerDemoImport() {
  state.connected = true;
  state.apiKey = 'DEMO_KEY';
  state.steamId = 'DEMO_ID';
  state.username = 'GamerDemoSteam';
  state.games = [...DEMO_STEAM_GAMES];

  saveToLocalStorage();
  updateStats();
  renderGenres();
  renderGames();
  updateAccountUI();
}

/* ==========================================================================
   ADD MANUAL GAME FLOW
   ========================================================================== */

function handleAddCustomGameSubmit(event) {
  event.preventDefault();

  const title = document.getElementById('add-title').value.trim();
  const status = document.getElementById('add-status').value;
  const genreInput = document.getElementById('add-genre').value;
  const playtime = parseInt(document.getElementById('add-playtime').value) || 0;
  const appid = parseInt(document.getElementById('add-appid').value) || null;
  const coverUrlInput = document.getElementById('add-cover').value.trim();

  const genres = genreInput.split(',').map(g => g.trim()).filter(g => g !== '');

  let cover = null;
  if (coverUrlInput) {
    cover = coverUrlInput;
  } else if (appid) {
    cover = `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`;
  }

  const newGame = {
    id: `custom-${Date.now()}`,
    appid: appid || Date.now(),
    title,
    platform: 'steam',
    genres,
    playtime,
    status,
    cover,
    description: 'Jogo personalizado adicionado à biblioteca.'
  };

  state.games.push(newGame);
  
  if (!state.connected) {
    state.connected = true;
    state.username = 'Biblioteca Manual';
    updateAccountUI();
  }

  saveToLocalStorage();
  updateStats();
  renderGenres();
  renderGames();
  closeAddModal();
}

/* ==========================================================================
   AI RECOMMENDATION ENGINE (PREDICTIVE FILTERING)
   ========================================================================== */

function triggerAiRecommendation() {
  if (!elAiConsoleLogs || !elAiResultCard) return;

  elAiConsoleLogs.innerHTML = '';
  elAiResultCard.classList.remove('visible');

  if (elAiBrainContainer) {
    elAiBrainContainer.classList.add('thinking');
  }

  const printLine = (text, type = 'info', delay = 0) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const line = document.createElement('div');
        line.className = `console-line ${type === 'success' ? 'success' : type === 'error' ? 'error' : ''}`;
        line.textContent = text;
        elAiConsoleLogs.appendChild(line);
        elAiConsoleLogs.scrollTop = elAiConsoleLogs.scrollHeight;
        resolve();
      }, delay);
    });
  };

  printLine('> inicializando assistente neural SteamHub...', 'info', 0)
    .then(() => printLine('> analisando perfil de jogo local...', 'info', 400))
    .then(() => {
      if (state.games.length === 0) {
        if (elAiBrainContainer) elAiBrainContainer.classList.remove('thinking');
        return printLine('> [ERRO] Biblioteca vazia. Conecte sua Steam para prosseguir.', 'error', 600);
      }

      // Read played games history, backlog candidates, and abandoned games
      const history = state.games.filter(g => g.status === 'played' || g.status === 'playing');
      const backlog = state.games.filter(g => g.status === 'want-to-play' || g.status === 'not-started');
      const abandoned = state.games.filter(g => g.status === 'abandoned');

      return printLine(`> detectados ${history.length} no histórico, ${backlog.length} no backlog e ${abandoned.length} abandonados...`, 'info', 600)
        .then(() => printLine('> processando afinidades positivas e negativas (desistências)...', 'info', 500))
        .then(() => {
          if (history.length === 0 && abandoned.length === 0) {
            if (backlog.length === 0) {
              if (elAiBrainContainer) elAiBrainContainer.classList.remove('thinking');
              return printLine('> [ERRO] Adicione jogos como "Quero Jogar" para obter recomendações.', 'error', 400);
            }
            
            const randomPick = backlog[Math.floor(Math.random() * backlog.length)];
            return processRecommendation(randomPick, 'Nenhum histórico de jogo detectado. Recomendação selecionada a partir de seu backlog de desejos.', printLine);
          }

          // Evaluate user's positive genre tastes
          const genreScores = {};
          history.forEach(game => {
            const multiplier = game.status === 'playing' ? 2 : 1;
            const playtimeWeight = 1 + Math.log10(Math.max(1, game.playtime));
            game.genres.forEach(genre => {
              genreScores[genre] = (genreScores[genre] || 0) + (multiplier * playtimeWeight);
            });
          });

          // Evaluate user's negative preferences (penalize abandoned genres)
          const abandonedGenres = {};
          abandoned.forEach(game => {
            game.genres.forEach(genre => {
              abandonedGenres[genre] = (abandonedGenres[genre] || 0) + 1.5;
            });
          });

          // Apply penalties
          for (const genre in abandonedGenres) {
            if (genreScores[genre]) {
              genreScores[genre] -= abandonedGenres[genre];
            } else {
              genreScores[genre] = -abandonedGenres[genre];
            }
          }

          // Sort genres by weight
          const sortedGenres = Object.keys(genreScores).sort((a, b) => genreScores[b] - genreScores[a]);
          const topGenresStr = sortedGenres.slice(0, 3).join(', ');

          const penalizedGenres = Object.keys(abandonedGenres);
          const penaltyMsg = penalizedGenres.length > 0
            ? `> desistências detectadas! Gêneros penalizados: [${penalizedGenres.map(g => `${g} (-${abandonedGenres[g]})`).join(', ')}]`
            : `> nenhuma desistência detectada. Perfil de gostos limpo de penalidades.`;

          return printLine(penaltyMsg, penalizedGenres.length > 0 ? 'error' : 'info', 600)
            .then(() => printLine(`> preferências recalculadas com penalidades: [${topGenresStr}]`, 'success', 800))
            .then(() => printLine('> mapeando sinergias de títulos do backlog...', 'info', 600))
            .then(() => {
              if (backlog.length === 0) {
                if (elAiBrainContainer) elAiBrainContainer.classList.remove('thinking');
                return printLine('> [AVISO] Backlog vazio. Adicione jogos como "Quero Jogar" ou "Não Iniciado".', 'error', 400);
              }

              let bestGame = null;
              let bestScore = -1;

              backlog.forEach(game => {
                let score = 0;
                game.genres.forEach(g => {
                  if (genreScores[g]) {
                    score += genreScores[g];
                  }
                });

                if (score > bestScore) {
                  bestScore = score;
                  bestGame = game;
                }
              });

              if (!bestGame) {
                bestGame = backlog[0];
              }

              return printLine(`> candidato ideal: "${bestGame.title}" (Score de Afinidade: ${Math.round(bestScore)})`, 'success', 800)
                .then(() => printLine('> gerando relatório de justificativa neural...', 'info', 500))
                .then(() => {
                  if (elAiBrainContainer) elAiBrainContainer.classList.remove('thinking');
                  
                  let matchingGenre = bestGame.genres.find(g => sortedGenres.includes(g));
                  let historySample = history.find(h => h.genres.includes(matchingGenre));
                  
                  let reason = '';
                  if (matchingGenre && historySample) {
                    reason = `Com base nas suas horas investidas em jogos de ${matchingGenre} como ${historySample.title}, identificamos que você aprecia este estilo. ${bestGame.title} compartilha essas dinâmicas de jogabilidade e é a indicação perfeita para iniciar seu backlog!`;
                  } else {
                    reason = `Este jogo combina elementos marcantes dos seus estilos mais jogados na Steam, como ${topGenresStr}. Analisamos que ele possui alta sinergia com seu perfil de jogo.`;
                  }

                  displayRecommendationResult(bestGame, reason);
                });
            });
        });
    });
}

function processRecommendation(game, explanation, printLineFn) {
  return printLineFn(`> candidato ideal: "${game.title}"`, 'success', 600)
    .then(() => printLineFn('> finalizando relatório...', 'info', 400))
    .then(() => {
      if (elAiBrainContainer) elAiBrainContainer.classList.remove('thinking');
      displayRecommendationResult(game, explanation);
    });
}

function displayRecommendationResult(game, reason) {
  elAiResultCard.innerHTML = `
    <div class="ai-rec-header">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      </svg>
      Próximo Jogo Sugerido
    </div>
    <div class="ai-rec-body">
      ${game.cover ? 
        `<img class="ai-rec-image" src="${game.cover}" alt="${game.title}" onerror="this.style.display='none';">` :
        `<div class="ai-rec-image" style="background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: var(--text-muted); text-align: center; padding: 4px;">
          ${game.title.substring(0, 15)}...
         </div>`
      }
      <div class="ai-rec-details">
        <div class="ai-rec-title">${game.title}</div>
        <div style="font-size: 11px; color: var(--color-primary); font-weight: 600;">Steam Library</div>
      </div>
    </div>
    <div class="ai-rec-reason">
      ${reason}
    </div>
  `;

  elAiResultCard.classList.add('visible');
}

/* ==========================================================================
   DOM INITIALIZER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', initApp);

if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initApp();
}
