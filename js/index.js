//\\OOOOOOOOOOOOOO///////////////////////// 
// \\OOOOOOOOOOOO/////////////////////////   
//  \\OOOOOOOOOO/////////////////////////  /*\  
//   \\OOOOOOOO/////////////////////////  /***\  
//    \\OOOOOO/////////////////////////  /*****\  
//     \\OOOO/////////////////////////  /*******\  
//      \\OO/////////////////////////  /****|****\  
//       \\/////////////////////////  /****(o)****\  
//        XXXXXXXXXXXXXXXXXXXXXXXXX   ****(ooo)****  
//       //\\\\\\\\\\\\\\\\\\\\\\\\\  \****(o)****/  
//      //OO\\\\\\\\\\\\\\\\\\\\\\\\\  \****|****/  
//     //OOOO\\\\\\\\\\\\\\\\\\\\\\\\\  \*******/  
//    //OOOOOO\\\\\\\\\\\\\\\\\\\\\\\\\  \*****/  
//   //OOOOOOOO\\\\\\\\\\\\\\\\\\\\\\\\\  \***/  
//  //OOOOOOOOOO\\\\\\\\\\\\\\\\\\\\\\\\\  \*/  
// //OOOOOOOOOOOO\\\\\\\\\\\\\\\\\\\\\\\\\   
////OOOOOOOOOOOOOO\\\\\\\\\\\\\\\\\\\\\\\\\ 

document.addEventListener('DOMContentLoaded', () => {
  init();

  // Set up event listeners
  document.getElementById("guess_input").addEventListener('keyup', inputKeyUp);
  document.getElementById("submit_guess").addEventListener('click', submitGuess);

  const startButton = document.getElementById("start_button");
  startButton.addEventListener('click', () => {
    shufflePuzzle();
    countDown();
    startButton.remove();
  });
});

const ANSWERS = [
  {
    text: "biplanes",
    complete: false
  }, 
  {
    text: "scrapped",
    complete: false
  }
];
const HIDDEN_RIDDLE = "bad apple princess"
const GUESS_ELEMENT_HASH = {};
const puzzleWordElement = document.getElementById("puzzle_words");

function initWordPuzzle(text){
  for (const char of text) {
    if (isSpaceCharacter(char)){
      addElementToBody(createSpaceElement());
    } else {
      addElementToBody(createCharacterElement(char));
    }
  }
}

function createCharacterElement(char){
  if (charInAnswer(char)){
    const element = createGuessLetterElement(char);
    populateGuessElementHash(char, element);
    return element;
  }
  return createRevealedLetterElement(char);
}

function populateGuessElementHash(char, element){
  if (!GUESS_ELEMENT_HASH[char]){
    GUESS_ELEMENT_HASH[char] = [];
  }
  GUESS_ELEMENT_HASH[char].push(element);
}

function addElementToBody(element){
  puzzleWordElement.appendChild(element);
  return element;
}

function charInAnswer(char){
  return true;
}

function createSpaceElement(){
  let spaceElement = document.createElement("div");
  spaceElement.className = "space-element";
  return spaceElement;
}

function createRevealedLetterElement(char){
  const letterElement = document.createElement("div");
  letterElement.dataset.letter = char;
  letterElement.className = "revealed-letter-element";
  letterElement.textContent = char;
  return letterElement;
}

function isSpaceCharacter(char){
  return char.charCodeAt(0) === 32;
}

function revealCorrectGuess(word){
  for (const letter of word) {
    const optionsArray = GUESS_ELEMENT_HASH[letter];
    const choice = chooseRandomOption(optionsArray);
    choice.dataset.letter = "";
    choice.style.borderBottom = "none";
    choice.style.textShadow = "10px 10px 0 #ffd217, 20px 20px 0 #5ac7ff, 30px 30px 0 #ffd217, 40px 40px 0 #5ac7ff";
    choice.style.color = "white";
  }
}

function chooseRandomOption(optionsArray){
  const filteredOptions = optionsArray.filter(option => option.dataset.letter);
  const randomIndex = Math.floor(Math.random() * filteredOptions.length);
  return filteredOptions[randomIndex];
}

function createGuessLetterElement(letter){
  const letterElement = document.createElement("div");
  letterElement.dataset.letter = letter;
  letterElement.className = "letter-element";
  letterElement.textContent = letter;
  return letterElement;
}

function markComplete(answer){
  answer.complete = true;
}

function guessIsCorrect(guess){
  const lowerGuess = guess.toLowerCase();
  const answer = ANSWERS.find(a => a.text === lowerGuess);
  if (answer) {
    if (answer.complete) {
      alertAlreadyAnswered(lowerGuess);
      return false;
    }
    markComplete(answer);
    return true;
  }
  alertWrongAnswer(lowerGuess);
  return false;
}

function submitGuess(){
  const input = document.getElementById("guess_input");
  const guess = input.value;
  if (guess && guessIsCorrect(guess)){
    document.getElementById("notice_box").textContent = "";
    revealCorrectGuess(guess);
    input.value = "";
  }
}

function inputKeyUp(event){
  if (event.key === "Enter") {
    submitGuess();
  }
}

function alertWrongAnswer(wrongAnswer){
  const elem = document.getElementById("notice_box");
  elem.textContent = `Sorry, '${wrongAnswer}' is not the right answer. Guess again!`;
}

function alertAlreadyAnswered(answer){
  const elem = document.getElementById("notice_box");
  elem.textContent = `Sorry, you already guessed '${answer}'. Guess again!`;
}

// IMAGE PUZZLE adapted from: https://code.tutsplus.com/tutorials/create-an-html5-canvas-tile-swapping-puzzle--active-10747

const PUZZLE_DIFFICULTY = 5;
const PUZZLE_HOVER_TINT = '#009900';
const PUZZLE_INITIAL_VIEW_LENGTH_MS = 5000;
 
let CANVAS;
let CONTEXT;
let IMAGE;
let PIECES;
let PUZZLE_WIDTH;
let PUZZLE_HEIGHT;
let PIECE_WIDTH;
let PIECE_HEIGHT;
let CURRENT_PIECE;
let CURRENT_DROPPIECE;
let MOUSE;

function init(){
    IMAGE = new Image();
    IMAGE.addEventListener('load', onImage, false);
    IMAGE.src = "./images/flowercarrier.jpg";
}

function onImage(e){
    PIECE_WIDTH = Math.floor(IMAGE.width / PUZZLE_DIFFICULTY);
    PIECE_HEIGHT = Math.floor(IMAGE.height / PUZZLE_DIFFICULTY);
    PUZZLE_WIDTH = PIECE_WIDTH * PUZZLE_DIFFICULTY;
    PUZZLE_HEIGHT = PIECE_HEIGHT * PUZZLE_DIFFICULTY;
    setCanvas();
    initPuzzle();
}

let clickWrapper;
let frame;

function setCanvas(){
    clickWrapper = document.getElementById('canvas_click_wrapper');
    frame = document.getElementById('frame');
    CANVAS = document.getElementById('canvas');
    CONTEXT = CANVAS.getContext('2d');
    CANVAS.width = PUZZLE_WIDTH;
    CANVAS.height = PUZZLE_HEIGHT;
}

function initPuzzle(){
    PIECES = [];
    MOUSE = { x: 0, y: 0 };
    CURRENT_PIECE = null;
    CURRENT_DROPPIECE = null;
    CONTEXT.drawImage(IMAGE, 0, 0, PUZZLE_WIDTH, PUZZLE_HEIGHT, 0, 0, PUZZLE_WIDTH, PUZZLE_HEIGHT);
    buildPieces();
}

function createTitle(msg){
    CONTEXT.fillStyle = "#000000";
    CONTEXT.globalAlpha = .4;
    CONTEXT.fillRect(100,PUZZLE_HEIGHT - 40,PUZZLE_WIDTH - 200,40);
    CONTEXT.fillStyle = "#FFFFFF";
    CONTEXT.globalAlpha = 1;
    CONTEXT.textAlign = "center";
    CONTEXT.textBaseline = "middle";
    CONTEXT.font = "20px Arial";
    CONTEXT.fillText(msg,PUZZLE_WIDTH / 2,PUZZLE_HEIGHT - 20);
}

function buildPieces(){
    let xPos = 0;
    let yPos = 0;
    for(let i = 0; i < PUZZLE_DIFFICULTY * PUZZLE_DIFFICULTY; i++){
        const piece = { sx: xPos, sy: yPos };
        PIECES.push(piece);
        xPos += PIECE_WIDTH;
        if(xPos >= PUZZLE_WIDTH){
            xPos = 0;
            yPos += PIECE_HEIGHT;
        }
    }
}

function shufflePuzzle(){
    PIECES = shuffleArray(PIECES);
    CONTEXT.clearRect(0,0,PUZZLE_WIDTH,PUZZLE_HEIGHT);
    let xPos = 0;
    let yPos = 0;
    for(const piece of PIECES){
        piece.xPos = xPos;
        piece.yPos = yPos;
        CONTEXT.drawImage(IMAGE, piece.sx, piece.sy, PIECE_WIDTH, PIECE_HEIGHT, xPos, yPos, PIECE_WIDTH, PIECE_HEIGHT);
        CONTEXT.strokeRect(xPos, yPos, PIECE_WIDTH, PIECE_HEIGHT);
        xPos += PIECE_WIDTH;
        if(xPos >= PUZZLE_WIDTH){
            xPos = 0;
            yPos += PIECE_HEIGHT;
        }
    }
    clickWrapper.onmousedown = onPuzzleClick;
}

function shuffleArray(array){
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function onPuzzleClick(e){
    const rect = CANVAS.getBoundingClientRect();
    MOUSE.x = e.clientX - rect.left;
    MOUSE.y = e.clientY - rect.top;

    CURRENT_PIECE = checkPieceClicked();
    if(CURRENT_PIECE !== null){
        CONTEXT.clearRect(CURRENT_PIECE.xPos, CURRENT_PIECE.yPos, PIECE_WIDTH, PIECE_HEIGHT);
        CONTEXT.save();
        CONTEXT.globalAlpha = .9;
        CONTEXT.drawImage(IMAGE, CURRENT_PIECE.sx, CURRENT_PIECE.sy, PIECE_WIDTH, PIECE_HEIGHT, MOUSE.x - (PIECE_WIDTH / 2), MOUSE.y - (PIECE_HEIGHT / 2), PIECE_WIDTH, PIECE_HEIGHT);
        CONTEXT.restore();
        clickWrapper.onmousemove = updatePuzzle;
        clickWrapper.onmouseup = pieceDropped;
    }
}

function checkPieceClicked(){
  for(const piece of PIECES){
    if(MOUSE.x >= piece.xPos && MOUSE.x <= (piece.xPos + PIECE_WIDTH) &&
       MOUSE.y >= piece.yPos && MOUSE.y <= (piece.yPos + PIECE_HEIGHT)){
      return piece;
    }
  }
  return null;
}

function updatePuzzle(e){
  CURRENT_DROPPIECE = null;
  const rect = CANVAS.getBoundingClientRect();
  MOUSE.x = e.clientX - rect.left;
  MOUSE.y = e.clientY - rect.top;

  CONTEXT.clearRect(0, 0, PUZZLE_WIDTH, PUZZLE_HEIGHT);

  for(const piece of PIECES){
    if(piece === CURRENT_PIECE){
      continue;
    }
    CONTEXT.drawImage(IMAGE, piece.sx, piece.sy, PIECE_WIDTH, PIECE_HEIGHT, piece.xPos, piece.yPos, PIECE_WIDTH, PIECE_HEIGHT);
    CONTEXT.strokeRect(piece.xPos, piece.yPos, PIECE_WIDTH, PIECE_HEIGHT);
    if(CURRENT_DROPPIECE === null){
      if(MOUSE.x >= piece.xPos && MOUSE.x <= (piece.xPos + PIECE_WIDTH) &&
         MOUSE.y >= piece.yPos && MOUSE.y <= (piece.yPos + PIECE_HEIGHT)){
        CURRENT_DROPPIECE = piece;
        CONTEXT.save();
        CONTEXT.globalAlpha = .4;
        CONTEXT.fillStyle = PUZZLE_HOVER_TINT;
        CONTEXT.fillRect(CURRENT_DROPPIECE.xPos, CURRENT_DROPPIECE.yPos, PIECE_WIDTH, PIECE_HEIGHT);
        CONTEXT.restore();
      }
    }
  }
  CONTEXT.save();
  CONTEXT.globalAlpha = .6;
  CONTEXT.drawImage(IMAGE, CURRENT_PIECE.sx, CURRENT_PIECE.sy, PIECE_WIDTH, PIECE_HEIGHT, MOUSE.x - (PIECE_WIDTH / 2), MOUSE.y - (PIECE_HEIGHT / 2), PIECE_WIDTH, PIECE_HEIGHT);
  CONTEXT.restore();
  CONTEXT.strokeRect(MOUSE.x - (PIECE_WIDTH / 2), MOUSE.y - (PIECE_HEIGHT / 2), PIECE_WIDTH, PIECE_HEIGHT);
}

function pieceDropped(e){
  clickWrapper.onmousemove = null;
  clickWrapper.onmouseup = null;
  if(CURRENT_DROPPIECE !== null){
    const tmp = { xPos: CURRENT_PIECE.xPos, yPos: CURRENT_PIECE.yPos };
    CURRENT_PIECE.xPos = CURRENT_DROPPIECE.xPos;
    CURRENT_PIECE.yPos = CURRENT_DROPPIECE.yPos;
    CURRENT_DROPPIECE.xPos = tmp.xPos;
    CURRENT_DROPPIECE.yPos = tmp.yPos;
  }
  resetPuzzleAndCheckWin();
}

function resetPuzzleAndCheckWin(){
  CONTEXT.clearRect(0, 0, PUZZLE_WIDTH, PUZZLE_HEIGHT);
  let gameWin = true;
  for (const piece of PIECES){
    CONTEXT.drawImage(IMAGE, piece.sx, piece.sy, PIECE_WIDTH, PIECE_HEIGHT, piece.xPos, piece.yPos, PIECE_WIDTH, PIECE_HEIGHT);
    CONTEXT.strokeRect(piece.xPos, piece.yPos, PIECE_WIDTH, PIECE_HEIGHT);
    if (piece.xPos !== piece.sx || piece.yPos !== piece.sy){
      gameWin = false;
    }
  }
  if (gameWin){
    setTimeout(gameOver, 500);
  }
}

function gameOver(){
  clickWrapper.onmousedown = null;
  clickWrapper.onmousemove = null;
  clickWrapper.onmouseup = null;
  frame.style.display = "none";
  document.documentElement.style.backgroundColor = "palevioletred";
  document.getElementById("clock_container").style.display = "none";
  document.getElementById("word_puzzle_input_container").style.display = "flex";
  initWordPuzzle(HIDDEN_RIDDLE);
}

// COUNTDOWN TIMER adapted from https://github.com/sanographix/css3-countdown

const COUNTDOWN_LENGTH_SECONDS = 100;

class CountdownTimer {
  constructor(elementId, endTime, onComplete) {
    this.elem = document.getElementById(elementId);
    this.endTime = endTime;
    this.onComplete = onComplete;
    this.animationId = null;
    this.lastSecond = -1;
    this.initDisplay();
  }

  initDisplay() {
    this.elem.innerHTML = `
      <span class="number-wrapper"><div class="line"></div><span class="number min">00</span></span>
      <span class="number-wrapper"><div class="line"></div><span class="number sec">00</span></span>
    `;
    this.minElem = this.elem.querySelector('.min');
    this.secElem = this.elem.querySelector('.sec');
  }

  addZero(num) {
    return String(num).padStart(2, '0');
  }

  update() {
    const now = Date.now();
    const remaining = this.endTime - now;

    if (remaining > 0) {
      const totalSeconds = Math.ceil(remaining / 1000);
      const min = Math.floor(totalSeconds / 60);
      const sec = totalSeconds % 60;

      // Only update DOM when seconds change (performance optimization)
      if (totalSeconds !== this.lastSecond) {
        this.lastSecond = totalSeconds;
        this.minElem.textContent = this.addZero(min);
        this.secElem.textContent = this.addZero(sec);
      }

      this.animationId = requestAnimationFrame(() => this.update());
    } else {
      this.onComplete();
    }
  }

  start() {
    this.update();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

function countDown(startDelayMS = 0) {
  const endTime = Date.now() + (COUNTDOWN_LENGTH_SECONDS * 1000);
  const timer = new CountdownTimer('CDT', endTime, resetPuzzle);
  setTimeout(() => timer.start(), startDelayMS);
}

function resetPuzzle() {
  shufflePuzzle();
  countDown(1000);
}