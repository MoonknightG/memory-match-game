const gameBoard = document.getElementById('gameBoard');
const startBtn = document.getElementById('startBtn');
const difficultySelect = document.getElementById('difficulty');
const timeEl = document.getElementById('time');
const movesEl = document.getElementById('moves');
const highScoresEl = document.getElementById('highScores');

let firstCard, secondCard;
let lockBoard = false;
let moves = 0;
let time = 0;
let timerInterval;
let matchedPairs = 0;
let totalPairs = 0;

// Emoji set
const emojis = ["🍎","🍌","🍇","🍉","🍓","🍍","🥝","🥑",
                "🚗","🚀","🚲","✈️","🚁","🚤","🏍️","🛻",
                "🐶","🐱","🦊","🐻","🐼","🦁","🐮","🐸",
                "⚽","🏀","🏈","⚾","🎾","🏐","🎱","🥏"];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createBoard(size) {
  gameBoard.innerHTML = '';
  const numPairs = (size * size) / 2;
  totalPairs = numPairs;
  const selected = emojis.slice(0, numPairs);
  const cardsArray = shuffle([...selected, ...selected]);
  gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  cardsArray.forEach(symbol => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">${symbol}</div>
      </div>
    `;
    card.addEventListener('click', () => flipCard(card, symbol));
    gameBoard.appendChild(card);
  });
}

function flipCard(card, symbol) {
  if (lockBoard || card === firstCard || card.classList.contains('flipped')) return;
  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves++;
  movesEl.textContent = moves;
  checkMatch();
}

function checkMatch() {
  const firstSymbol = firstCard.querySelector('.card-back').textContent;
  const secondSymbol = secondCard.querySelector('.card-back').textContent;

  if (firstSymbol === secondSymbol) {
    matchedPairs++;
    resetTurn();
    if (matchedPairs === totalPairs) endGame();
  } else {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetTurn();
    }, 1000);
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function startGame() {
  clearInterval(timerInterval);
  moves = 0;
  time = 0;
  matchedPairs = 0;
  movesEl.textContent = moves;
  timeEl.textContent = time;

  let size;
  if (difficultySelect.value === 'easy') size = 4;
  if (difficultySelect.value === 'medium') size = 6;
  if (difficultySelect.value === 'hard') size = 8;

  createBoard(size);

  timerInterval = setInterval(() => {
    time++;
    timeEl.textContent = time;
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  alert(`🎉 You won! Time: ${time}s, Moves: ${moves}`);
  saveHighScore(difficultySelect.value, time, moves);
  renderHighScores();
}

function saveHighScore(level, time, moves) {
  const scores = JSON.parse(localStorage.getItem('memoryScores')) || {};
  if (!scores[level] || time < scores[level].time) {
    scores[level] = { time, moves };
  }
  localStorage.setItem('memoryScores', JSON.stringify(scores));
}

function renderHighScores() {
  const scores = JSON.parse(localStorage.getItem('memoryScores')) || {};
  highScoresEl.innerHTML = '';
  ['easy','medium','hard'].forEach(level => {
    if (scores[level]) {
      const li = document.createElement('li');
      li.textContent = `${level.toUpperCase()}: ${scores[level].time}s (${scores[level].moves} moves)`;
      highScoresEl.appendChild(li);
    }
  });
}

startBtn.addEventListener('click', startGame);
renderHighScores();
