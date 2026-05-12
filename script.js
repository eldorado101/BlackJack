const suits = ['♠', '♥', '♦', '♣'];
const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
let deck = [];
let players = [];
let dealer = { hand: [], result: '', isComputer: true };
let currentTurnIndex = 0;
let gameActive = false;

const logList = document.getElementById('logList');
const hitBtn = document.getElementById('hitBtn');
const standBtn = document.getElementById('standBtn');
const newGameBtn = document.getElementById('newGameBtn');

function log(msg) {
  const li = document.createElement('li');
  li.textContent = msg;
  logList.prepend(li);
}

function createDeck() {
  let d = [];
  for (let s of suits) for (let v of values) d.push({ suit: s, value: v, hidden: false });
  return d;
}

function shuffle(d) {
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function getHandValue(hand) {
  let val = 0, aces = 0;
  for (let c of hand.filter(c => !c.hidden)) {
    if (c.value === 'A') { aces++; val += 11; }
    else if (['J','Q','K'].includes(c.value)) val += 10;
    else val += parseInt(c.value);
  }
  while (val > 21 && aces > 0) { val -= 10; aces--; }
  return val;
}

function renderHand(container, hand, isDealer = false) {
  container.innerHTML = '';
  hand.forEach(c => {
    const el = document.createElement('div');
    el.className = `card ${c.hidden ? 'hidden' : (c.suit === '♥' || c.suit === '♦' ? 'red' : '')}`;
    if (!c.hidden) {
      el.innerHTML = `<span>${c.value}</span><span style="font-size:1.2rem">${c.suit}</span><span style="transform:rotate(180deg)">${c.value}</span>`;
    } else {
      el.innerHTML = `<span>?</span>`;
    }
    container.appendChild(el);
  });
}

function initGame() {
  deck = shuffle(createDeck());
  players = [
    { id: 'player1', name: 'Player 1', hand: [], isComputer: false, stood: false, result: '' },
    { id: 'player2', name: 'Player 2', hand: [], isComputer: false, stood: false, result: '' },
    { id: 'ai1', name: 'AI 1', hand: [], isComputer: true, stood: false, result: '' },
    { id: 'ai2', name: 'AI 2', hand: [], isComputer: true, stood: false, result: '' }
  ];
  dealer = { hand: [], result: '', isComputer: true };
  currentTurnIndex = 0;
  gameActive = true;
  logList.innerHTML = '';
  hitBtn.disabled = true;
  standBtn.disabled = true;

  // Deal 2 cards
  players.forEach(p => { p.hand = [deck.pop(), deck.pop()]; });
  dealer.hand = [deck.pop(), { ...deck.pop(), hidden: true }];

  log('Game started. Cards dealt.');
  updateUI();
  startTurn();
}

function updateUI() {
  document.getElementById('dealerHand').innerHTML = '';
  renderHand(document.getElementById('dealerHand'), dealer.hand, true);
  document.getElementById('dealerStatus').textContent = dealer.result ? dealer.result : `Value: ${getHandValue(dealer.hand)}`;

  players.forEach(p => {
    const el = document.getElementById(p.id);
    el.querySelector('.hand').innerHTML = '';
    renderHand(el.querySelector('.hand'), p.hand);
    el.querySelector('.status').textContent = p.result || `Value: ${getHandValue(p.hand)}`;
  });
}

function startTurn() {
  if (!gameActive) return;
  const p = players[currentTurnIndex];

  if (p.isComputer) {
    // AI plays automatically
    setTimeout(() => {
      while (getHandValue(p.hand) < 17) {
        p.hand.push(deck.pop());
        log(`${p.name} hits.`);
      }
      p.stood = true;
      log(`${p.name} stands.`);
      updateUI();
      nextTurn();
    }, 600);
  } else {
    // Human player
    hitBtn.disabled = false;
    standBtn.disabled = false;
    log(`${p.name}'s turn.`);
  }
}

function hit() {
  const p = players[currentTurnIndex];
  p.hand.push(deck.pop());
  log(`${p.name} hits.`);
  updateUI();

  if (getHandValue(p.hand) > 21) {
    p.result = 'BUST';
    p.stood = true;
    log(`${p.name} busts!`);
    nextTurn();
  }
}

function stand() {
  const p = players[currentTurnIndex];
  p.stood = true;
  log(`${p.name} stands.`);
  nextTurn();
}

function nextTurn() {
  currentTurnIndex++;
  hitBtn.disabled = true;
  standBtn.disabled = true;

  if (currentTurnIndex >= players.length) {
    dealerPlay();
    return;
  }
  updateUI();
  startTurn();
}

function dealerPlay() {
  // Reveal hidden card
  dealer.hand[1].hidden = false;
  log('Dealer reveals cards.');
  updateUI();

  setTimeout(() => {
    while (getHandValue(dealer.hand) < 17) {
      dealer.hand.push(deck.pop());
      log('Dealer hits.');
      updateUI();
    }
    log('Dealer stands.');
    calculateResults();
  }, 800);
}

function calculateResults() {
  const dealerVal = getHandValue(dealer.hand);
  const dealerBust = dealerVal > 21;
  dealer.result = dealerBust ? 'BUST' : `Stands at ${dealerVal}`;

  players.forEach(p => {
    const val = getHandValue(p.hand);
    const bust = val > 21;
    if (bust) p.result = 'BUST - LOSE';
    else if (dealerBust || val > dealerVal) p.result = val === 21 && p.hand.length === 2 ? 'BLACKJACK!' : 'WIN';
    else if (val === dealerVal) p.result = 'PUSH';
    else p.result = 'LOSE';
  });

  log('Round over. Results:');
  players.forEach(p => log(`${p.name}: ${p.result}`));
  log(`Dealer: ${dealer.result}`);

  gameActive = false;
  hitBtn.disabled = true;
  standBtn.disabled = true;
  newGameBtn.textContent = 'Play Again';
  updateUI();
}

hitBtn.addEventListener('click', hit);
standBtn.addEventListener('click', stand);
newGameBtn.addEventListener('click', initGame);

// Auto-start
initGame();
