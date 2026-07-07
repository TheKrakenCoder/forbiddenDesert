// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/ZjVyKXp9hec

// Based off of Shawn Van Every's Live Web
// http://itp.nyu.edu/~sve204/liveweb_fall2013/week3.html

// npm init
// npm install express@4.19.2 --save
// npm install socket.io@4.7.5 --save
// node sawServer.js

const MAX_PLAYERS = 4;

let m_seatOrder = [0, 1, 2, 3];
let m_players = [];
let m_message = "&nbsp";
let m_decks = [];
let m_shipTokens = [];
let m_numSandLeft = 48;
let m_stormMeterValue = 0;
// let m_cardArrays = [];
// let m_firewood = 7;
// let m_isOpenSeason = false;
// let m_difficulty = 2;

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
// io = new Server(server);
io = new Server(server, { cors: { origin: "*"}});

app.use(express.static('public'));

let myPort = process.env.PORT || 12345;
server.listen(myPort, () => {
  console.log('listening on *:'+myPort);
});

app.use(express.static('public'));

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

// set a callback to emit all the players 
// setInterval(heartbeat, 500);

// emit all the data, to all the players
function heartbeat() {
  let data = {
    players: m_players,
    message: m_message,
    decks:   m_decks,
    shipTokens: m_shipTokens,
    numSandLeft: m_numSandLeft,
    stormMeterValue: m_stormMeterValue,
    // cardArrays: m_cardArrays,
    // firewood: m_firewood,
    // isOpenSeason: m_isOpenSeason,
    // difficulty: m_difficulty,
  };
  // emit to all players
  io.sockets.emit('heartbeat', data);
}

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.on(
  'connection',
  // We are given a websocket object in our function
  function(socket) {
    console.log('We have a new client: ' + socket.id);

    //----------------------------------------------
    // one client says its starting
    // data is a Player object
    socket.on('start', function(data) {
      console.log('start message: data = ' + data);
      // find the lowest unused seat position
      for (let i = 0; i < MAX_PLAYERS; i++) {
        let found = false;
        for (let index = 0; index < m_players.length; index++) {
          if (m_players[index].seatPos == m_seatOrder[i]) found = true;
        }
        if (found == false) {
          // data.seatPos = i;
          data.seatPos = m_seatOrder[i];
          console.log('start message: using seatPos = ' + i);
          break;
        }
      }
      // data.seatPos = m_seatPos;
      m_players.push(data);
      console.log('start message: num players = ' + m_players.length)
      // emit to the player who sent the message.  I'm not sure why is doesn't
      // go to everyone like in the NodeExpressSocketLatest example
      socket.emit('initPlayer', data);  
      heartbeat();
    });

    //----------------------------------------------
    // receive an update from one client which contains all players
    // data: object containing Players array and Decks.
    // We separate the data out since we want to reset them when the last
    // player disconnects.  Otherwise we could pass data into heartbeat via heatbeat(data)
    socket.on('update', function(data) {
      console.log('update message: got ' + data.players.length + ' players; message = ' + data.message);
      // console.log('update message: data[0].socketId = ' + data.players[0].socketId);
      
      m_players = data.players;
      m_message = data.message;
      m_decks   = data.decks;
      m_shipTokens = data.shipTokens,
      m_numSandLeft = data.numSandLeft;
      m_stormMeterValue = data.stormMeterValue;
      // m_cardArrays = data.cardArrays;
      // m_firewood = data.firewood;
      // m_isOpenSeason = data.isOpenSeason;
      // m_difficulty = data.difficulty;
      heartbeat();
    });

    socket.on('resetServer', function(data) {
      io.disconnectSockets();
      m_players = [];
      m_decks = [];
      m_message = "&nbsp";
      m_shipTokens = [];
      m_numSandLeft = 48;
      m_stormMeterValue = 0;
    });

    //----------------------------------------------
    socket.on('disconnect', function() {
      console.log('disconnect message: Client has disconnected.  Number of clients was ' + m_players.length);
      for (var i = m_players.length-1; i >= 0; i--) {
        const theId = '/#' + socket.id;
        // console.log('socket.id ' + socket.id + " m_player[i].socketId " + m_players[i].socketId);
        if (theId == m_players[i].socketId) {
          m_players.splice(i, 1);
        }
      }
      heartbeat();
      console.log('disconnect message: Number of clients now is ' + m_players.length);
      // There may be issues where the values are not reset when we initPlayer the first player.
      // I dislike putting this in the server, since it would be nice if the server knew nothing
      // about the data, but it seems safer this way.
      if (m_players.length == 0) {
        if (m_message) m_message = "&nbsp";
        if (m_decks)  m_decks = [];
        if (m_shipTokens)  m_shipTokens = [];
        m_numSandLeft = 48;
        m_stormMeterValue = 0;
        // if (m_cardArrays) m_cardArrays = [];
        // m_firewood = 7;
        // m_isOpenSeason = false;
        // m_difficulty = 2;
      }
    });
  }
);
