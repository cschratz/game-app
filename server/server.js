// import dotenv module in this file
require('dotenv').config();

// import express module into file
const express = require('express');

// import socket.io for live chat
const socketio = require('socket.io');

// import path module to serve static assets
const path = require('path');

// import express body-parser module
const bodyParser = require('body-parser');

// import express-session module
const session = require('express-session');

// import passport module
const passport = require('passport');

// import multer module =>
// multer parses files that were part of request object
const multer = require('multer');

// import DiscordStrategy authentication strategy
require('../src/strategies/discordStrategy');

// import googleStrategy authentication strategy
require('../src/strategies/googleStrategy');

// create variable set to new express instance
const app = express();

// initialize multer options for GCS upload
const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// set middleware for GCS uploads
app.disable('x-powered-by');
app.use(multerMid.single('file'));

// utilize body parser on incoming requests to server
app.use(bodyParser.json());

// utilize the urlencoded from express framework
app.use(bodyParser.urlencoded({ extended: false }));

// require DB and API routers in server file to properly route request through server
const database = require('../routes/dbRoutes');
const api = require('../routes/apiRoutes');

// set port for server to run on with backup port
const port = process.env.SERVER_PORT || 3000;

//  initialize the express session - discord related
app.use(session({
  secret: 'some random secret',
  cookie: {
    maxAge: 60000 * 60 * 24, // one day max age
  },
  resave: true,
  saveUninitialized: false,
  name: 'discord.oauth2',
}));

//  initialize the express session - google related
app.use(session({
  secret: 'some random secret',
  cookie: {
    maxAge: 60000 * 60 * 24, // one day max age
  },
  resave: true,
  saveUninitialized: false,
  name: 'google.oauth2',
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// use router to direct to dbRoutes file
app.use('/', database);

// use router to direct to apiRoutes file
app.use('/api', api);

// create variables to rep static file paths to be served
const DIST_DIR = path.join(__dirname, '../dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');

// middleware to server static files
app.use(express.static(DIST_DIR));

// route serving static files
app.get('/*', (req, res) => {
  res.sendFile(HTML_FILE);
});

// set server to listen for events on PORT
const server = app.listen(port, () => {
  console.log(`This server only listens to:${port}`);
});

// Socket setup
const io = socketio(server);
const {
  addUser, removeUser, getUser, getUsersInRoom,
} = require('./user');

// Server side game assets
const players = [];

const star = {
  x: Math.floor(Math.random() * 700) + 50,
  y: Math.floor(Math.random() * 500) + 50,
};

const scores = [];

// establish socket on
io.on('connection', (socket) => {
  console.log('a user connected');
  // create a new player and add it to our players object
  const { roomName } = socket.handshake.query;

  if (socket.handshake.headers.referer.split('?')[0] === 'https://www.phaserbros.com/gametwo') {
    socket.join(roomName);
  }

  socket.on('join', (room) => {
    const player = {
      rotation: 0,
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50,
      id: socket.id,
      team: (Math.floor(Math.random() * 2) === 0) ? 'red' : 'blue',
      room,
    };

    players.push(player);
    console.log(players);

    const newPlayer = players.find((playee) => playee.id === socket.id);

    // let newPlayer = null;
    // if (newPlayerIndex !== -1) {
    //   newPlayer = players[newPlayerIndex];
    // }

    const activeRoomPlayers = players.filter((playee) => playee.room === room);

    // send the players object to the new player
    socket.emit('currentPlayers', activeRoomPlayers);
    // send the star object to the new player
    socket.emit('starLocation', star);
    // send the current scores
    const index = scores.findIndex((score) => score.room === room);

    if (index === -1) {
      const newScore = {
        red: 0,
        blue: 0,
        room,
      };
      scores.push(newScore);
      socket.emit('scoreUpdate', newScore);
    } else {
      socket.emit('scoreUpdate', scores[index]);
    }
    // update all other players of the new player
    socket.to(room).emit('newPlayer', newPlayer);
  });

  // players[socket.id] = {
  //   rotation: 0,
  //   x: Math.floor(Math.random() * 700) + 50,
  //   y: Math.floor(Math.random() * 500) + 50,
  //   playerId: socket.id,
  //   team: (Math.floor(Math.random() * 2) === 0) ? 'red' : 'blue',
  // };

  // send the players object to the new player
  // socket.emit('currentPlayers', players);
  // send the star object to the new player
  // socket.emit('starLocation', star);
  // send the current scores
  // socket.emit('scoreUpdate', scores);
  // update all other players of the new player
  // socket.to(room).emit('newPlayer', players[socket.id]);

  // socket.emit('currentPlayers', players);

  socket.on('playerMovement', (movementData) => {
    if (movementData.room === roomName) {
      const index = players.findIndex((playee) => playee.id === socket.id);
      players[index].x = movementData.x;
      players[index].y = movementData.y;
      players[index].rotation = movementData.rotation;
      socket.to(roomName).emit('playerMoved', players[index]);
    }
  });

  socket.on('starCollected', () => {
    const index = players.findIndex((playee) => playee.id === socket.id);
    const scoreIndex = scores.findIndex((score) => score.room === roomName);

    if (players[index].team === 'red') {
      scores[scoreIndex].red += 10;
    } else {
      scores[scoreIndex].blue += 10;
    }
    star.x = Math.floor(Math.random() * 700) + 50;

    star.y = Math.floor(Math.random() * 500) + 50;

    io.to(roomName).emit('starLocation', star);
    io.to(roomName).emit('scoreUpdate', scores[scoreIndex]);
  });

  socket.on('join1', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) return callback(error);

    socket.emit('message', { user: 'GameTime Bot', text: `${user.name}, welcome to the chat: ${user.room}` });

    socket.broadcast.to(user.room).emit('message', { user: 'GameTime Bot', text: `${user.name}, has joined!` });

    socket.join(user.room);

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();

    return null;
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', { user: 'GameTime Bot', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    }
    console.log('user disconnected');
    // remove this player from our players object
    if (socket.handshake.headers.referer.split('?')[0] === 'https://www.phaserbros.com/gametwo') {
      const index = players.findIndex((playee) => playee.id === socket.id);
      const scoreIndex = scores.findIndex((score) => score.room === roomName);
      if (index !== -1) {
        players.splice(index, 1);
      }
      if (scoreIndex !== -1) {
        scores[scoreIndex].red = 0;
        scores[scoreIndex].blue = 0;
      }
    }
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });
});
