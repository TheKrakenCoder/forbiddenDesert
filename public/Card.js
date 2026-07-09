class Card {
  constructor(setIdx, idx, backIdx, deckIdx) {
    this.setIndex = setIdx;    // index into m_setImages array - Each element is an array of card images
    this.index = idx;          // index into the m_setImages[this.setIndex] - an individual card image
    this.backIndex = backIdx;  // index into the m_cardBackImages[] - an background card image
    this.deckIndex = deckIdx;  // index into m_decks[] - which deck is this part of
    this.x = 0;                // x, y get calculated every time we draw
    this.y = 0;
    this.facedown = true;
    this.selected = false;
    this.numSand = 0;
    this.distanceFromSpiral = 0;
  }

  show() {
    if (!m_thisPlayer) return;

    let deck = m_decks[this.deckIndex];
    
    if (this.facedown) {
      noStroke(); noFill();
      // let backIndex = m_decks[this.deckIndex].backIndex;
      image(m_cardBackImages[this.backIndex], this.x, this.y, deck.cw, deck.ch);
    } else {
      noStroke(); noFill();
      let set = m_setImages[this.setIndex];
      // image(set[this.index], this.x, this.y);
      image(set[this.index], this.x, this.y, deck.cw, deck.ch);

      // if (this.exhausted) {
      //   fill(255, 0, 0);
      //   circle(this.x + deck.cw/2, this.y + deck.ch/4, deck.cw*0.5);
      // }
      // if (this.tapped) {
      //   textAlign(CENTER);
      //   stroke(255); fill(0, 0, 255); textSize(48);
      //   text("T", this.x + deck.cw/2, this.y + deck.ch/3)
      //   textAlign(LEFT);
      //   // fill(255, 0, 0);
      //   // circle(this.x + deck.cw/2, this.y + deck.ch/4, deck.cw*0.5);
      // }
    }

    if (this.numSand > 0) {
      if (this.numSand == 1) fill('#8c6c5c');
      else                   fill('#3d251e');
      noStroke();
      beginShape();
      vertex(this.x + deck.cw/2, this.y);
      vertex(this.x + deck.cw,   this.y + deck.ch/2);
      vertex(this.x + deck.cw/2, this.y + deck.ch);
      vertex(this.x,             this.y + deck.ch/2);
      endShape(CLOSE);
      let sz = 32*m_s;
      stroke(255); fill(255); textSize(sz);
      text(this.numSand, this.x + deck.cw/2 - 10, this.y + deck.ch/2 + 10);
    }

    if (this.selected) {
      let deck = m_decks[this.deckIndex];
      stroke(0, 255, 0);
      strokeWeight(4);
      noFill();
      rect(this.x-2, this.y-2, deck.cw, deck.ch);
      strokeWeight(1);
    }

  }

  setFacedown() {
    this.facedown = true;
  }
  setFaceup() {
    this.facedown = false;
  }
  flipCard(player) {
    this.facedown = !this.facedown;
  }

  reset() {
    this.facedown = true;
    this.selected = false;
  }

  // data: a Card object
  copyFromServerData(data) {
    this.setIndex = data.setIndex;
    this.index = data.index;
    this.backIndex = data.backIndex;
    this.deckIndex = data.deckIndex;
    this.x = data.x;
    this.y = data.y;
    this.facedown = data.facedown;
    this.selected = data.selected;
    this.numSand = data.numSand;
    this.distanceFromSpiral = data.distanceFromSpiral;
  }

}