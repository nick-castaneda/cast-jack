'use strict'

var prompt = require('prompt');

////////////////////////////////////////////////////////////////////////
//                              Variables                             //
////////////////////////////////////////////////////////////////////////

var dealerCards = [];
var myCards = [];
var stratScore = 0;
// var cash = 0;
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

////////////////////////////////////////////////////////////////////////
//                              Gameflow                              //
////////////////////////////////////////////////////////////////////////

function newHand(deck){
  console.log("Dealing ...");
  dealerCards = [];
  myCards = [];
  myCards.push(deck.pop());
  dealerCards.push(deck.pop());
  myCards.push(deck.pop());
  dealerCards.push(deck.pop());
  console.log("Dealer cards: " + "* " + dealerCards[1].view);
  console.log("My cards: " + myCards[0].view + " " + myCards[1].view);

  prompt.get(moveSchema, function (err, result){
    evaluateMove(result.move);
  });
}

function evaluateMove(move){
  let aceHandM = false;
  let handValueM = 0;
  let pairHandM = (myCards[0].value == myCards[1].value);
  let dealerCard = dealerCards[1].value;
  let correctAnswer;

  for(let i = 0; i < myCards.length; i++){
    handValueM += myCards[i].value;
    if(myCards[i].value == 1){
      aceHandM = true;
    }
  }

  // Small hands
  if (handValueM == 2){ correctAnswer = "p" }
  // Large hands
  else if (handValueM > 18){ correctAnswer = "s" }
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
    console.log("Good move!");
    stratScore += 1;
  } else {
    console.log("Bad move! Should have choosen " + correctAnswer);
    stratScore -= 1;
  }

  playAgain();
}


// Function to calculate winner

function playAgain(){
  if(deck.length >= 10){
    console.log("Play again?")
    prompt.get(playAgainSchema, function (err, result) {
      if (result.playAgain == "y"){
        newHand(deck);
      } else {
        console.log("Your score is: " + stratScore);
      }
    });
  } else {
    console.log("Your score is: " + stratScore);
  }
}

////////////////////////////////////////////////////////////////////////

console.log("Welcome to blackjack!");
prompt.start();
prompt.get(numOfDecksSchema, function (err, result) {
  deck = shuffleCards(parseInt(result.numberOfDecks));
  newHand(deck);
})




