import Phaser from 'phaser';
import io from 'socket.io-client';
import ship from './assets/spaceShips_001.png';
import enemy from './assets/enemyBlack5.png';
import game from './assets/Gem3.gif';
import synthback from './assets/synthback.jpg';

class GameTwo extends Phaser.Scene {
  constructor() {
    super('GameTwo');
    this.counter = 0;
  }

  init(data) {
    this.room = data.room;
  }

  preload() {
    this.load.image('ship', ship);
    this.load.image('otherPlayer', enemy);
    this.load.image('star', game);
    this.load.image('synthback', synthback);
    this.socket = io('https://www.phaserbros.com', { query: `roomName=${this.room}` });
  }

  create() {
    this.add.image(0, 0, 'synthback').setOrigin(0).setScale(1.3, 1.7);
    this.otherPlayers = this.physics.add.group();
    this.socket.emit('join', this.room);
    this.socket.on('currentPlayers', (players) => {
      players.forEach((player) => {
        if (player.id === this.socket.id) {
          this.addPlayer(player);
        } else {
          this.addOtherPlayers(player);
        }
      });
    });
    this.socket.on('newPlayer', (playerInfo) => {
      this.addOtherPlayers(playerInfo);
    });
    this.socket.on('disconnect', (playerId) => {
      this.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (playerId === otherPlayer.id) {
          otherPlayer.destroy();
        }
      });
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.socket.on('playerMoved', (playerInfo) => {
      this.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (playerInfo.id === otherPlayer.id) {
          otherPlayer.setRotation(playerInfo.rotation);
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });

    this.blueScoreText = this.add.text(16, 16, '', {
      fontSize: '32px',
      fill: '#00ffff',
    });

    this.redScoreText = this.add.text(584, 16, '', {
      fontSize: '32px',
      fill: '#FFC0CB',
    });

    this.socket.on('scoreUpdate', (scores) => {
      this.blueScoreText.setText(`Blue: ${scores.blue}`);
      this.redScoreText.setText(`Pink:${scores.red}`);
      if (scores.blue === 250 || scores.red === 250) {
        this.scene.start('gameOver', { scores });
      }
    });

    this.socket.on('starLocation', (starLocation) => {
      if (this.star) this.star.destroy();
      this.star = this.physics.add.image(starLocation.x, starLocation.y, 'star');
      this.physics.add.overlap(this.ship, this.star, function () {
        this.socket.emit('starCollected');
      }, null, this);
    });
  }

  update() {
    if (this.ship) {
      if (this.cursors.left.isDown) {
        this.ship.setAngularVelocity(-300);
      } else if (this.cursors.right.isDown) {
        this.ship.setAngularVelocity(300);
      } else {
        this.ship.setAngularVelocity(0);
      }
      if (this.cursors.up.isDown) {
        this.physics.velocityFromRotation(
          this.ship.rotation
          + 1.5, 100,
          this.ship.body.acceleration,
        );
      } else {
        this.ship.setAcceleration(0);
      }

      this.physics.world.wrap(this.ship, 5);
      const { x } = this.ship;
      const { y } = this.ship;
      const r = this.ship.rotation;

      if (this.ship.oldPosition && (
        x !== this.ship.oldPosition.x
        || y !== this.ship.oldPosition.y
        || r !== this.ship.oldPosition.rotation
      )) {
        this.socket.emit('playerMovement', {
          x: this.ship.x,
          y: this.ship.y,
          rotation: this.ship.rotation,
          room: this.room,
        });
      }

      this.ship.oldPosition = {
        x: this.ship.x,
        y: this.ship.y,
        rotation: this.ship.rotation,
      };
    }
  }

  addPlayer(playerInfo) {
    this.ship = this.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    if (playerInfo.team === 'blue') {
      this.ship.setTint(0x00ffff);
    } else {
      this.ship.setTint(0xFFC0CB);
    }
    this.ship.setDrag(0.99);
    this.ship.setAngularDrag(100);
    this.ship.setMaxVelocity(200);
  }

  addOtherPlayers(playerInfo) {
    const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    if (playerInfo.team === 'blue') {
      otherPlayer.setTint(0x00ffff);
    } else {
      otherPlayer.setTint(0xFFC0CB);
    }
    otherPlayer.id = playerInfo.id;
    this.otherPlayers.add(otherPlayer);
  }
}

export default GameTwo;
