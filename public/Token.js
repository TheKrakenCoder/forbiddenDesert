class Token {
  constructor(x, y, color, letter) {
    this.x = x;  // upper left of square/triangle
    this.y = y;
    this.unscaledX = x;  // upper left of square/triangle
    this.unscaledY = y;
    this.color = color;
    this.letter = letter;
    this.selected = false;  // I'm not sure it means anything to have a token selected
  }

  show() {
    fill(this.color);  stroke(0); strokeWeight(1);
    circle(this.x, this.y, m_tokenSize);

    let txtSz = 24*m_s;
    fill(0); stroke(0); textSize(txtSz);
    text(this.letter, this.x-txtSz/3, this.y+txtSz/3)

    if (this.selected) {
      noFill(); stroke(0, 255, 0); strokeWeight(3);
      circle(this.x, this.y, m_tokenSize);
      strokeWeight(1);
    }
  }

  // We have to pass extra data into copyFromServerData() because we lose the positions
  // of our tokens when they are recalculated the first time we get server data and our seatPos is -1.
  // Passing the seatPos allows us to calculate the y properly (assuming it is incorrect)
  copyFromServerData(data, seatPos) {
    this.x = data.unscaledX*m_s;
    if (data.y >= 0) this.y = data.unscaledY*m_s;
    else             this.y = seatPos*(height/5) + m_tokenSize/2;
    this.unscaledX = data.unscaledX;  // unneeded after being used above
    this.unscaledY = data.unscaledY;
    this.color = data.color;
    this.letter = data.letter;
    this.selected = data.selected;
  }
}