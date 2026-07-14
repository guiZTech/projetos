const FURY_DURATION_MS = 10000;
const PRESTIGE_TARGET = 1000000;

const upgradeCatalog = [
    { id: 'cursor', name: 'Cursor duplo', description: 'Aumenta o multiplicador em +1 no nível 1, +2 no nível 2 e assim por diante.', baseCost: 25, baseGain: 1, type: 'multiplier', scale: 1.55 },
    { id: 'glove', name: 'Luva pixel', description: 'Upgrade repetível de clique: o ganho cresce junto com o nível comprado.', baseCost: 120, baseGain: 2, type: 'multiplier', scale: 1.62 },
    { id: 'hammer', name: 'Martelo arcade', description: 'Mais força por clique para avançar nos marcos intermediários.', baseCost: 700, baseGain: 5, type: 'multiplier', scale: 1.68 },
    { id: 'laser', name: 'Laser 8-bit', description: 'Multiplicador pesado para buscar 50 mil, 100 mil e além.', baseCost: 3500, baseGain: 12, type: 'multiplier', scale: 1.74 },
    { id: 'factory', name: 'Mini fábrica', description: 'Produção de pixels em massa com ganho crescente por nível.', baseCost: 12000, baseGain: 30, type: 'multiplier', scale: 1.82 },
    { id: 'turbo', name: 'Turbo click', description: 'Aumenta a velocidade em +0.2 por nível.', baseCost: 1500, baseGain: 0.2, type: 'speed', scale: 1.7 },
    { id: 'autoclicker', name: 'AutoClicker', description: 'Custa 100 mil no primeiro nível e gera cliques automáticos por segundo.', baseCost: 100000, baseGain: 1, type: 'autoClicker', scale: 1.9 }
];

const achievementCatalog = [
    { id: 'first_click', label: 'Primeiro clique', test: () => state.totalClicks >= 1 },
    { id: 'click_100', label: '100 cliques', test: () => state.totalClicks >= 100 },
    { id: 'click_500', label: '500 cliques', test: () => state.totalClicks >= 500 },
    { id: 'click_1000', label: '1 mil cliques', test: () => state.totalClicks >= 1000 },
    { id: 'coin_1000', label: '1 mil moedas', test: () => state.bestCoins >= 1000 },
    { id: 'coin_10000', label: '10 mil moedas', test: () => state.bestCoins >= 10000 },
    { id: 'coin_50000', label: '50 mil moedas', test: () => state.bestCoins >= 50000 },
    { id: 'coin_100000', label: '100 mil moedas', test: () => state.bestCoins >= 100000 },
    { id: 'coin_500000', label: '500 mil moedas', test: () => state.bestCoins >= 500000 },
    { id: 'coin_1000000', label: '1 milhão de moedas', test: () => state.bestCoins >= PRESTIGE_TARGET },
    { id: 'fury_once', label: 'Fúria por 10 segundos', test: () => state.furyActivations >= 1 },
    { id: 'auto_clicker', label: 'Automação desbloqueada', test: () => getUpgradeLevel('autoclicker') >= 1 }
];

const skins = ['default', 'neon', 'retro', 'gold', 'emerald', 'midnight', 'cyber', 'ember', 'holo', 'numeros', 'minecraft'];

const legacyBought = JSON.parse(localStorage.getItem('pixelClickerBought') || '[]');
const savedLevels = JSON.parse(localStorage.getItem('pixelClickerUpgradeLevels') || '{}');
legacyBought.forEach(id => {
    savedLevels[id] = Math.max(savedLevels[id] || 0, 1);
});

const state = {
    coins: Number(localStorage.getItem('pixelClickerCoins')) || 0,
    baseMultiplier: Number(localStorage.getItem('pixelClickerBaseMultiplier')) || Number(localStorage.getItem('pixelClickerMultiplier')) || 1,
    speed: Number(localStorage.getItem('pixelClickerSpeed')) || 1,
    combo: 0,
    furyEndsAt: Number(localStorage.getItem('pixelClickerFuryEndsAt')) || 0,
    furyActivations: Number(localStorage.getItem('pixelClickerFuryActivations')) || 0,
    prestigeMultiplier: Number(localStorage.getItem('pixelClickerPrestigeMultiplier')) || 1,
    totalClicks: Number(localStorage.getItem('pixelClickerTotalClicks')) || 0,
    bestCoins: Number(localStorage.getItem('pixelClickerBestCoins')) || Number(localStorage.getItem('pixelClickerCoins')) || 0,
    upgradeLevels: savedLevels,
    skin: localStorage.getItem('pixelClickerSkin') || 'default',
    achievements: JSON.parse(localStorage.getItem('pixelClickerAchievements') || '[]')
};

const elements = {
    counter: document.querySelector('#counter'),
    counterMirror: document.querySelector('#counterMirror'),
    multiplier: document.querySelector('#multiplier'),
    speedValue: document.querySelector('#speedValue'),
    comboValue: document.querySelector('#comboValue'),
    comboFill: document.querySelector('#comboFill'),
    furyStatus: document.querySelector('#furyStatus'),
    achievement: document.querySelector('#achievement'),
    addPointBtn: document.querySelector('#addPointBtn'),
    pixelBurst: document.querySelector('#pixelBurst'),
    shopCards: document.querySelector('#shopCards'),
    skinOptions: document.querySelector('#skinOptions'),
    achievementList: document.querySelector('#achievementList'),
    saveBtn: document.querySelector('#saveBtn'),
    exportBtn: document.querySelector('#exportBtn'),
    resetCycleBtn: document.querySelector('#resetCycleBtn'),
    tabs: {
        upgrades: document.querySelector('#upgradesTab'),
        skins: document.querySelector('#skinsTab'),
        achievements: document.querySelector('#achievementsTab')
    },
    sections: {
        upgrades: document.querySelector('#upgradesSection'),
        skins: document.querySelector('#skinShop'),
        achievements: document.querySelector('#achievementSection')
    }
};

function getUpgradeLevel(id) {
    return state.upgradeLevels[id] || 0;
}

function isFuryActive() {
    return Date.now() < state.furyEndsAt;
}

function getDisplayedMultiplier() {
    const furyBonus = isFuryActive() ? 2 : 1;
    return state.baseMultiplier * state.prestigeMultiplier * furyBonus;
}

function getUpgradeCost(upgrade) {
    const level = getUpgradeLevel(upgrade.id);
    return Math.floor(upgrade.baseCost * (upgrade.scale ** level));
}

function getNextUpgradeGain(upgrade) {
    const level = getUpgradeLevel(upgrade.id);
    return upgrade.baseGain * (level + 1);
}

function saveGame() {
    localStorage.setItem('pixelClickerCoins', state.coins);
    localStorage.setItem('pixelClickerBaseMultiplier', state.baseMultiplier);
    localStorage.setItem('pixelClickerMultiplier', state.baseMultiplier);
    localStorage.setItem('pixelClickerSpeed', state.speed);
    localStorage.setItem('pixelClickerFuryEndsAt', state.furyEndsAt);
    localStorage.setItem('pixelClickerFuryActivations', state.furyActivations);
    localStorage.setItem('pixelClickerPrestigeMultiplier', state.prestigeMultiplier);
    localStorage.setItem('pixelClickerTotalClicks', state.totalClicks);
    localStorage.setItem('pixelClickerBestCoins', state.bestCoins);
    localStorage.setItem('pixelClickerUpgradeLevels', JSON.stringify(state.upgradeLevels));
    localStorage.setItem('pixelClickerSkin', state.skin);
    localStorage.setItem('pixelClickerAchievements', JSON.stringify(state.achievements));
}

function formatNumber(value) {
    return Math.floor(value).toLocaleString('pt-BR');
}

function showToast(message) {
    elements.achievement.textContent = message;
    elements.achievement.classList.add('show');
    window.setTimeout(() => elements.achievement.classList.remove('show'), 2600);
}

function triggerFury() {
    state.combo = 0;
    state.furyEndsAt = Date.now() + FURY_DURATION_MS;
    state.furyActivations += 1;
    showToast('Fúria ativada por 10 segundos: multiplicador dobrado!');
}

function prestigeIfNeeded() {
    if (state.coins < PRESTIGE_TARGET) return false;
    state.bestCoins = Math.max(state.bestCoins, state.coins);
    state.coins = 0;
    state.baseMultiplier = 1;
    state.speed = 1;
    state.combo = 0;
    state.furyEndsAt = 0;
    state.prestigeMultiplier = Math.max(state.prestigeMultiplier, 10);
    state.upgradeLevels = {};
    showToast('1 milhão! Save reiniciado com multiplicador permanente x10.');
    return true;
}

function checkAchievements() {
    achievementCatalog.forEach(item => {
        if (!state.achievements.includes(item.id) && item.test()) {
            state.achievements.push(item.id);
            showToast(`Conquista: ${item.label}`);
        }
    });
}

function renderStats() {
    const comboPercent = Math.min(state.combo, 100);
    const furyRemaining = Math.max(0, Math.ceil((state.furyEndsAt - Date.now()) / 1000));
    elements.counter.textContent = formatNumber(state.coins);
    elements.counterMirror.textContent = formatNumber(state.coins);
    elements.multiplier.textContent = `x${formatNumber(getDisplayedMultiplier())}`;
    elements.speedValue.textContent = `x${state.speed.toFixed(1)}`;
    elements.comboValue.textContent = isFuryActive() ? `${furyRemaining}s` : `${Math.floor(comboPercent)}/100`;
    elements.comboFill.style.width = isFuryActive() ? '100%' : `${comboPercent}%`;
    elements.comboFill.classList.toggle('fury-active', isFuryActive());
    elements.furyStatus.textContent = isFuryActive()
        ? `Fúria ativa: multiplicador x2 por ${furyRemaining}s.`
        : 'Encha a barra para ativar 10s de multiplicador dobrado.';
    elements.furyStatus.classList.toggle('active', isFuryActive());
}

function renderShop() {
    elements.shopCards.innerHTML = upgradeCatalog.map(upgrade => {
        const level = getUpgradeLevel(upgrade.id);
        const cost = getUpgradeCost(upgrade);
        const gain = getNextUpgradeGain(upgrade);
        const disabled = state.coins < cost;
        const label = upgrade.type === 'speed' ? `+${gain.toFixed(1)} velocidade` : upgrade.type === 'autoClicker' ? `+${gain} clique/s` : `+${formatNumber(gain)} multiplicador`;
        return `
            <article class="shop-card ${level > 0 ? 'bought' : ''}">
                <h3>${upgrade.name}</h3>
                <p>${upgrade.description}</p>
                <span class="cost">Nível ${level} · Próximo: ${label}</span>
                <span class="cost">Preço: ${formatNumber(cost)} moedas</span><br>
                <button type="button" data-upgrade="${upgrade.id}" ${disabled ? 'disabled' : ''}>Comprar nível ${level + 1}</button>
            </article>
        `;
    }).join('');
}

function renderSkins() {
    elements.skinOptions.innerHTML = skins.map(skin => `
        <button class="skin-option ${state.skin === skin ? 'active' : ''}" type="button" data-skin="${skin}">${skin}</button>
    `).join('');
    document.body.dataset.skin = state.skin === 'default' ? '' : state.skin;
}

function renderAchievements() {
    elements.achievementList.innerHTML = achievementCatalog.map(item => {
        const unlocked = state.achievements.includes(item.id);
        return `<article class="achievement-item ${unlocked ? 'unlocked' : ''}">${unlocked ? '✓' : '□'} ${item.label}</article>`;
    }).join('');
    elements.resetCycleBtn.hidden = state.bestCoins < PRESTIGE_TARGET;
}

function render() {
    renderStats();
    renderShop();
    renderSkins();
    renderAchievements();
}

function addCoins(amount, clicks = 0) {
    state.coins += amount;
    state.bestCoins = Math.max(state.bestCoins, state.coins);
    state.totalClicks += clicks;
    if (prestigeIfNeeded()) {
        checkAchievements();
        saveGame();
        render();
        return;
    }
    checkAchievements();
    saveGame();
    render();
}

function createBurst() {
    for (let index = 0; index < 12; index += 1) {
        const piece = document.createElement('span');
        piece.className = 'pixel-burst-piece';
        piece.style.left = `${45 + Math.random() * 10}%`;
        piece.style.top = `${40 + Math.random() * 20}%`;
        piece.style.setProperty('--dx', `${Math.random() * 180 - 90}px`);
        piece.style.setProperty('--dy', `${Math.random() * -140 - 20}px`);
        piece.style.animation = 'burstPiece 650ms steps(5) forwards';
        elements.pixelBurst.appendChild(piece);
        piece.addEventListener('animationend', () => piece.remove());
    }
}

function clickPixel() {
    if (!isFuryActive()) {
        state.combo = Math.min(100, state.combo + 8 + state.speed);
        if (state.combo >= 100) triggerFury();
    }
    elements.addPointBtn.classList.remove('clicked');
    void elements.addPointBtn.offsetWidth;
    elements.addPointBtn.classList.add('clicked');
    createBurst();
    addCoins(getDisplayedMultiplier() * state.speed, 1);
}

function buyUpgrade(id) {
    const upgrade = upgradeCatalog.find(item => item.id === id);
    if (!upgrade) return;
    const cost = getUpgradeCost(upgrade);
    if (state.coins < cost) return;
    state.coins -= cost;
    state.upgradeLevels[id] = getUpgradeLevel(id) + 1;
    if (upgrade.type === 'speed') {
        state.speed += upgrade.baseGain * state.upgradeLevels[id];
    } else if (upgrade.type === 'multiplier') {
        state.baseMultiplier += upgrade.baseGain * state.upgradeLevels[id];
    }

    showToast(`${upgrade.name} nível ${state.upgradeLevels[id]} comprado!`);
    checkAchievements();
    saveGame();
    render();
}

function runAutoClicker() {
    const level = getUpgradeLevel('autoclicker');
    if (level <= 0) return;
    addCoins(getDisplayedMultiplier() * state.speed * level, level);
}

function switchTab(tab) {
    Object.entries(elements.sections).forEach(([key, section]) => {
        section.hidden = key !== tab;
        elements.tabs[key].classList.toggle('active', key === tab);
    });
}

elements.addPointBtn.addEventListener('click', clickPixel);
elements.saveBtn.addEventListener('click', () => {
    saveGame();
    showToast('Progresso salvo!');
});
elements.exportBtn.addEventListener('click', () => {
    const data = JSON.stringify(state, null, 2);
    navigator.clipboard?.writeText(data);
    showToast('JSON copiado para a área de transferência!');
});
elements.resetCycleBtn.addEventListener('click', () => {
    state.coins = PRESTIGE_TARGET;
    prestigeIfNeeded();
    checkAchievements();
    saveGame();
    render();
});
elements.shopCards.addEventListener('click', event => buyUpgrade(event.target.dataset.upgrade));
elements.skinOptions.addEventListener('click', event => {
    if (!event.target.dataset.skin) return;
    state.skin = event.target.dataset.skin;
    saveGame();
    renderSkins();
});
elements.tabs.upgrades.addEventListener('click', () => switchTab('upgrades'));
elements.tabs.skins.addEventListener('click', () => switchTab('skins'));
elements.tabs.achievements.addEventListener('click', () => switchTab('achievements'));

window.setInterval(() => {
    runAutoClicker();
    renderStats();
}, 1000);

render();