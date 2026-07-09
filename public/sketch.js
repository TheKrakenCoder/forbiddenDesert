var m_socket;
var m_initialized = false;
var m_mySocketId;
var m_messageP;

const m_classNames = ['Archeologist', 'Climber', 'Explorer', 'Meteorologist', 'Navigator', 'Water Carrier'];
const CLASS_NONE = -1, CLASS_ARCHEOLOGIST = 0, CLASS_CLIMBER = 1, CLASS_EXPLORER = 2, CLASS_METEOROLOGIST = 3, CLASS_NAVIGATOR = 4, CLASS_WATER = 5; CLASS_NUM_CLASSES = 6;
const m_tokenColors = ['orange', 'brown', 'green', 'grey', 'yellow', 'blue'];
const m_playerBackgroundColors = ['#FBBF77', '#765341', 'lightgreen', 'lightgrey', 'lightyellow', 'lightblue',];
const TILE_SPACING = 1.09375;

var m_classRadio;
var m_initButton, m_nameInputButton;
var m_initialPlayer, m_players = [], m_thisPlayer;  

let m_selectedPlayerToken = -1;
let m_selectedShipToken = -1;
let m_allButtons = [];

let m_tileSize = 160;
let m_tileSpacing = 175;
let m_cw = 110;
let m_ch = 150;
let m_bw = 60;
let m_bh = 60;
let m_tokenSize = 40;
let m_tokenShipSize = 50;
let m_meterW = 110;
let m_meterH = 360;
let m_s = 1.0;
let m_numSandLeft = 48;
let m_savedData, m_saveButton, m_loadButton, m_parseButton, m_restoreButton, m_jsonInput, m_hideSaveButton;

var m_debugSet=-1, m_debugDeck=-1;


// Each Set is an array of images of a particular type of card. They are the card fronts
const SET_CLASSES = 0, SET_TILES = 1, SET_STORM = 2, SET_GEAR = 3, SET_METER = 4, SET_NUM_SETS = 5;
// These will be actual Deck objects.  We want the player gears first so we can use the seatpos as
// an index into the decks.  We want the classe and the tiles next, becaue all of those decks
// are selectable
const DECK_P0_GEAR = 0, DECK_P1_GEAR = 1, DECK_P2_GEAR = 2, DECK_P3_GEAR = 3, DECK_CLASSES = 4, 
      DECK_TILES = 5, DECK_STORM = 6, DECK_STORM_DISCARD = 7, DECK_GEAR = 8, 
      DECK_GEAR_DISCARD = 9, DECK_GENERIC = 10, DECK_NUM_DECKS = 11;
// These are indexes into the array of m_cardBackImages[]
const BACK_CLASSES = 0, BACK_TILES_NORMAL = 1, BACK_TILES_WATER = 2, BACK_TILES_CRASH = 3, BACK_TILES_SPIRAL = 4, 
      BACK_STORM = 5, BACK_GEAR = 6;
      // BACK_METER = 6;  the meter will just be draw as 1 of 2 images, we don't need a card or deck for it
const NUM_SHIP_TOKENS = 4;
let m_setImages = [];      // each elements is an array of images
let m_cardBackImages = []; // a 1-D array of card back images
let m_decks = [];
let m_shipTokens = [];
let m_shipTokenImages = [];
let m_shipImage;
let m_tableBackgroundImage;
let m_stormMeterImages = [];
let m_stormMeterValue = 0; // 768;
let m_stormMeterDelta = 16.6667;

function preload() {
  m_tableBackgroundImage = loadImage('Assets/TableBackground.jpg');

   ///////////////////////////////////////////
  // The card sets
  ///////////////////////////////////////////
  for (let i = 0; i < SET_NUM_SETS; i++) m_setImages[i] = [];

  // classes/adventurers
  for (let i = 0; i < 6; i++) m_setImages[SET_CLASSES].push(loadImage('Assets/Classes'        + i + '.jpg'));

  // tiles
  for (let i = 0; i < 24; i++) m_setImages[SET_TILES].push(loadImage('Assets/Tile'        + i + '.jpg'));
  m_setImages[SET_TILES].push(loadImage('Assets/TileStormSpiral.jpg'));

  // gear
  for (let i = 0; i < 6; i++) m_setImages[SET_GEAR].push(loadImage('Assets/Gear'        + i + '.jpg'));

  // storm
  for (let i = 0; i < 14; i++) m_setImages[SET_STORM].push(loadImage('Assets/Sand'        + i + '.jpg'));

  // Card Backgrounds
  m_cardBackImages[BACK_CLASSES]      = loadImage('Assets/classCardBackground.jpg');
  m_cardBackImages[BACK_TILES_NORMAL] = loadImage('Assets/backTilesNormal.jpg');
  m_cardBackImages[BACK_TILES_WATER]  = loadImage('Assets/backTilesWater.jpg');
  m_cardBackImages[BACK_TILES_CRASH]  = loadImage('Assets/backTilesCrash.jpg');
  m_cardBackImages[BACK_TILES_SPIRAL] = loadImage('Assets/TileStormSpiral.jpg');
  m_cardBackImages[BACK_STORM]        = loadImage('Assets/backSand.jpg');
  m_cardBackImages[BACK_GEAR]         = loadImage('Assets/backGear.jpg');

  // ship and ship tokens
  for (let i = 0; i < NUM_SHIP_TOKENS; i++) m_shipTokenImages.push(loadImage('Assets/Ship'        + i + '.png'));
  m_shipImage = loadImage('Assets/Ship.png');

  // storm meters
  m_stormMeterImages.push(loadImage('Assets/StormMeter_2-3.jpg'));
  m_stormMeterImages.push(loadImage('Assets/StormMeter_4-5.jpg'));
}

function setup() {
  createCanvas(1600, 900);
  /////////////////////////////////////////////
  // Create Decks and Cards
  /////////////////////////////////////////////

  // the adventurer deck
  m_decks[DECK_P0_GEAR] = new Deck(DECK_P0_GEAR, SET_GEAR, BACK_CLASSES, m_cw, m_ch);
  m_decks[DECK_P1_GEAR] = new Deck(DECK_P1_GEAR, SET_GEAR, BACK_CLASSES, m_cw, m_ch);
  m_decks[DECK_P2_GEAR] = new Deck(DECK_P2_GEAR, SET_GEAR, BACK_CLASSES, m_cw, m_ch);
  m_decks[DECK_P3_GEAR] = new Deck(DECK_P3_GEAR, SET_GEAR, BACK_CLASSES, m_cw, m_ch);
  m_decks[DECK_CLASSES] = new Deck(DECK_CLASSES, SET_CLASSES, BACK_CLASSES, m_cw, m_ch);
  for (let i = 0; i < 6; i++) {
    let card = new Card(SET_CLASSES, i, BACK_CLASSES, -1);
    card.facedown = false;
    card.x = -1000; card.y = -1000;  // move cards offscreen so they can't be hovered
    m_decks[DECK_CLASSES].addCard(card);
  }

  // tiles
  m_decks[DECK_TILES] = new Deck(DECK_TILES, SET_TILES, BACK_CLASSES, m_tileSize, m_tileSize);
  m_decks[DECK_TILES].addCard(new Card(SET_TILES, 0, BACK_TILES_CRASH, -1));
  for (let i = 1; i <= 3; i++) m_decks[DECK_TILES].addCard(new Card(SET_TILES, i, BACK_TILES_WATER, -1));
  for (let i = 4; i <= 23; i++) m_decks[DECK_TILES].addCard(new Card(SET_TILES, i, BACK_TILES_NORMAL, -1));
  m_decks[DECK_TILES].shuffle();
  m_decks[DECK_TILES].addCard(new Card(SET_TILES, 24, BACK_TILES_SPIRAL, -1));
  let temp = m_decks[DECK_TILES].cards[12];
  m_decks[DECK_TILES].cards[12] = m_decks[DECK_TILES].cards[24];
  m_decks[DECK_TILES].cards[24] = temp;
  // let spiral = new Card(SET_TILES, 24, BACK_TILES_SPIRAL, -1);
  // spiral.deckIndex = DECK_TILES;
  // m_decks[DECK_TILES].cards.splice(12, 0, spiral);

  // storm
  m_decks[DECK_STORM] = new Deck(DECK_STORM, SET_STORM, BACK_STORM, m_cw, m_ch);
  m_decks[DECK_STORM_DISCARD] = new Deck(DECK_STORM_DISCARD, SET_STORM, BACK_STORM, m_cw, m_ch);
  for (let i = 0; i < 3; i++) m_decks[DECK_STORM].addCard(new Card(SET_STORM, 0, BACK_STORM, -1));
  for (let i = 0; i < 3; i++) m_decks[DECK_STORM].addCard(new Card(SET_STORM, 1, BACK_STORM, -1));
  for (let i = 0; i < 3; i++) m_decks[DECK_STORM].addCard(new Card(SET_STORM, 2, BACK_STORM, -1));
  for (let i = 0; i < 3; i++) m_decks[DECK_STORM].addCard(new Card(SET_STORM, 3, BACK_STORM, -1));
  for (let i = 0; i < 2; i++) m_decks[DECK_STORM].addCard(new Card(SET_STORM, 4, BACK_STORM, -1));
  for (let i = 0; i < 2; i++) m_decks[DECK_STORM].addCard(new Card(SET_STORM, 5, BACK_STORM, -1));
  for (let i = 0; i < 2; i++) m_decks[DECK_STORM].addCard(new Card(SET_STORM, 6, BACK_STORM, -1));
  for (let i = 0; i < 2; i++) m_decks[DECK_STORM].addCard(new Card(SET_STORM, 7, BACK_STORM, -1));
  for (let i = 0; i < 1; i++) m_decks[DECK_STORM].addCard(new Card(SET_STORM, 8, BACK_STORM, -1));
  for (let i = 0; i < 1; i++) m_decks[DECK_STORM].addCard(new Card(SET_STORM, 9, BACK_STORM, -1));
  for (let i = 0; i < 1; i++) m_decks[DECK_STORM].addCard(new Card(SET_STORM, 10, BACK_STORM, -1));
  for (let i = 0; i < 1; i++) m_decks[DECK_STORM].addCard(new Card(SET_STORM, 11, BACK_STORM, -1));
  for (let i = 0; i < 4; i++) m_decks[DECK_STORM].addCard(new Card(SET_STORM, 12, BACK_STORM, -1));
  for (let i = 0; i < 3; i++) m_decks[DECK_STORM].addCard(new Card(SET_STORM, 13, BACK_STORM, -1));
  m_decks[DECK_STORM].shuffle();

  // gear
  m_decks[DECK_GEAR] = new Deck(DECK_GEAR, SET_GEAR, BACK_GEAR, m_cw, m_ch);
  m_decks[DECK_GEAR_DISCARD] = new Deck(DECK_GEAR_DISCARD, SET_GEAR, BACK_GEAR, m_cw, m_ch);
  for (let i = 0; i < 3; i++) m_decks[DECK_GEAR].addCard(new Card(SET_GEAR, 0, BACK_GEAR, -1));
  for (let i = 0; i < 3; i++) m_decks[DECK_GEAR].addCard(new Card(SET_GEAR, 1, BACK_GEAR, -1));
  for (let i = 0; i < 2; i++) m_decks[DECK_GEAR].addCard(new Card(SET_GEAR, 2, BACK_GEAR, -1));
  for (let i = 0; i < 2; i++) m_decks[DECK_GEAR].addCard(new Card(SET_GEAR, 3, BACK_GEAR, -1));
  for (let i = 0; i < 1; i++) m_decks[DECK_GEAR].addCard(new Card(SET_GEAR, 4, BACK_GEAR, -1));
  for (let i = 0; i < 1; i++) m_decks[DECK_GEAR].addCard(new Card(SET_GEAR, 5, BACK_GEAR, -1));
  m_decks[DECK_GEAR].shuffle();

  // generic deck (currenly only used for meteorologist action)
  m_decks[DECK_GENERIC] = new Deck(DECK_GENERIC, SET_STORM, BACK_STORM, m_cw, m_ch);

  // ship tokens
  for (let i = 0; i < NUM_SHIP_TOKENS; i++) {
    m_shipTokens[i] = new TokenShip(10 + 60*i, 10, i)
  }

  /////////////////////////////////////////////
  // Network communication
  /////////////////////////////////////////////
  
  // socket
  try {
    m_socket = io();
    console.log('m_socket = ' , m_socket);
  } catch (err) {
    console.log('io exception ', err);
    m_socket = null;
  }  

  // For Standalone play, we don't need a socket connection and we don't even have a server running.
  if (m_socket) {

    // initPlayer message //
    // After the sketch sends the 'start' message, by pressing the Init button, the server responds with the 'initPlayer' message.
    // By the time this gets called, we should have our m_socket.id and this m_players[0].socketId
    // data: a single Player, and it should be ourselves
    m_socket.on('initPlayer', function(data) {
      console.log('initPlayer message: We got ' , data);
      // Only the player who sent the start message to the server wants to process the initPlayer message
      if (m_mySocketId === data.socketId) {
        console.log('initPlayer message: found player');
        m_initialPlayer.copyFromServerData(data);
        m_players.push(m_initialPlayer);
        m_initialized = true;
        m_initButton.hide();
        m_nameInputButton.hide();
        m_classRadio.hide();
      } else {
        console.log('initPlayer message: This message intended for another player');
      }

    });

    // heartbeat message //
    // data: object containing a Player array and a Table
    m_socket.on('heartbeat', function(data) {
      // if (!m_initialPlayer) return;
      // console.log('heartbeat message: We got ' , data);
      // createPlayersFromServerData(data.players);
      // createDecksFromServerData(data.decks);
      // createShipTokensFromServerData(data.shipTokens);
      // m_numSandLeft = data.numSandLeft;
      restoreData(data);
      // createCardArraysFromServerData(data.cardArrays);
      // setMessageFromServerData(data.message);

      // // Note I wasn't able to pass in m_discards into the function here and fill it in 
      // // using the function argument.  I had to directly specify m_discards in the function.
      // // This is probably because I keep changing what m_discards is.
      // // createCardArrayFromServerData(data.discards, m_discards);
    });
  }

  //////////////////////////////////////////////
  // GUI stuff
  //////////////////////////////////////////////
  m_messageP = createDiv('Message here');

  /////////////////////////////////////
  // Initialization buttons - all temporary

  // Init Button
  m_initButton = createButton('Init: Enter Name');
  m_initButton.mousePressed(initPlayerToServer);
  m_nameInputButton = createInput();
  // m_nameInputButton.changed(initPlayerToServer);

  /////////////////////////////////////////////
  // Radio Buttons for class
  m_classRadio = createRadio();
  for (let i = 0; i < m_classNames.length; i++) {
    m_classRadio.option(i, m_classNames[i]);

  }
  // Set default
  m_classRadio.selected('0');
  // Style: Make options align horizontally
  // Select all input elements within the radio
  let opts = selectAll('input', m_classRadio);
  for (let i = 0; i < opts.length; i++) {
    opts[i].style('margin', '10px'); // Spacing between buttons
  }

  ///////////////////////////////////////////////
  // Controls on Canvas
  let buttonFlip = createNormalButton2("Flip Tile", 35*m_s + m_meterW, 480, m_bw, m_bh);
  buttonFlip.mousePressed(flipCards);

  // let bsat = createNormalButton2("Sel all tiles", 35*m_s + m_meterW + m_bw, 480, m_bw, m_bh);
  // bsat.mousePressed(function(){
  //   console.log('bsat');
  //     for (let tile of m_decks[DECK_TILES].cards) tile.selected = true;
  //   });
  let buttonRemoveGear = createNormalButton2("Play Gear", 35*m_s + m_meterW + m_bw, 480, m_bw, m_bh);
  buttonRemoveGear.mousePressed(removeGear);


  let buttonAddSand = createNormalButton2("Add Sand", 35*m_s + m_meterW, 480+1*m_bh, m_bw, m_bh);
  buttonAddSand.mousePressed(addSand);
  let buttonDelSan = createNormalButton2("Clear Sand", 35*m_s + m_meterW + m_bw, 480+1*m_bh, m_bw, m_bh);
  buttonDelSan.mousePressed(deleteSand);

  let buttonMoveUp = createNormalButton2("Move 🢁", 35*m_s + m_meterW, 480+2*m_bh, m_bw, m_bh);
  buttonMoveUp.mousePressed(moveUp);
  let buttonMoveDown = createNormalButton2("Move 🢃", 35*m_s + m_meterW + m_bw, 480+2*m_bh, m_bw, m_bh);
  buttonMoveDown.mousePressed(moveDown);
  let buttonMoveLeft = createNormalButton2("Move 🢀", 35*m_s + m_meterW, 480+3*m_bh, m_bw, m_bh);
  buttonMoveLeft.mousePressed(moveLeft);
  let buttonMoveRight = createNormalButton2("Move 🢂", 35*m_s + m_meterW + m_bw, 480+3*m_bh, m_bw, m_bh);
  buttonMoveRight.mousePressed(moveRight);

  // buttons specific to the meterologist
  let buttonMeteorStormPlay = createNormalButton2("(M)Play Storm", 35*m_s + m_meterW, 480+5*m_bh, m_bw, m_bh);
  buttonMeteorStormPlay.mousePressed(() => {
    let card = m_decks[DECK_STORM].dealCard();
    if (card) {
      card.facedown=false;
      m_decks[DECK_GENERIC].addCard(card);
    }
  });
  let buttonMeteorStormTop = createNormalButton2("(M)Top Storm", 35*m_s + m_meterW + m_bw, 480+5*m_bh, m_bw, m_bh);
  buttonMeteorStormTop.mousePressed(() => {
    let card = m_decks[DECK_GENERIC].dealCard();
    if (card) {
      card.facedown=true;
      m_decks[DECK_STORM].addCard(card);
    }
  });
  let buttonMeteorStormBottom = createNormalButton2("(M)Bot Storm", 35*m_s + m_meterW, 480+6*m_bh, m_bw, m_bh);
  buttonMeteorStormBottom.mousePressed(() => {
    let card = m_decks[DECK_GENERIC].dealCard();
    if (card) {
      card.facedown=true;
      m_decks[DECK_STORM].cards.unshift(card);
    }
  });

  // player buttons
  for (let i = 0; i < 4; i++) {
    let buttonIncreaseWater = createNormalButton2("W🔼", width-2.5*m_cw, i*height/5, m_bw, m_bh/2);
    buttonIncreaseWater.mousePressed(() => {
      changeWater(i, -5);  // move up the page
    });
    let buttonDecreaseWater = createNormalButton2("W🔽", width-2.5*m_cw+m_bw, i*height/5, m_bw, m_bh/2);
    buttonDecreaseWater.mousePressed(() => {
      changeWater(i, 5);   // move down the page
    });
    let buttonGetGear = createNormalButton2("Gear", width-2.5*m_cw+2*m_bw, i*height/5, m_bw, m_bh/2);
    buttonGetGear.mousePressed(() => {
      getGear(i);
    });
    let buttonTakeGear = createNormalButton2("Take", width-2.5*m_cw+3*m_bw, i*height/5, m_bw, m_bh/2);
    buttonTakeGear.mousePressed(() => {
      takeGearFromPlayer(i);
    });
  }

  // storm deck buttons
  let buttonStormDeal = createNormalButton2("Deal", 10*m_s, 20*m_s + m_ch + m_bh, m_cw, 25*m_s);
  buttonStormDeal.mousePressed(() => {
    if (m_decks[DECK_STORM].cards.length <= 0) return;
    let card = m_decks[DECK_STORM].dealCard();
    card.facedown = false;
    m_decks[DECK_STORM_DISCARD].addCard(card);
    update();
  });
  let buttonStormShuffle = createNormalButton2("Shuffle", 35*m_s + m_cw, 20*m_s + m_ch + m_bh, m_cw, 25*m_s);
  buttonStormShuffle.mousePressed(() => {
    while (m_decks[DECK_STORM_DISCARD].cards.length > 0) {
      let card = m_decks[DECK_STORM_DISCARD].dealCard();
      card.facedown = true;
      m_decks[DECK_STORM].addCard(card);
    }
    m_decks[DECK_STORM].shuffle();
    update();
  });

  // storm meter buttons
  let buttonStormIncrease = createNormalButton2("Inc", 10*m_s, 480+m_meterH+5, m_meterW/2, 25*m_s);
  let buttonStormDecrease = createNormalButton2("Dec", 10*m_s+m_meterW/2, 480+m_meterH+5, m_meterW/2, 25*m_s);
  buttonStormIncrease.mousePressed(() => {
    if (m_stormMeterValue < 14) {
      m_stormMeterValue += 1;
      update();
    }
  });
  buttonStormDecrease.mousePressed(() => {
    if (m_stormMeterValue > 0) {
      m_stormMeterValue -= 1;
      update();
    }
  });

    // Buttons dealing with save and restore.  These are normally hidden.  They are below the canvas.
  m_saveButton = createButton("1 Save");
  m_saveButton.mousePressed(() => saveGame());
  m_loadButton = createButton("2a Read");
  m_loadButton.mousePressed(() => readSavedGame());
  m_parseButton = createButton("2b Parse");
  m_parseButton.mousePressed(() => parseSavedGame());
  m_restoreButton = createButton("3 Load");
  m_restoreButton.mousePressed(() => restoreSavedGame());
  createDiv();
  m_jsonInput = createInput("The number of players in the saved game must match the number of players currently in the game.");
  m_jsonInput.style('width',  '900px');
  m_jsonInput.style('height', '25px');

  m_hideSaveButton = createButton('Hide');
  m_hideSaveButton.mousePressed(function(){
      m_saveButton.hide(); m_loadButton.hide(); m_parseButton.hide(); m_restoreButton.hide(); m_jsonInput.hide(); m_hideSaveButton.hide();
    });
  m_saveButton.hide(); m_loadButton.hide(); m_parseButton.hide(); m_restoreButton.hide(); m_jsonInput.hide(); m_hideSaveButton.hide();


}  // setup

////////////////////////////////////////////////////////////
// SAVE and RESTORE functions

// called from heartbeat and from restoreSavedGame
function restoreData(data, isSavedGame = false) {
  if (!m_initialPlayer) return;
  console.log('heartbeat message: We got ' , data);
  createPlayersFromServerData(data.players, isSavedGame);
  createDecksFromServerData(data.decks);
  createShipTokensFromServerData(data.shipTokens);
  m_numSandLeft = data.numSandLeft;
  m_stormMeterValue = data.stormMeterValue;
}

function saveGame() {
  update(true);
}

function readSavedGame() {
  m_savedData = loadJSON('forbiddenDesert.json');
}
function parseSavedGame() {
  m_savedData = JSON.parse(m_jsonInput.value());
}
function restoreSavedGame() {
  console.log('m_savedData = ' , m_savedData);
  console.log('m_savedData.players = ' , m_savedData.players);
  
  restoreData(m_savedData, true);
  update();
}
function showSaveButtons() {
  m_saveButton.show(); m_loadButton.show(); m_parseButton.show(); m_restoreButton.show(); m_jsonInput.show(); m_hideSaveButton.show();
}


////////////////////////////////////////////
// GUI FUNCTIONS
////////////////////////////////////////////

function removeGear() {
  let needUpdate = false;
  let cards = findSelectedCards();
  for (let card of cards) {
    if (card.setIndex == SET_GEAR) {
      let idx = m_decks[card.deckIndex].cards.indexOf(card);
      if (idx != -1) {
        let rets = m_decks[card.deckIndex].cards.splice(idx, 1);
        rets[0].selected = false;
        m_decks[DECK_GEAR_DISCARD].addCard(rets[0]);
        needUpdate = true;
      }
    }
  }
  if (needUpdate) update();
}

function getGear(playerNum) {
  if (m_decks[DECK_GEAR].cards.length <= 0) return;
  if (playerNum >= m_players.length) return;

  let card = m_decks[DECK_GEAR].dealCard();
  // m_players[playerNum].gearCards.push(card);
  m_decks[playerNum].addCard(card);
  update();
}

function takeGearFromPlayer(playerNum) {
  let needUpdate = false;
  let cards = findSelectedCards();
  for (let card of cards) {
    if (card.setIndex == SET_GEAR) {
      let idx = m_decks[card.deckIndex].cards.indexOf(card);
      if (idx != -1) {
        let rets = m_decks[card.deckIndex].cards.splice(idx, 1);
        rets[0].selected = false;
        m_decks[playerNum].addCard(rets[0]);
        needUpdate = true;
      }
    }
  }
  if (needUpdate) update();
}

function changeWater(playerNum, value) {
  if (playerNum >= m_players.length) return;

  if (value > 0 && m_players[playerNum].waterValue < m_ch-15*m_s) m_players[playerNum].waterValue += value;
  else if (value < 0 && m_players[playerNum].waterValue > 15*m_s) m_players[playerNum].waterValue += value;

  update();
}

function createNormalButton2(name, x, y, w, h) {
  let button = createButton(name);
    button.style('width',  w+'px');
    button.style('height', h+'px');
    button.position(x, y);
    button.style('font-size', '16px');
    button.style('background-color', "#F0F0F0")
    m_allButtons.push(new Button(button, x, y, w, h));
    return button;
}  // createNormalButton()

// returns an array of all selected cards
function findSelectedCards() {
  let cards = [];
  for (let d = 0; d < m_decks.length; d++) {
    for (let c = 0; c < m_decks[d].cards.length; c++) {
      let card = m_decks[d].cards[c];
      // if (m_decks[d].cards[c].selected) {
      if (card.selected) {
        cards.push(card);
      }
    }
  }
  return cards;
}

// Unselect all cards and return boolean if any cards were selected
function unselectAllCards() {
  let foundSelectedCard = false;
  for (let d = 0; d < m_decks.length; d++) {
    for (let c = 0; c < m_decks[d].cards.length; c++) {
      if (m_decks[d].cards[c].selected) {
        m_decks[d].cards[c].selected=false;
        foundSelectedCard = true;
      }
    }
  }
  return foundSelectedCard;
}

function flipCards() {
  let cards = findSelectedCards();
  console.log('cards = ' , cards);
  
  for (let i = 0; i < cards.length; i++) {
    cards[i].facedown = !cards[i].facedown;
  }

  if (cards.length > 0) update();
}

function addSand() {
  let cards = findSelectedCards();
  console.log('cards = ' , cards);
  
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].setIndex == SET_TILES) {
      cards[i].numSand++;
      m_numSandLeft--;
    }
  }

  if (cards.length > 0) update();
}

function deleteSand() {
  let cards = findSelectedCards();
  console.log('cards = ' , cards);
  
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].numSand > 0) {
      cards[i].numSand--;
      m_numSandLeft++;
    }
  }

  if (cards.length > 0) update();
}

// returns index into m_decks[DECK_TILES]
function findStormSpiralIndex() {
  for (let i = 0; i < m_decks[DECK_TILES].cards.length; i++) {
    if (m_decks[DECK_TILES].cards[i].index == 24) return i;
  }
  return -1;

}

function moveTokensWithTile(tileIndex, xdelta, ydelta) {
  let tokensToMove = [];
  let tile = m_decks[DECK_TILES].cards[tileIndex];
  let tileW = m_decks[DECK_TILES].cw;
  let tileH = m_decks[DECK_TILES].ch;
  for (let token of m_shipTokens) {
    if (token.x >= tile.x && token.x <= tile.x+tileW && token.y >= tile.y && token.y <= tile.y+tileH){
      tokensToMove.push(token);
    }
  }
  for (let player of m_players) {
    let token = player.token;
    if (token.x >= tile.x && token.x <= tile.x+tileW && token.y >= tile.y && token.y <= tile.y+tileH){
      tokensToMove.push(token);
    }
  }

  for (let token of tokensToMove) {
    token.x += xdelta;
    token.y += ydelta;
  }
}

// This function now does a lot of what moveBase does.  This function was added afterwards
// to allow multiple cards to be moved at once.  I did not want to rewrite the existing code.
function calculateDistanceFromSpiral(cards) {
  let spiralIndex = findStormSpiralIndex();
  let ixSpiral = spiralIndex % 5;
  let iySpiral = floor(spiralIndex / 5);
  for (let card of cards) {
     let deck = m_decks[card.deckIndex];
     let indexInDeck = deck.findIndexInDeck(card);
     let ix = indexInDeck % 5;
     let iy = floor(indexInDeck / 5);
     card.distanceFromSpiral = abs(ixSpiral-ix) + abs(iySpiral-iy);
  }
}

function moveBase(card) {
  let indexInDeck, ix, iy, spiralIndex, ixSpiral, iySpiral;

  let cards = [card];
  // let cards = findSelectedCards();
  // if (cards.length != 1) {
  //   m_messageP.html('You can only move exactly one card');
  //   return [-1];
  // }
  let deck = m_decks[cards[0].deckIndex];
  if (deck.deckIndex != DECK_TILES) {
    m_messageP.html('You can only move a tile');
    return [-1];
  }
  indexInDeck = deck.findIndexInDeck(cards[0]);
  ix = indexInDeck % 5;
  iy = floor(indexInDeck / 5);
  // console.log('ix, iy = ' , ix, iy);

  spiralIndex = findStormSpiralIndex();
  ixSpiral = spiralIndex % 5;
  iySpiral = floor(spiralIndex / 5);
  // console.log('ixs, iys = ' , ixSpiral, iySpiral);

  // unselectAllCards();

  return [0, indexInDeck, ix, iy, spiralIndex, ixSpiral, iySpiral];

}

function moveUp() {
  let cards = findSelectedCards();
  calculateDistanceFromSpiral(cards);
  cards.sort((a, b) => {return a.distanceFromSpiral - b.distanceFromSpiral});
  console.log(cards)

  for (let i = 0; i < cards.length; i++) {
    let [error, indexInDeck, ix, iy, spiralIndex, ixSpiral, iySpiral] = moveBase(cards[i]);
    if (error == -1) {
      console.log('error in moveBase()');
      unselectAllCards();
      update();
      return;
    }

    // move up
    if (iy > 0 && iySpiral == (iy-1) && ix == ixSpiral) {
      let temp = m_decks[DECK_TILES].cards[indexInDeck];
      m_decks[DECK_TILES].cards[indexInDeck] = m_decks[DECK_TILES].cards[spiralIndex];
      m_decks[DECK_TILES].cards[spiralIndex] = temp;
      m_decks[DECK_TILES].cards[spiralIndex].numSand++;  // automatically increase the sand on the moved tile
    } else {
      m_messageP.html('Storm spiral must be directly above the selected card');
    }
    // moveTokensWithTile(indexInDeck, 0, -m_decks[DECK_TILES].ch*1.09375);
    moveTokensWithTile(spiralIndex, 0, -m_decks[DECK_TILES].ch*TILE_SPACING);

    cards[i].selected = false;  
  }

  unselectAllCards();

  update();
  
}


function moveDown() {
  let cards = findSelectedCards();
  calculateDistanceFromSpiral(cards);
  cards.sort((a, b) => {return a.distanceFromSpiral - b.distanceFromSpiral});

  for (let i = 0; i < cards.length; i++) {
    let [error, indexInDeck, ix, iy, spiralIndex, ixSpiral, iySpiral] = moveBase(cards[i]);
    if (error == -1) {
      console.log('error in moveBase()');
      unselectAllCards();
      update();
      return;
    }

    // move up
    if (iy < 5 && iySpiral == (iy+1) && ix == ixSpiral) {
      let temp = m_decks[DECK_TILES].cards[indexInDeck];
      m_decks[DECK_TILES].cards[indexInDeck] = m_decks[DECK_TILES].cards[spiralIndex];
      m_decks[DECK_TILES].cards[spiralIndex] = temp;
      m_decks[DECK_TILES].cards[spiralIndex].numSand++;  // automatically increase the sand on the moved tile
    } else {
      m_messageP.html('Storm spiral must be directly below the selected card');
    }
    moveTokensWithTile(spiralIndex, 0, m_decks[DECK_TILES].ch*TILE_SPACING);
    cards[i].selected = false;  
  }
  unselectAllCards();

  update();
  
}
function moveLeft() {
  let cards = findSelectedCards();
  calculateDistanceFromSpiral(cards);
  cards.sort((a, b) => {return a.distanceFromSpiral - b.distanceFromSpiral});

  for (let i = 0; i < cards.length; i++) {
    let [error, indexInDeck, ix, iy, spiralIndex, ixSpiral, iySpiral] = moveBase(cards[i]);
    if (error == -1) {
      console.log('error in moveBase()');
      unselectAllCards();
      update();
      return;
    }

    // move left
    if (ix > 0 && ixSpiral == (ix-1) && iy == iySpiral) {
      let temp = m_decks[DECK_TILES].cards[indexInDeck];
      m_decks[DECK_TILES].cards[indexInDeck] = m_decks[DECK_TILES].cards[spiralIndex];
      m_decks[DECK_TILES].cards[spiralIndex] = temp;
      m_decks[DECK_TILES].cards[spiralIndex].numSand++;  // automatically increase the sand on the moved tile
    } else {
      m_messageP.html('Storm spiral must be directly left of the selected card');
    }
    moveTokensWithTile(spiralIndex, -m_decks[DECK_TILES].ch*TILE_SPACING, 0);
    cards[i].selected = false;  
  }
  unselectAllCards();

  update();
  
}
function moveRight() {
  let cards = findSelectedCards();
  calculateDistanceFromSpiral(cards);
  cards.sort((a, b) => {return a.distanceFromSpiral - b.distanceFromSpiral});

  for (let i = 0; i < cards.length; i++) {
    let [error, indexInDeck, ix, iy, spiralIndex, ixSpiral, iySpiral] = moveBase(cards[i]);
    if (error == -1) {
      console.log('error in moveBase()');
      unselectAllCards();
      update();
      return;
    }

    // move right
    if (ix < 5 && ixSpiral == (ix+1) && iy == iySpiral) {
      let temp = m_decks[DECK_TILES].cards[indexInDeck];
      m_decks[DECK_TILES].cards[indexInDeck] = m_decks[DECK_TILES].cards[spiralIndex];
      m_decks[DECK_TILES].cards[spiralIndex] = temp;
      m_decks[DECK_TILES].cards[spiralIndex].numSand++;  // automatically increase the sand on the moved tile
    } else {
      m_messageP.html('Storm spiral must be directly right of the selected card');
    }
    moveTokensWithTile(spiralIndex, m_decks[DECK_TILES].ch*TILE_SPACING, 0);
    cards[i].selected = false;  
  }
  unselectAllCards();

  update();
  
}

// function moveBaseOrig() {
//   let indexInDeck, ix, iy, spiralIndex, ixSpiral, iySpiral;

//   let cards = findSelectedCards();
//   if (cards.length != 1) {
//     m_messageP.html('You can only move exactly one card');
//     return [-1];
//   }
//   let deck = m_decks[cards[0].deckIndex];
//   if (deck.deckIndex != DECK_TILES) {
//     m_messageP.html('You can only move a tile');
//     return [-1];
//   }
//   indexInDeck = deck.findIndexInDeck(cards[0]);
//   ix = indexInDeck % 5;
//   iy = floor(indexInDeck / 5);
//   console.log('ix, iy = ' , ix, iy);

//   spiralIndex = findStormSpiralIndex();
//   ixSpiral = spiralIndex % 5;
//   iySpiral = floor(spiralIndex / 5);
//   console.log('ixs, iys = ' , ixSpiral, iySpiral);

//   // unselectAllCards();

//   return [0, indexInDeck, ix, iy, spiralIndex, ixSpiral, iySpiral];

// }

// function moveUpOrig() {
//   let [error, indexInDeck, ix, iy, spiralIndex, ixSpiral, iySpiral] = moveBase();
//   if (error == -1) {
//     console.log('error in moveBase()');
//     unselectAllCards();
//     update();
//     return;
//   }

//   // move up
//   if (iy > 0 && iySpiral == (iy-1) && ix == ixSpiral) {
//     let temp = m_decks[DECK_TILES].cards[indexInDeck];
//     m_decks[DECK_TILES].cards[indexInDeck] = m_decks[DECK_TILES].cards[spiralIndex];
//     m_decks[DECK_TILES].cards[spiralIndex] = temp;
//     m_decks[DECK_TILES].cards[spiralIndex].numSand++;  // automatically increase the sand on the moved tile
//   } else {
//     m_messageP.html('Storm spiral must be directly above the selected card');
//   }
//   // moveTokensWithTile(indexInDeck, 0, -m_decks[DECK_TILES].ch*1.09375);
//   moveTokensWithTile(spiralIndex, 0, -m_decks[DECK_TILES].ch*TILE_SPACING);
//   unselectAllCards();

//   update();
  
// }


// returns the Card if one is found
function findCardUnderCursor() {

  let foundCard = null;
  let cw, ch;
  for (let d = 0; d < DECK_TILES; d++) {
    let deck = m_decks[d];
    cw = deck.cw;
    ch = deck.ch;
    for (let c = 0; c < deck.cards.length; c++) {
      let card = deck.cards[c];
      if (mouseX > card.x && mouseX < card.x + cw && mouseY > card.y && mouseY < card.y + ch) {
        foundCard = card;
      }
    }
  }
  return foundCard;

}

////////////////////////////////////////////
// NETWORK FUNCTIONS
////////////////////////////////////////////

// called when user presses the Init button
function initPlayerToServer() {
  if (m_nameInputButton.value().length <= 0) {
    // m_messageP.style('color', '#000000');
    m_messageP.html("Enter a real name, buddy");
    return;
  }

  ///////////////////////////////////////
  // For solo play there should be 4 numbers indicating which classes to play
  let name = m_nameInputButton.value();
  if (name.startsWith('STANDALONE')) {
    const result = name.slice('STANDALONE'.length);
    console.log('result = ' , result);
    let classes = result.trim().split(/\s+/);
    console.log('classes = ' , classes);
    
    if (classes.length < 1 || classes.length > 4) {
      m_messageP.html("You have to enter between 1 and 4 integers after the string STANDALONE");
      return;
    }
    for (let i = 0; i < classes.length; i++) {
      m_players[i] = new Player(i, 'Solo', classes[i]);
    }
    m_thisPlayer = m_players[0];
    m_initialized = true;
    if (m_socket) m_socket.close();

    m_initButton.hide();
    m_nameInputButton.hide();
    m_classRadio.hide();

    return;
  }

  ///////////////////////////////////////
  // Regular internet play
  console.log("INITPLAYER");
  m_initialPlayer = new Player(-1, m_nameInputButton.value(), m_classRadio.value());
  // m_initialPlayer.dealer = true;
  m_initialPlayer.socketId = '/#' + m_socket.id; 
  m_thisPlayer = m_initialPlayer;
  m_socket.emit('start', m_initialPlayer);
}  // initPlayerToServer()

// called when we get a heartbeat from the server
// data: array of Player objects
function createPlayersFromServerData(data, isSavedGame) {
  console.log('player data = ' , data);
  
  let playersTemp = [];
  // for (p of data) {
  for (let play = 0; play < data.length; play++) {
    let p = data[play];
    let player = new Player(p.seatPos, p.name, p.class);
    // console.log('heartbeat message: p.seatPos = ' + p.seatPos);
    // console.log('heartbeat message: p.cardY = ' + p.cardY);
    if (!isSavedGame) player.copyFromServerData(p, -1);
    else              player.copyFromServerData(p, play);
    playersTemp.push(player);
    // console.log('heartbeat message: player.socketId = ' + player.socketId);
    // console.log('heartbeat message: player.seatPos = ' + player.seatPos);
    // console.log('heartbeat message: player.cardY = ' + player.cardY);
  }
  // sort the array by seatPos, so advancing and changing dealer (next hand) work properlu
  // javascript sort converts to strings first, so returning a.seatPos - b.seatPos correctly sorts numbers
  // playersTemp.sort((a, b) => {return a.seatPos > b.seatPos});
  playersTemp.sort((a, b) => {return a.seatPos - b.seatPos});
  m_players = playersTemp;

}  // createPlayersFromServerData()

// data: array of Deck objects
function createDecksFromServerData(data) {
  console.log('deck data = ' , data);
  // this line prevents us from overwriting our decks when we first come up and the server
  // doesn't have any decks yet.  This messes things up for the first person and subsequently everyone
  // has no decks.
  if (data.length == 0) return;

  let decksTemp = [];
  for (d of data) {
    let deck = new Deck();
    deck.copyFromServerData(d);
    decksTemp.push(deck);
  }
  m_decks = decksTemp;

}  // createDeckFromServerData()

// data: array of TokenShip objects
function createShipTokensFromServerData(data) {
  console.log('ship token data = ' , data);
  // this line prevents us from overwriting our ship tokens when we first come up and the server
  // doesn't have any decks yet.  This messes things up for the first person and subsequently everyone
  // has no decks.
  if (data.length == 0) return;

  let tokensTemp = [];
  for (st of data) {
    let token = new TokenShip();
    token.copyFromServerData(st);
    tokensTemp.push(token);
  }
  m_shipTokens = tokensTemp;

}  // createShipTokensFromServerData()

function resetServer() {
  let data = {};
  m_socket.emit('resetServer', data);
}

// emit all the players and the table to the server
function update(isSavedGame = false) {
  if (m_initialized) {
    let msg = m_messageP.html();
    // set some data to unscaled coordinates so that everyone can scale
    // them as needed when getting data from the server
    for (p of m_players) {
      p.token.unscaledX  = p.token.x / m_s;
      p.token.unscaledY  = p.token.y / m_s;
    }
    for (d of m_decks) {
      d.unscaledCw = d.cw / m_s;
      d.unscaledCh = d.ch / m_s;
    }
    for (st of m_shipTokens) {
      st.unscaledX = st.x / m_s;
      st.unscaledY = st.y / m_s;
    }

    // console.log('msg = ' + msg)
    let data = {
      players: m_players,
      message: msg,
      decks: m_decks,
      shipTokens: m_shipTokens,
      numSandLeft: m_numSandLeft,
      stormMeterValue: m_stormMeterValue,
    };
    // m_socket.emit('update', data);
    if (!isSavedGame) m_socket.emit('update', data);
    else              saveJSON(data, 'forbiddenDesert.json', true)

  }
}


function draw() {
  // The m_socket doesn't get an actual ID until after we are out of setup();
  // Hopefully by the time we receive our first message from the socket, we
  // have executed the lie of code below
  // m_players[0].socketId = '/#' + m_socket.id;
  if (m_socket) m_mySocketId = '/#' + m_socket.id;
  
  // background and layout
  image(m_tableBackgroundImage, 0, 0, width, height);
  drawLayout();

  // tiles
  m_decks[DECK_TILES].show(275*m_s, 25*m_s, TILE_SPACING, 0, 5);

  // players
  for (player of m_players) {
    player.show();
  }

  // storm
  let x = 10*m_s;
  let y = 10*m_s + m_tokenSize + 25*m_s;
  m_decks[DECK_STORM].show(x, y, 0, 0, 0);
  fill(255); stroke(255);
  textSize(16*m_s);
  y += 25*m_s;
  text(m_decks[DECK_STORM].cards.length, x, y)

  // storm discard
  x = 10*m_s + m_cw + 25*m_s;
  y = 10*m_s + m_tokenSize + 25*m_s;
  m_decks[DECK_STORM_DISCARD].show(x, y, 0, 0, 0);
  fill(255); stroke(255);
  textSize(16*m_s);
  y += 25*m_s;
  text(m_decks[DECK_STORM_DISCARD].cards.length, x, y)

  // gear
  x = 10*m_s;
  y = 280*m_s;
  m_decks[DECK_GEAR].show(x, y, 0, 0, 0);
  fill(255); stroke(255);
  textSize(16*m_s);
  y += 25*m_s;
  text(m_decks[DECK_GEAR].cards.length, x, y)

  // gear discard
  x = 10*m_s + m_cw + 25*m_s;
  y = 280*m_s;
  m_decks[DECK_GEAR_DISCARD].show(x, y, 0, 0, 0);
  fill(255); stroke(255);
  textSize(16*m_s);
  y += 25*m_s;
  text(m_decks[DECK_GEAR_DISCARD].cards.length, x, y)

  // generic deck
  x = 275*m_s;
  y = 0;
  m_decks[DECK_GENERIC].show(x, y, 1, 0, 0);

  // ship
  x = width - 4*m_cw;
  y = 0.8*height;
  image(m_shipImage, x, y, 4*m_cw, 0.2*height);

  // ship tokens
  for (let i = 0; i < NUM_SHIP_TOKENS; i++) {
    m_shipTokens[i].show();
  }

  // storm meter
  if (m_players.length < 3) image(m_stormMeterImages[0], 10*m_s, 480*m_s, m_meterW, m_meterH);
  else                      image(m_stormMeterImages[1], 10*m_s, 480*m_s, m_meterW, m_meterH);

  // sand meter indicator
  if (m_players.length == 2 || m_players.length == 4) x = m_meterW/2;
  else                                                x = m_meterW/2 + 20*m_s;
  // y = (768-m_stormMeterValue*m_stormMeterDelta)*m_s;
  y = (768-m_stormMeterValue*18)*m_s;
  fill(0, 0, 255);
  circle(x, y, 15*m_s)

  // Debug
  if (m_debugSet != -1)  debugDrawSet(m_debugSet);
  if (m_debugDeck != -1) debugDrawDeck(m_debugDeck);

  // check for cursor over a card
  checkCardHover();
}

function checkCardHover() {
  let card = findCardUnderCursor();
  // only show faceup cards
  if (card ) {
    let deckIndex = card.deckIndex;
    // if (m_decks[deckIndex].isSpread || card.facedown == false) {
    let w = m_decks[deckIndex].cw;
    let h = m_decks[deckIndex].ch;
    let x = width/2 - 1.5*w;
    let y = height/2 - 1.5*h;
    if (deckIndex == DECK_CLASSES) {
      image(m_setImages[card.setIndex][card.index], x, y, w*3, h*3);
      image(m_cardBackImages[card.backIndex], x+w*3, y, w*3, h*3);
    } else {
      if (card.facedown) image(m_cardBackImages[card.backIndex], x, y, w*3, h*3);
      else               image(m_setImages[card.setIndex][card.index], x, y, w*3, h*3);
    }
  }

}  // checkCardHover()

function mousePressed() {

  // Don't pay attention to presses in the control area
  // if (mouseX > 0 && mouseX < 225*m_s && mouseY > (35*m_s + m_tokenSize)) return; // && mouseY > height-m_ch) return;

  console.log('mousePressed ', mouseX, mouseY);

  // Check for player tokens
  m_selectedPlayerToken = -1;
  for (let player of m_players) {
    let token = player.token;
    if (mouseX > token.x-m_tokenSize/2 && mouseX < token.x + m_tokenSize/2 && mouseY > token.y-m_tokenSize/2 && mouseY < token.y + m_tokenSize/2) {
      m_selectedPlayerToken = player.seatPos;
      // console.log('m_selectedPlayerToken = ' , m_selectedPlayerToken);
    }
  }
  if (m_selectedPlayerToken != -1) return;

    // Check for player tokens
  m_selectedShipToken = -1;
  for (let i = 0; i < NUM_SHIP_TOKENS; i++) {
    let token = m_shipTokens[i];
    if (mouseX > token.x && mouseX < token.x + m_tokenShipSize && mouseY > token.y && mouseY < token.y + m_tokenShipSize) {
      m_selectedShipToken = i;
      // console.log('m_selectedShipToken = ' , m_selectedShipToken);
      
    }
  }
  if (m_selectedShipToken != -1) return;

  let foundSomething = false;

  // character class cards
  for (let player of m_players) {
    let card = m_decks[DECK_CLASSES].cards[player.class];
    if (mouseX > card.x && mouseX < card.x+m_cw && mouseY > card.y && mouseY < card.y+m_ch) {
      card.selected = !card.selected;
      foundSomething = true;
      update();
    }
  }

  // character gear cards
  // since these can overlap, we only want the last one checked to be selected
  let selCard = null;
  for (let i = DECK_P0_GEAR; i <= DECK_P3_GEAR; i++) {
    for (let card of m_decks[i].cards) {
      if (mouseX > card.x && mouseX < card.x+m_cw && mouseY > card.y && mouseY < card.y+m_ch) {
        selCard = card;
      }
    }
  }
  if (selCard) {
    selCard.selected = !selCard.selected;
    foundSomething = true;
    update();
  }

  // desert tiles
  for (let card of m_decks[DECK_TILES].cards) {
    if (mouseX > card.x && mouseX < card.x+m_tileSize && mouseY > card.y && mouseY < card.y+m_tileSize) {
      card.selected = !card.selected;
      foundSomething = true;
      update();
    }
  }

  // unselect stuff if we didn't find something
  if (!foundSomething) {
    for (let deck of m_decks) {
      for (card of deck.cards) {
        if (card.selected) foundSomething = true;
        card.selected = false;
      }
    }
    if (foundSomething) update();
  }
}

function mouseDragged() {
  // console.log('mouseDragged');
  // If a die is selected
  if (m_selectedPlayerToken != -1) {
    m_players[m_selectedPlayerToken].token.x = mouseX;
    m_players[m_selectedPlayerToken].token.y = mouseY;
  }
  if (m_selectedShipToken != -1) {
    m_shipTokens[m_selectedShipToken].x = mouseX;
    m_shipTokens[m_selectedShipToken].y = mouseY;
  }
}

function mouseReleased() {
  console.log('mouseReleased');

  if (m_selectedPlayerToken != -1) {
    m_selectedPlayerToken = -1;
    update();
  }
  if (m_selectedShipToken != -1) {
    m_selectedShipToken = -1;
    update();
  }
}

function drawLayout() {
  stroke(0); noFill(); strokeWeight(1);

  ///////////////////////////////
  // The tiles
  let startx = 275*m_s;
  let starty = 25*m_s;
  for (let iy = 0; iy < 5; iy++) {
    for (let ix = 0; ix < 5; ix++) {
      rect(startx + ix*m_tileSpacing, starty + iy*m_tileSpacing, m_tileSize, m_tileSize);
    }
  }

  ///////////////////////////////
  // The players
  for (let i = 0; i < 4; i++) {
    // let startx = width-3.5*m_cw;
    let startx = width-4.0*m_cw;
    let starty = i*(height/5);
    fill(256-i*64); noStroke();
    // the whole player portion
    rect(startx, starty, 4.0*m_cw, height/5);
    // player name
    noFill(); stroke(0);
    rect(startx, starty, 150*m_s, 30*m_s);
    // player card
    rect(startx, starty+30*m_s, m_cw, m_ch);

  }

  ///////////////////////////////
  // The stuff on the left

  // ship tokens
  startx = 10*m_s;
  starty = 10*m_s;
  // noFill(); stroke(0);
  // rect(startx, starty, m_tokenShipSize, m_tokenShipSize);
  // rect(startx +  60*m_s, starty, m_tokenShipSize, m_tokenShipSize);
  // rect(startx + 120*m_s, starty, m_tokenShipSize, m_tokenShipSize);
  // rect(startx + 180*m_s, starty, m_tokenShipSize, m_tokenShipSize);

  // storm decks 
  starty += m_tokenSize + 25*m_s;  // 75
  
  rect(startx, starty, m_cw, m_ch);
  rect(startx + m_cw + 25*m_s, starty, m_cw, m_ch);
  // storm buttons
  starty += m_ch + 5*m_s;          // 230
  rect(startx, starty, m_cw, 25*m_s);
  rect(startx + m_cw + 25*m_s, starty, m_cw, 25*m_s);

  // gear decks 
  starty += 50*m_s;                // 280
  rect(startx, starty, m_cw, m_ch);
  rect(startx + m_cw + 25*m_s, starty, m_cw, m_ch);

  // Sand left
  starty += m_ch + 25*m_s;         // 455
  fill(0);
  textSize(16*m_s);
  text("Sand Left: " + m_numSandLeft, startx, starty)

  // storm meter
  noFill();
  starty += 25*m_s;                // 480
  rect(startx, starty, m_meterW, m_meterH);
  rect(startx, starty + m_meterH + 5*m_s, m_meterW/2, 25*m_s);
  rect(startx + m_meterW/2, starty + m_meterH + 5*m_s, m_meterW/2, 25*m_s);

  // buttons
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 6; j++) {
      rect(startx+ m_meterW + 25*m_s, starty + j*m_bh, m_bw, m_bh);
    }
    startx += m_bw;
  }

  // // buttons
  // starty = height - 2*m_bh - 10;
  // for (let i = 0; i < 2; i++) {
  //   for (let j = 0; j < 5; j++) {
  //     rect(startx + j*m_bw, starty, m_bw, m_bh);
  //   }
  //   starty += m_bh;
  // }


}

function windowResized() {
  // if (true) {
  if (windowWidth >= 1600 && windowHeight>= 900) {
    let oldms = m_s;
    let newW, newH;
    let xScale = windowWidth/1600;
    let yScale = windowHeight/900;
    if (xScale <= yScale) {
      newW = windowWidth;
      newH = windowWidth*(900/1600);
      m_s = windowWidth/1600;
    } else {
      newH = windowHeight;
      newW = windowHeight*(1600/900);
      m_s = windowHeight/900;
    }

    // we have to move tokens manually, because they have  x,y positions
    // set by moving them, which is not based on 1600x900.  We have to remove the old
    // scale factor and then apply the new scale factor
    for (let p of m_players) {
      p.token.x /= oldms;
      p.token.y /= oldms;
      p.token.x *= m_s;
      p.token.y *= m_s;
    }

    // We have to change the deck's card width and card height.  The x and y are
    // calculated at draw time so they should be ok
    for (let deck of m_decks) {
      deck.cw = deck.cw / oldms * m_s;
      deck.ch = deck.ch / oldms * m_s;
    }

    for (let tok of m_shipTokens) {
      tok.x = tok.x / oldms * m_s;      
      tok.y = tok.y / oldms * m_s;      
    }

    for (let b of m_allButtons) {
      b.btn.size(b.w * m_s, b.h * m_s);
      b.btn.position(b.x * m_s, b.y * m_s);
    }

    // A few remaining variables
    m_tileSpacing = m_tileSpacing / oldms * m_s;
    m_tileSize = m_tileSize / oldms * m_s;
    m_tokenSize = m_tokenSize / oldms * m_s;
    m_cw = m_cw / oldms * m_s;
    m_ch = m_ch / oldms * m_s;
    m_bw = m_bw / oldms * m_s;
    m_bh = m_bh / oldms * m_s;
    m_meterW = m_meterW / oldms * m_s;
    m_meterH = m_meterH / oldms * m_s;
    m_tokenShipSize = m_tokenShipSize / oldms * m_s;

    resizeCanvas(newW, newH);
  }
}

// I need a separate class that stores all the original informaiton.  I tried using the
// button's stats (x, y, w, h) from button.size() and button.position(), but those are
// integers and I quickly lose precision as I resize the window
class Button {
  constructor(btn, x, y, w, h) {
    this.btn = btn;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

// Setting m_debugSet to soemthing other than -1 causes this function to be called in draw();
function debugDrawSet(setIdx) {
  let xpos = 0;
  let ypos = -m_ch;
  for (let i = 0; i < m_setImages[setIdx].length; i++) {
    if (i % 10 == 0) {xpos = 0; ypos += m_ch}
    image(m_setImages[setIdx][i], xpos, ypos, m_cw, m_ch);
    xpos += m_cw;
  }
}
// Setting m_debugSet to soemthing other than -1 causes this function to be called in draw();
function debugDrawDeck(deckIdx) {
  let xpos = 0;
  let ypos = -m_ch;
  let deck = m_decks[deckIdx];
  for (let i = 0; i < deck.cards.length; i++) {
    let card = deck.cards[i];
    let setIdx = card.setIndex;
    let idx = card.index;
    if (i % 10 == 0) {xpos = 0; ypos += m_ch}
    image(m_setImages[setIdx][idx], xpos, ypos, m_cw, m_ch);
    xpos += m_cw;
  }
}