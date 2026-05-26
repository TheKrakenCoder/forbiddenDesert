class TokenShip {
  constructor(x, y, shipImageIndex) {
    this.x = x;  // upper left of square/triangle
    this.y = y;
    this.unscaledX = x;  // upper left of square/triangle
    this.unscaledY = y;
    this.shipImageIndex = shipImageIndex;
  }

  show() {
    image(m_shipTokenImages[this.shipImageIndex], this.x, this.y, m_tokenShipSize, m_tokenShipSize);
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
    this.shipImageIndex = data.shipImageIndex;
  }
}