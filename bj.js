'use strict'

var prompt = require('prompt');
var colors = require('colors');

////////////////////////////////////////////////////////////////////////
//                              Variables                             //
////////////////////////////////////////////////////////////////////////

var dealerCards = [];
var myCards = [];
var stratWins = 0;
var decisions = 0;
var cash = 100;
var theCount = 0;
var bet = 10;
var deck;
var numberOfDecks;

var sampleDeck = [
{view: "A", suit: "Hearts", value: 1},
{view: "2", suit: "Hearts", value: 2},
{view: "3", suit: "Hearts", value: 3},
{view: "4", suit: "Hearts", value: 4},
{view: "5", suit: "Hearts", value: 5},
{view: "6", suit: "Hearts", value: 6},
{view: "7", suit: "Hearts", value: 7},
{view: "8", suit: "Hearts", value: 8},
{view: "9", suit: "Hearts", value: 9},
{view: "10", suit: "Hearts", value: 10},
{view: "J", suit: "Hearts", value: 10},
{view: "Q", suit: "Hearts", value: 10},
{view: "K", suit: "Hearts", value: 10},
{view: "A", suit: "Diamonds", value: 1},
{view: "2", suit: "Diamonds", value: 2},
{view: "3", suit: "Diamonds", value: 3},
{view: "4", suit: "Diamonds", value: 4},
{view: "5", suit: "Diamonds", value: 5},
{view: "6", suit: "Diamonds", value: 6},
{view: "7", suit: "Diamonds", value: 7},
{view: "8", suit: "Diamonds", value: 8},
{view: "9", suit: "Diamonds", value: 9},
{view: "10", suit: "Diamonds", value: 10},
{view: "J", suit: "Diamonds", value: 10},
{view: "Q", suit: "Diamonds", value: 10},
{view: "K", suit: "Diamonds", value: 10},
{view: "A", suit: "Spades", value: 1},
{view: "2", suit: "Spades", value: 2},
{view: "3", suit: "Spades", value: 3},
{view: "4", suit: "Spades", value: 4},
{view: "5", suit: "Spades", value: 5},
{view: "6", suit: "Spades", value: 6},
{view: "7", suit: "Spades", value: 7},
{view: "8", suit: "Spades", value: 8},
{view: "9", suit: "Spades", value: 9},
{view: "10", suit: "Spades", value: 10},
{view: "J", suit: "Spades", value: 10},
{view: "Q", suit: "Spades", value: 10},
{view: "K", suit: "Spades", value: 10},
{view: "A", suit: "Clubs", value: 1},
{view: "2", suit: "Clubs", value: 2},
{view: "3", suit: "Clubs", value: 3},
{view: "4", suit: "Clubs", value: 4},
{view: "5", suit: "Clubs", value: 5},
{view: "6", suit: "Clubs", value: 6},
{view: "7", suit: "Clubs", value: 7},
{view: "8", suit: "Clubs", value: 8},
{view: "9", suit: "Clubs", value: 9},
{view: "10", suit: "Clubs", value: 10},
{view: "J", suit: "Clubs", value: 10},
{view: "Q", suit: "Clubs", value: 10},
{view: "K", suit: "Clubs", value: 10}
]

////////////////////////////////////////////////////////////////////////
//                            Prompt Schema                           //
////////////////////////////////////////////////////////////////////////

var numOfDecksSchema = {
  properties: {
    numberOfDecks: {
      pattern: /^[1-9]$/,
      message: 'Pick number 1-9',
      required: true
    }
  }
}

var moveSchema = {
  properties: {
    move: {
      pattern: /^[hspd]$|^su$|^ds$/,
      message: '(h)it (s)tand (d)oubledown s(p)lit (su)rrender (ds)dd else stand',
      required: true
    }
  }
}

var playAgainSchema = {
  properties: {
    playAgain: {
      pattern: /^y$|^n$/,
      message: 'y or n',
      required: true
    }
  }
}

////////////////////////////////////////////////////////////////////////
//                           Side Functions                           //
////////////////////////////////////////////////////////////////////////

function shuffleCards(numOfDeck){
  let decksOfCards = [];
  for(let i = 0; i < numOfDeck; i++){
    sampleDeck.forEach(card => {
      decksOfCards.push(card);
    });
  };
  for(let i = decksOfCards.length; i > 0; i--){
    let cardPosition = Math.round(Math.random() * decksOfCards.length);
    let heldCard = decksOfCards[cardPosition];
    // Now trade cards
    decksOfCards[cardPosition] = decksOfCards[i - 1]
    decksOfCards[i - 1] = heldCard
  };
  return decksOfCards;
}

function dealerMove(){
  let handValue = dealerCards[0].value + dealerCards[1].value;
  let aceHand = false;
  let cardString = "Dealer Cards: " + dealerCards[0].view.blue + " " + dealerCards[1].view.blue;

  for (let i = 0; i < dealerCards.length; i++){
    if (dealerCards[i].value == 1) { aceHand = true; }
  }
  if (aceHand && handValue + 10 <= 21) { handValue = handValue + 10; }

  // handle the hitting and shit
  while (handValue < 17 || (handValue == 17 && aceHand)) {
    let newCard = deck.pop();
    if (newCard.value == 1) {
      aceHand = true;
      if (handValue + 11 > 21) { handValue += 1; }
      else { handValue += 11; }
    }
    else { handValue += newCard.value; }
    dealerCards.push(newCard);
    cardString += " " + newCard.view.blue;
  }
  return [handValue, cardString]
}

////////////////////////////////////////////////////////////////////////
//                              Gameflow                              //
////////////////////////////////////////////////////////////////////////

// Starts a new hands
function newHand(deck){
  console.log("*************************".cyan);
  console.log("Dealing ...");

  bet = 10;
  cash -= 10;
  dealerCards = [];
  myCards = [];
  myCards.push(deck.pop());
  dealerCards.push(deck.pop());
  myCards.push(deck.pop());
  dealerCards.push(deck.pop());

  console.log("Dealer cards: " + "* ".blue + dealerCards[1].view.blue);
  console.log("Your cards: " + myCards[0].view.blue + " " + myCards[1].view.blue);
  prompt.get(moveSchema, function (err, result){
    analyzeAndRunMove(result.move);
  });
}

function analyzeAndRunMove(move){
  // Set up variables to analyze the hands
  let aceHandM = false;
  let handValueM = 0;
  let pairHandM = (myCards[0].value == myCards[1].value);
  let dealerCard = dealerCards[1].value;
  let correctAnswer;

  // Loops through player cards
  for(let i = 0; i < myCards.length; i++){
    handValueM += myCards[i].value;
    if(myCards[i].value == 1){
      aceHandM = true;
    }
  }

  // Big if/else tree to analyze stategy
  // Small hands
  if (handValueM == 2) { correctAnswer = "p" }
  // Large hands
  else if (handValueM > 18) { correctAnswer = "s" }
  // Pairs
  else if (pairHandM) {
    // Low dealer card
    if (dealerCard > 1 && dealerCard < 7) {
      if (handValueM == 8 && (dealerCard == 2 || dealerCard == 3 || dealerCard == 4)) { correctAnswer = "h"; }
      else{ correctAnswer = "p"; }
    }
    // High dealer card, player 9-9
    else if (handValueM == 18 && (dealerCard == 7 || dealerCard == 10 || dealerCard == 1)) { correctAnswer = "s"; }
    // High dealer card, player hand 8-8 or 9-9
    else if (handValueM > 14) { correctAnswer = "p"; }
    // Dealer 7 splits
    else if (dealerCard == 7 && (handValueM == 4 || handValueM == 6 || handValueM == 14)){ correctAnswer = "p"; }
    else { correctAnswer = "h"; }
  }
  // Ace hands
  else if (aceHandM) {
    // High ace hands
    if (handValueM > 8) { correctAnswer = "s"; }
    // A-7 splits
    else if (handValueM == 8) {
      if (dealerCard == 2 || dealerCard == 7 || dealerCard == 8) { correctAnswer = "s" }
      else if (dealerCard > 8) { correctAnswer = "h"; }
      else { correctAnswer = "ds"; }
    }
    // Dealer 6 or 5
    else if (dealerCard == 5 || dealerCard == 6) { correctAnswer = "d"; }
    else if (dealerCard == 4 && handValueM > 4) { correctAnswer = "d"; }
    else if (dealerCard == 3 && handValueM == 6) { correctAnswer = "d"; }
    else { correctAnswer == "h"}
  }
  // Low non-pairs, non-aces
  else if (handValueM <= 8) { correctAnswer = "h"; }
  // High non-pairs, non-aces
  else if (handValueM >= 17) { correctAnswer = "s"; }
  // Mid non-pairs, non-aces
  else {
    // Surrenders
    if (handValueM == 15 && dealerCard == 10) { correctAnswer = "su"; }
    else if (handValueM == 16 && (dealerCard == 9 || dealerCard == 10 || dealerCard == 1)) { correctAnswer = "su"; }
    // High dealer double downs
    else if (handValueM == 11 && dealerCard == 10) { correctAnswer = "d"; }
    else if ((handValueM == 10 || handValueM == 11) && (dealerCard >= 7 && dealerCard <= 9)) { correctAnswer = "d"; }
    // High dealer hits
    else if (dealerCard > 6 || dealerCard == 1) { correctAnswer = "h"; }
    // Low dealer hits
    else if (dealerCard == 2 && (handValueM == 9 || handValueM == 12)) { correctAnswer = "h"; }
    else if (dealerCard == 3 && handValueM == 12) { correctAnswer = "h"; }
    // Stands
    else if (handValueM >= 12) { correctAnswer = "s"; }
    // Double downs
    else { correctAnswer = "d"; }
  }

  if(correctAnswer == move){
    console.log("Good move!".green);
    stratWins += 1;
    decisions += 1;
  } else {
    console.log("Bad move! ".red + "Should have choosen " + correctAnswer);
    decisions += 1;
  }
  console.log("*****".cyan)

  // Runs move with the pre-move hand value, to help with execution
  runMove(move, handValueM);
}

// Run move
function runMove(move, handValue){
  if(move == "h") {
    let newCard = deck.pop();
    myCards.push(newCard);
    console.log("You receive a " + newCard.view.blue);
    if(newCard.value + handValue > 21){
      console.log("Busted!".red);
      playAgain();
    } else {
      let cardString = "Your cards: ";
      for (let i = 0; i < myCards.length; i++){
        cardString += " ";
        cardString += myCards[i].view.blue;
      }
      console.log("Dealer cards: " + "* ".blue + dealerCards[1].view.blue);
      console.log(cardString);
      prompt.get(moveSchema, function (err, result){
        analyzeAndRunMove(result.move);
      });
    }
  }
  // Double down doubles the bet and hits
  else if (move == "d" || move == "ds") {
    bet *= 2;
    cash -= 10;
    let newCard = deck.pop();
    myCards.push(newCard);
    console.log("You receive a " + newCard.view);

    if(newCard.value + handValue > 21){
      console.log("Busted!".red);
      playAgain();
    } else { checkWinner(); }
  }
  // Can't do splits yet
  else if (move == "p") {
    console.log("Can't split yet");
    cash += 10;
    playAgain();
  } else if (move == "su") {
    cash += 5;
    playAgain();
  } else {
    checkWinner();
  }
}

// Function to check winner
function checkWinner(){
  // Variables for checking winner
  let dealer = dealerMove();
  let handValueD = dealer[0];
  let cardStringD = dealer[1];
  let handValueM = 0;
  let aceHandM = false;
  let cardStringM = "Your cards: ";

  // Loop through my cards to set variables, then deal with the aces
  for (let i = 0; i < myCards.length; i++){
    handValueM += myCards[i].value;
    cardStringM += " " + myCards[i].view.blue;
    if (myCards[i].value == 1) { aceHandM = true; }
  }
  if (aceHandM && handValueM + 10 <= 21) { handValueM = handValueM + 10; }

  // Read Cards
  console.log(cardStringD);
  console.log(cardStringM);

  //Evaluate
  if (handValueD > 21) {
    console.log("Dealer Busts!".green);
    cash += bet * 2;
  } else if (handValueM > handValueD){
    console.log("You won!".green);
    cash += bet * 2;
  } else if (handValueM == handValueD) {
    console.log("Push");
    cash += bet;
  } else {
    console.log("You lost!".red);
  }

  playAgain();
}

//
function playAgain(){
  if(deck.length >= 10 && cash >= 10){
    console.log("*************************".cyan);
    console.log("You have $" + cash);
    console.log("Play again?");
    prompt.get(playAgainSchema, function (err, result) {
      if (result.playAgain == "y"){ newHand(deck); }
      else {
        console.log("*************************".cyan);
        console.log("Your good strat percentage is: " + Math.round((stratWins / decisions) * 100) + "%");
        console.log("You walked away with $" + cash);
      }
    });
  } else {
    console.log("*************************".cyan);
    console.log("Your good strat percentage is: " + Math.round((stratWins / decisions) * 100) + "%");
    console.log("You walked away with $" + cash);
  }
}

////////////////////////////////////////////////////////////////////////
console.log("*************************".cyan);
console.log("* ".cyan + "Welcome to Cast-Jack!" + " *".cyan);
console.log("*************************".cyan);

prompt.start();
prompt.get(numOfDecksSchema, function (err, result) {
  deck = shuffleCards(parseInt(result.numberOfDecks));
  newHand(deck);
})




