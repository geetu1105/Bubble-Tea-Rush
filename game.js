const STORAGE_KEY = 'bubble-tea-rush-save-v1';
const STARTING_DRINKS = [
  'Classic Milk Tea', 'Brown Sugar Milk Tea', 'Matcha Latte',
  'Strawberry Milk Tea', 'Mango Tea'
];
const UNLOCKABLE_DRINKS = [
  'Sakura Tea', 'Galaxy Tea', 'Rainbow Tea', 'Cotton Candy Tea',
  'Lavender Tea', 'Peach Tea', 'Blueberry Tea', 'Cookies & Cream Tea',
  'Tropical Tea', 'Chocolate Boba Tea'
];
const TOPPINGS = [
  'Classic Boba', 'Crystal Boba', 'Strawberry Popping Pearls',
  'Mango Popping Pearls', 'Lychee Jelly', 'Grass Jelly', 'Aloe Vera',
  'Whipped Cream', 'Heart Sprinkles', 'Rainbow Sprinkles'
];
const ICE_LEVELS = ['No Ice', 'Light Ice', 'Medium', 'Extra Ice'];
const SUGAR_LEVELS = ['0%', '25%', '50%', '75%', '100%'];
const LOCATIONS = [
  'Bubble Tea Café', 'Sakura Garden', 'Cloud Café', 'Candy Town',
  'Galaxy Café', 'Rainbow Village', 'Bubble Tea Kingdom'
];
const CUSTOMER_NAMES = ['Mochi', 'Poppy', 'Luna', 'Aster', 'Marina', 'Bibi'];
const MASCOTS = [
  { name: 'Mochi Bunny', bonus: 'Extra Coins', icon: '🐰' },
  { name: 'Boba Bear', bonus: 'Faster XP', icon: '🐻' },
  { name: 'Matcha Panda', bonus: 'Longer Patience', icon: '🐼' },
  { name: 'Peach Fox', bonus: 'Combo Boost', icon: '🦊' },
  { name: 'Pudding Cat', bonus: 'Extra Coins', icon: '🐱' },
  { name: 'Cloud Lamb', bonus: 'Longer Patience', icon: '🐑' },
  { name: 'Strawberry Puppy', bonus: 'Faster XP', icon: '🐶' },
  { name: 'Marshmallow Chick', bonus: 'Combo Boost', icon: '🐥' }
];
const SHOP_ITEMS = {
  decorations: [
    { name: 'Plant Corner', cost: 120, type: 'decoration' },
    { name: 'Flower Shelf', cost: 150, type: 'decoration' },
    { name: 'Comfy Table', cost: 210, type: 'decoration' },
    { name: 'Lamp Lights', cost: 240, type: 'decoration' }
  ],
  themes: [
    { name: 'Sakura', cost: 280, type: 'theme' },
    { name: 'Strawberry', cost: 320, type: 'theme' },
    { name: 'Ocean', cost: 350, type: 'theme' },
    { name: 'Galaxy', cost: 420, type: 'theme' }
  ],
  cups: [
    { name: 'Pink Cup', cost: 90, type: 'cup' },
    { name: 'Gold Cup', cost: 130, type: 'cup' },
    { name: 'Heart Cup', cost: 160, type: 'cup' },
    { name: 'Rainbow Cup', cost: 220, type: 'cup' }
  ]
};

const state = loadState();
let currentOrder = null;
let selectedOrder = { drink: STARTING_DRINKS[0], ice: 'Medium', sugar: '50%', toppings: ['Classic Boba'] };
let timerId = null;
let timerRemaining = 18;
let activitySparkle = false;

const elements = {
  coins: document.querySelector('#coins'),
  xp: document.querySelector('#xp'),
  gems: document.querySelector('#gems'),
  combo: document.querySelector('#combo'),
  level: document.querySelector('#level'),
  happiness: document.querySelector('#happiness'),
  served: document.querySelector('#served'),
  location: document.querySelector('#location'),
  customerName: document.querySelector('#customer-name'),
  customerNote: document.querySelector('#customer-note'),
  orderDrink: document.querySelector('#order-drink'),
  orderIce: document.querySelector('#order-ice'),
  orderSugar: document.querySelector('#order-sugar'),
  orderToppings: document.querySelector('#order-toppings'),
  timerFill: document.querySelector('#timer-fill'),
  timeLeft: document.querySelector('#time-left'),
  menuScreen: document.querySelector('#menu-screen'),
  gameScreen: document.querySelector('#game-screen'),
  panelScreen: document.querySelector('#panel-screen'),
  panelTitle: document.querySelector('#panel-title'),
  panelContent: document.querySelector('#panel-content'),
  toast: document.querySelector('#toast'),
  drinkOptions: document.querySelector('#drink-options'),
  iceOptions: document.querySelector('#ice-options'),
  sugarOptions: document.querySelector('#sugar-options'),
  toppingOptions: document.querySelector('#topping-options'),
  serveBtn: document.querySelector('#serve-btn'),
  newOrderBtn: document.querySelector('#new-order-btn'),
  dailyBtn: document.querySelector('#daily-btn'),
  shopBtn: document.querySelector('#shop-btn'),
  mascotBtn: document.querySelector('#mascot-btn'),
  closePanel: document.querySelector('#close-panel'),
  backToMenuBtn: document.querySelector('#back-to-menu-btn')
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      coins: 320,
      xp: 0,
      level: 1,
      gems: 6,
      combo: 0,
      happiness: 100,
      served: 0,
      unlockedDrinks: [...STARTING_DRINKS],
      unlockedToppings: [TOPPINGS[0]],
      decorations: [],
      themes: ['Sakura'],
      cups: ['Pink Cup'],
      mascots: [],
      achievements: {},
      settings: { music: true, sfx: true },
      lastDailyReward: null,
      currentLocationIndex: 0,
      recipeUnlockCount: 0,
      purchasedItems: []
    };
  }
  return { ...loadStateDefault(), ...JSON.parse(raw) };
}

function loadStateDefault() {
  return {
    coins: 320,
    xp: 0,
    level: 1,
    gems: 6,
    combo: 0,
    happiness: 100,
    served: 0,
    unlockedDrinks: [...STARTING_DRINKS],
    unlockedToppings: [TOPPINGS[0]],
    decorations: [],
    themes: ['Sakura'],
    cups: ['Pink Cup'],
    mascots: [],
    achievements: {},
    settings: { music: true, sfx: true },
    lastDailyReward: null,
    currentLocationIndex: 0,
    recipeUnlockCount: 0,
    purchasedItems: []
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

function updateHud() {
  elements.coins.textContent = formatNumber(state.coins);
  elements.xp.textContent = formatNumber(state.xp);
  elements.gems.textContent = formatNumber(state.gems);
  elements.combo.textContent = state.combo;
  elements.level.textContent = state.level;
  elements.happiness.textContent = `${Math.max(0, Math.round(state.happiness))}%`;
  elements.served.textContent = state.served;
  elements.location.textContent = LOCATIONS[state.currentLocationIndex];
}

function showScreen(screenName) {
  elements.menuScreen.classList.toggle('hidden', screenName !== 'menu');
  elements.menuScreen.classList.toggle('visible', screenName === 'menu');
  elements.gameScreen.classList.toggle('hidden', screenName !== 'game');
  elements.gameScreen.classList.toggle('visible', screenName === 'game');
  elements.panelScreen.classList.toggle('hidden', screenName !== 'panel');
  elements.panelScreen.classList.toggle('visible', screenName === 'panel');
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => elements.toast.classList.remove('show'), 1800);
}

function spawnSparkles(count = 10) {
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('span');
    spark.className = 'sparkle';
    spark.textContent = ['✨', '💖', '🫧', '🌸'][i % 4];
    spark.style.left = `${Math.random() * window.innerWidth}px`;
    spark.style.top = `${Math.random() * window.innerHeight - 40}px`;
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 1400);
  }
}

function getLevelFromXp(xp) {
  return Math.max(1, Math.floor(xp / 180) + 1);
}

function updateLocationUnlocks() {
  const requiredLevel = [1, 10, 20, 35, 50, 75, 100];
  state.currentLocationIndex = requiredLevel.findIndex((lvl) => state.level < lvl);
  if (state.currentLocationIndex === -1) state.currentLocationIndex = LOCATIONS.length - 1;
  else state.currentLocationIndex = Math.max(0, state.currentLocationIndex);
}

function maybeUnlockRecipe() {
  const nextDrink = UNLOCKABLE_DRINKS[state.recipeUnlockCount];
  if (state.level >= 3 + state.recipeUnlockCount * 5 && nextDrink) {
    if (!state.unlockedDrinks.includes(nextDrink)) {
      state.unlockedDrinks.push(nextDrink);
      state.recipeUnlockCount += 1;
      showToast(`New recipe unlocked: ${nextDrink}!`);
      spawnSparkles(8);
    }
  }
}

function renderOptions() {
  renderChoiceGrid(elements.drinkOptions, [...state.unlockedDrinks], selectedOrder.drink, 'drink');
  renderChoiceGrid(elements.iceOptions, ICE_LEVELS, selectedOrder.ice, 'ice');
  renderChoiceGrid(elements.sugarOptions, SUGAR_LEVELS, selectedOrder.sugar, 'sugar');
  renderChoiceGrid(elements.toppingOptions, ToppingsForView(), selectedOrder.toppings[0] || 'Classic Boba', 'topping');
}

function ToppingsForView() {
  const visible = [...state.unlockedToppings, ...TOPPINGS.filter((top) => !state.unlockedToppings.includes(top)).slice(0, 3)];
  return visible.slice(0, 8);
}

function renderChoiceGrid(container, items, selectedValue, type) {
  container.innerHTML = '';
  items.forEach((item) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    if (selectedValue === item) btn.classList.add('selected');
    btn.textContent = item;
    btn.addEventListener('click', () => {
      if (type === 'drink') selectedOrder.drink = item;
      if (type === 'ice') selectedOrder.ice = item;
      if (type === 'sugar') selectedOrder.sugar = item;
      if (type === 'topping') selectedOrder.toppings = [item];
      renderOptions();
    });
    container.appendChild(btn);
  });
}

function generateOrder() {
  const drink = state.unlockedDrinks[Math.floor(Math.random() * state.unlockedDrinks.length)];
  const ice = ICE_LEVELS[Math.floor(Math.random() * ICE_LEVELS.length)];
  const sugar = SUGAR_LEVELS[Math.floor(Math.random() * SUGAR_LEVELS.length)];
  const toppings = [TOPPINGS[Math.floor(Math.random() * TOPPINGS.length)]];
  currentOrder = { drink, ice, sugar, toppings, customer: CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)] };
  elements.customerName.textContent = currentOrder.customer;
  elements.customerNote.textContent = `“Please make my ${drink} just right!”`;
  elements.orderDrink.textContent = currentOrder.drink;
  elements.orderIce.textContent = currentOrder.ice;
  elements.orderSugar.textContent = currentOrder.sugar;
  elements.orderToppings.textContent = currentOrder.toppings.join(', ');
  timerRemaining = 18;
  updateTimer();
  renderOptions();
}

function updateTimer() {
  const pct = Math.max(0, (timerRemaining / 18) * 100);
  elements.timerFill.style.width = `${pct}%`;
  elements.timeLeft.textContent = timerRemaining;
}

function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    timerRemaining -= 1;
    updateTimer();
    if (timerRemaining <= 0) {
      clearInterval(timerId);
      state.happiness = Math.max(40, state.happiness - 8);
      state.combo = 0;
      showToast('Order expired! The customer left upset.');
      spawnSparkles(4);
      generateOrder();
      saveState();
      updateHud();
    }
  }, 1000);
}

function playSound(kind = 'click') {
  if (!state.settings.sfx) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const map = {
    click: { freq: 540, dur: 0.05, wave: 'triangle' },
    coin: { freq: 660, dur: 0.08, wave: 'sine' },
    serve: { freq: 820, dur: 0.12, wave: 'square' },
    fail: { freq: 250, dur: 0.12, wave: 'sawtooth' }
  };
  const config = map[kind] || map.click;
  osc.type = config.wave;
  osc.frequency.value = config.freq;
  gain.gain.value = 0.03;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + config.dur);
}

function isOrderCorrect() {
  return selectedOrder.drink === currentOrder.drink &&
    selectedOrder.ice === currentOrder.ice &&
    selectedOrder.sugar === currentOrder.sugar &&
    selectedOrder.toppings[0] === currentOrder.toppings[0];
}

function giveDailyReward() {
  const today = new Date().toDateString();
  if (state.lastDailyReward === today) {
    showToast('Daily reward already claimed today.');
    return;
  }
  state.coins += 120;
  state.gems += 1;
  state.xp += 50;
  state.lastDailyReward = today;
  state.achievements.daily = true;
  showToast('Daily reward claimed! +120 Coins, +1 Gem, +50 XP');
  spawnSparkles(12);
  saveState();
  updateHud();
}

function handleServe() {
  if (!currentOrder) return;
  if (isOrderCorrect()) {
    state.coins += 90 + state.combo * 5;
    state.xp += 25 + state.combo * 3;
    state.combo += 1;
    state.served += 1;
    state.happiness = Math.min(100, state.happiness + 4);
    const bonusXp = state.mascots.includes('Boba Bear') ? 8 : 0;
    if (bonusXp) state.xp += bonusXp;
    showToast('Perfect order! You earned Coins and XP.');
    playSound('coin');
    spawnSparkles(10);
    const newLevel = getLevelFromXp(state.xp);
    if (newLevel > state.level) {
      state.level = newLevel;
      showToast(`Level up! Welcome to level ${state.level}.`);
      maybeUnlockRecipe();
      updateLocationUnlocks();
    }
    maybeUnlockRecipe();
    state.achievements.served10 = state.served >= 10;
    state.achievements.served100 = state.served >= 100;
    state.achievements.coins10000 = state.coins >= 10000;
    state.achievements.level10 = state.level >= 10;
    state.achievements.level50 = state.level >= 50;
    state.achievements.unlockAllDrinks = state.unlockedDrinks.length >= 15;
    generateOrder();
  } else {
    state.combo = 0;
    state.happiness = Math.max(25, state.happiness - 12);
    state.coins = Math.max(0, state.coins - 20);
    timerRemaining = Math.max(4, timerRemaining - 5);
    showToast('Oops! That order was wrong. Combo dropped!');
    playSound('fail');
    spawnSparkles(4);
    updateTimer();
  }
  saveState();
  updateHud();
}

function openShop() {
  elements.panelTitle.textContent = 'Shop';
  elements.panelContent.innerHTML = '';
  const sections = ['decorations', 'themes', 'cups'];
  sections.forEach((group) => {
    const section = document.createElement('div');
    section.className = 'mini-panel';
    section.innerHTML = `<h3>${group[0].toUpperCase() + group.slice(1)}</h3>`;
    const list = document.createElement('div');
    list.className = 'shop-grid';
    SHOP_ITEMS[group].forEach((item) => {
      const card = document.createElement('div');
      card.className = 'shop-item';
      const owned = state.purchasedItems.includes(item.name);
      card.innerHTML = `<strong>${item.name}</strong><br><small>${item.type}</small><div class="cost">${item.cost} 🪙</div>`;
      const button = document.createElement('button');
      button.className = 'action-btn';
      button.textContent = owned ? 'Owned' : 'Buy';
      button.disabled = owned;
      button.addEventListener('click', () => {
        if (state.coins >= item.cost) {
          state.coins -= item.cost;
          state.purchasedItems.push(item.name);
          if (group === 'themes') state.themes.push(item.name);
          if (group === 'cups') state.cups.push(item.name);
          if (group === 'decorations') state.decorations.push(item.name);
          showToast(`${item.name} added to your café!`);
          spawnSparkles(6);
          playSound('coin');
          saveState();
          updateHud();
          openShop();
        } else {
          showToast('Not enough Coins!');
        }
      });
      card.appendChild(button);
      list.appendChild(card);
    });
    section.appendChild(list);
    elements.panelContent.appendChild(section);
  });
  showScreen('panel');
}

function openMascots() {
  elements.panelTitle.textContent = 'Mascots';
  elements.panelContent.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'mascot-grid';
  MASCOTS.forEach((mascot, index) => {
    const card = document.createElement('div');
    card.className = 'shop-item';
    const owned = state.mascots.includes(mascot.name);
    card.innerHTML = `<strong>${mascot.icon} ${mascot.name}</strong><br><small>${mascot.bonus}</small>`;
    const button = document.createElement('button');
    button.className = 'action-btn';
    button.textContent = owned ? 'Collected' : `Unlock ${Math.max(80, 120 + index * 40)} Coins`;
    button.disabled = owned;
    button.addEventListener('click', () => {
      if (state.coins >= Math.max(80, 120 + index * 40)) {
        state.coins -= Math.max(80, 120 + index * 40);
        state.mascots.push(mascot.name);
        if (mascot.bonus === 'Extra Coins') state.coins += 60;
        if (mascot.bonus === 'Faster XP') state.xp += 15;
        if (mascot.bonus === 'Combo Boost') state.combo += 1;
        if (mascot.bonus === 'Longer Patience') state.happiness = Math.min(100, state.happiness + 8);
        showToast(`${mascot.name} joined your café!`);
        spawnSparkles(6);
        playSound('serve');
        saveState();
        updateHud();
        openMascots();
      } else {
        showToast('You need more Coins to adopt this mascot.');
      }
    });
    card.appendChild(button);
    grid.appendChild(card);
  });
  elements.panelContent.appendChild(grid);
  showScreen('panel');
}

function openAchievements() {
  elements.panelTitle.textContent = 'Achievements';
  elements.panelContent.innerHTML = '';
  const achievements = [
    ['Serve 10 Drinks', state.served >= 10],
    ['Serve 100 Drinks', state.served >= 100],
    ['Earn 10,000 Coins', state.coins >= 10000],
    ['Reach Level 10', state.level >= 10],
    ['Reach Level 50', state.level >= 50],
    ['Unlock Every Drink', state.unlockedDrinks.length >= 15],
    ['Collect Every Mascot', state.mascots.length >= MASCOTS.length],
    ['Fully Decorate the Café', state.decorations.length >= 4]
  ];
  const list = document.createElement('div');
  list.className = 'achievement-grid';
  achievements.forEach(([label, done]) => {
    const card = document.createElement('div');
    card.className = 'achievement-item';
    card.innerHTML = `<strong>${done ? '✅' : '🫧'} ${label}</strong><br><small>${done ? 'Unlocked' : 'Keep going'}</small>`;
    list.appendChild(card);
  });
  elements.panelContent.appendChild(list);
  showScreen('panel');
}

function openHowToPlay() {
  elements.panelTitle.textContent = 'How to Play';
  elements.panelContent.innerHTML = `
    <div class="mini-panel">
      <p>Build the drink exactly matching the customer ticket: drink, ice, sugar, and toppings.</p>
      <p>Serve correctly to gain Coins, XP, and combo points. Wrong answers cost time and break your combo.</p>
      <p>Buy items in the shop, adopt mascots, collect daily rewards, and grow your café to new locations.</p>
    </div>`;
  showScreen('panel');
}

function openCredits() {
  elements.panelTitle.textContent = 'Credits';
  elements.panelContent.innerHTML = `
    <div class="mini-panel">
      <p>Bubble Tea Rush is a cozy original café game made with pure HTML, CSS, and JavaScript.</p>
      <p>Designed with a kawaii pastel vibe, instant startup, and playful café progression.</p>
    </div>`;
  showScreen('panel');
}

function openSettings() {
  elements.panelTitle.textContent = 'Settings';
  elements.panelContent.innerHTML = `
    <div class="mini-panel">
      <div class="control-row">
        <button id="music-toggle" class="action-btn">${state.settings.music ? 'Music: ON' : 'Music: OFF'}</button>
        <button id="sfx-toggle" class="action-btn">${state.settings.sfx ? 'SFX: ON' : 'SFX: OFF'}</button>
      </div>
    </div>`;
  showScreen('panel');
  document.querySelector('#music-toggle').addEventListener('click', () => {
    state.settings.music = !state.settings.music;
    showToast(`Music ${state.settings.music ? 'enabled' : 'disabled'}`);
    saveState();
    openSettings();
  });
  document.querySelector('#sfx-toggle').addEventListener('click', () => {
    state.settings.sfx = !state.settings.sfx;
    showToast(`SFX ${state.settings.sfx ? 'enabled' : 'disabled'}`);
    saveState();
    openSettings();
  });
}

function startGame() {
  showScreen('game');
  generateOrder();
  startTimer();
  updateHud();
  spawnSparkles(8);
}

function initEvents() {
  document.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      playSound('click');
      const action = btn.dataset.action;
      if (action === 'play') startGame();
      if (action === 'continue') { showScreen('game'); generateOrder(); startTimer(); updateHud(); }
      if (action === 'settings') openSettings();
      if (action === 'achievements') openAchievements();
      if (action === 'howto') openHowToPlay();
      if (action === 'credits') openCredits();
    });
  });

  elements.serveBtn.addEventListener('click', handleServe);
  elements.newOrderBtn.addEventListener('click', () => { generateOrder(); playSound('click'); });
  elements.dailyBtn.addEventListener('click', giveDailyReward);
  elements.shopBtn.addEventListener('click', openShop);
  elements.mascotBtn.addEventListener('click', openMascots);
  elements.closePanel.addEventListener('click', () => { showScreen('game'); });
  elements.backToMenuBtn.addEventListener('click', () => {
    clearInterval(timerId);
    showScreen('menu');
    saveState();
  });
}

function boot() {
  updateHud();
  updateLocationUnlocks();
  renderOptions();
  initEvents();
  if (state.level >= 10) state.unlockedDrinks.push('Sakura Tea');
  showScreen('menu');
}

boot();
