// Player should have a seatPosition, that never changes.  When a new Player
// comes on board, we (the server) pick the lowest unused seat position.
//         2
//     1       3
//         0
// When we draw the players, we always draw a player at the bottom of the screen
// in seat position 0.  So we draw based on a relative seat position.
class Player {
  constructor(idx, name, charClass) {
    // index will end up getting set by the server
    this.socketId = 0;       // string
    this.seatPos = idx;      // integer
    this.name = name;        // string
    this.class = charClass;  // integer - used as an index into different arrays
    this.waterValue = 50;    // pixels relative to the top of the player's card
    let letter = m_classNames[this.class][0];
    this.token = new Token(width-3.0*m_cw + m_tokenSize/2, this.seatPos*(height/5) + m_tokenSize/2, m_tokenColors[this.class], letter);
    // this.token = new Token(width-2.0*m_cw + m_bw + m_tokenSize/2, this.seatPos*(height/5) + m_tokenSize, m_tokenColors[this.class])
  }  // xtor

  show() {
    // background
    let startx = width-4.0*m_cw;
    let starty = this.seatPos*(height/5);
    fill(m_playerBackgroundColors[this.class]); noStroke();
    rect(startx, starty, width-startx, height/5);

    // name
    fill(0); stroke(0);
    let txtSz = 24*m_s;
    textSize(txtSz);
    text(this.name, startx, starty+txtSz)

    // class card image
    let card = m_decks[DECK_CLASSES].cards[this.class];
    card.x = startx;
    card.y = starty+30*m_s;
    card.show();

    // token
    this.token.show();

    // water level
    let x = startx + 50*m_s;
    let y = card.y + this.waterValue * m_s;
    fill(0, 0, 255);
    circle(x, y, 15*m_s)

    // gear cards
    let divFactor = 1;
    let cards = m_decks[this.seatPos].cards;
    if (cards.length > 3) divFactor = 3/cards.length;  // there's only room for 3 whole cards
    for (let i = 0; i < m_decks[this.seatPos].cards.length; i++) {
      cards[i].x = startx + m_cw + i*m_cw*divFactor;
      cards[i].y = starty+30*m_s;
      cards[i].facedown = false;
      cards[i].show();
    }

  }


  // data: a Player object
  // playerNum: if -1 this is server data, otherwise this is a saved game restore
  copyFromServerData(data, playerNum = -1) {
    if (playerNum == -1) this.socketId = data.socketId;
    else                 this.socketId = m_players[playerNum].socketId;
    // this.socketId = data.socketId;
    this.seatPos = data.seatPos;
    this.name = data.name;
    this.class = data.class;
    this.waterValue = data.waterValue;

    let token = new Token(0, 0, 0, ' ');
    token.copyFromServerData(data.token, this.seatPos);
    this.token = token;

  }  // copyFromServerData

}  // class Player