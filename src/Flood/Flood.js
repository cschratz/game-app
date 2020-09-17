import Phaser from 'phaser';
import blobsJSON from './assets/blobs.json';
import blobsPNG from './assets/blobs.png';
// import monstersJSON from './assets/monsters.json';
// import monsterPNG from './assets/monsters.png';

export default class Flood extends Phaser.Scene {
  constructor() {
    super('flood');

    this.allowClick = true;

    this.arrow = null;
    this.cursor = null;
    this.cursorTween = null;
    this.monsterTween = null;

    this.icon1 = { shadow: null, monster: null };
    this.icon2 = { shadow: null, monster: null };
    this.icon3 = { shadow: null, monster: null };
    this.icon4 = { shadow: null, monster: null };
    this.icon5 = { shadow: null, monster: null };
    this.icon6 = { shadow: null, monster: null };

    this.gridBG = null;

    this.instructions = null;
    this.text1 = null;
    this.text2 = null;
    this.text3 = null;

    this.currentColor = '';

    this.emitters = {};

    this.grid = [];
    this.matched = [];

    this.moves = 25;

    this.frames = ['blue', 'green', 'grey', 'purple', 'red', 'yellow'];
  }

  preload() {
    // this.load.bitmapFont(
    //   'atari', 'assets/fonts/bitmap/atari-smooth.png', 'assets/fonts/bitmap/atari-smooth.xml'
    // );
    this.load.atlas('flood', blobsPNG, blobsJSON);
  }

  create() {
    this.add.image(400, 300, 'flood', 'background');
    this.gridBG = this.add.image(400, 600 + 300, 'flood', 'grid');

    this.createIcon(this.icon1, 'grey', 16, 156);
    this.createIcon(this.icon2, 'red', 16, 312);
    this.createIcon(this.icon3, 'green', 16, 458);
    this.createIcon(this.icon4, 'yellow', 688, 156);
    this.createIcon(this.icon5, 'blue', 688, 312);
    this.createIcon(this.icon6, 'purple', 688, 458);

    this.cursor = this.add.image(16, 156, 'flood', 'cursor-over').setOrigin(0).setVisible(false);

    //  The game is played in a 14x14 grid with 6 different colors

    this.grid = [];

    for (let x = 0; x < 14; x += 1) {
      this.grid[x] = [];

      for (let y = 0; y < 14; y += 1) {
        const sx = 166 + (x * 36);
        const sy = 66 + (y * 36);
        const color = Phaser.Math.Between(0, 5);

        const block = this.add.image(sx, -600 + sy, 'flood', this.frames[color]);

        block.setData('oldColor', color);
        block.setData('color', color);
        block.setData('x', sx);
        block.setData('y', sy);

        this.grid[x][y] = block;
      }
    }

    //  Do a few floods just to make it a little easier starting off
    this.helpFlood();

    for (let i = 0; i < this.matched.length; i += 1) {
      const block = this.matched[i];

      block.setFrame(this.frames[block.getData('color')]);
    }

    this.currentColor = this.grid[0][0].getData('color');

    this.particles = this.add.particles('flood');

    for (let i = 0; i < this.frames.length; i += 1) {
      this.createEmitter(this.frames[i]);
    }

    this.createArrow();

    this.text1 = this.add.text(684, 30, 'Moves', { fontSize: '30px' }).setAlpha(0);
    this.text2 = this.add.text(694, 60, '00', { fontSize: '30px' }).setAlpha(0);
    this.text3 = this.add.text(180, 200, 'So close!\n\nClick to\ntry again', { fontSize: '40px' }).setAlpha(0);

    this.instructions = this.add.image(400, 300, 'flood', 'instructions').setAlpha(0);

    this.revealGrid();
  }

  helpFlood() {
    for (let i = 0; i < 8; i += 1) {
      const x = Phaser.Math.Between(0, 13);
      const y = Phaser.Math.Between(0, 13);

      const oldColor = this.grid[x][y].getData('color');
      let newColor = oldColor + 1;

      if (newColor === 6) {
        newColor = 0;
      }

      this.floodFill(oldColor, newColor, x, y);
    }
  }

  createArrow() {
    this.arrow = this.add.image(109 - 24, 48, 'flood', 'arrow-white').setOrigin(0).setAlpha(0);

    this.tweens.add({

      targets: this.arrow,
      x: '+=24',
      ease: 'Sine.easeInOut',
      duration: 900,
      yoyo: true,
      repeat: -1,

    });
  }

  createIcon(icon, color, x, y) {
    const sx = (x < 400) ? -200 : 1000;

    // eslint-disable-next-line no-param-reassign
    icon.monster = this.add.image(sx, y, 'flood', `icon-${color}`).setOrigin(0);

    const shadow = this.add.image(sx, y, 'flood', 'shadow');

    shadow.setData('color', this.frames.indexOf(color));

    shadow.setData('x', x);

    shadow.setData('monster', icon.monster);

    shadow.setOrigin(0);

    shadow.setInteractive();

    // eslint-disable-next-line no-param-reassign
    icon.shadow = shadow;
  }

  revealGrid() {
    this.tweens.add({
      targets: this.gridBG,
      y: 300,
      ease: 'Power3',
    });

    let i = 800;

    for (let y = 13; y >= 0; y -= 1) {
      for (let x = 0; x < 14; x += 1) {
        const block = this.grid[x][y];

        this.tweens.add({

          targets: block,

          y: block.getData('y'),

          ease: 'Power3',
          duration: 800,
          delay: i,

        });

        i += 20;
      }
    }

    i -= 1000;

    //  Icons
    this.tweens.add({
      targets: [this.icon1.shadow, this.icon1.monster],
      x: this.icon1.shadow.getData('x'),
      ease: 'Power3',
      delay: i,
    });

    this.tweens.add({
      targets: [this.icon4.shadow, this.icon4.monster],
      x: this.icon4.shadow.getData('x'),
      ease: 'Power3',
      delay: i,
    });

    i += 200;

    this.tweens.add({
      targets: [this.icon2.shadow, this.icon2.monster],
      x: this.icon2.shadow.getData('x'),
      ease: 'Power3',
      delay: i,
    });

    this.tweens.add({
      targets: [this.icon5.shadow, this.icon5.monster],
      x: this.icon5.shadow.getData('x'),
      ease: 'Power3',
      delay: i,
    });

    i += 200;

    this.tweens.add({
      targets: [this.icon3.shadow, this.icon3.monster],
      x: this.icon3.shadow.getData('x'),
      ease: 'Power3',
      delay: i,
    });

    this.tweens.add({
      targets: [this.icon6.shadow, this.icon6.monster],
      x: this.icon6.shadow.getData('x'),
      ease: 'Power3',
      delay: i,
    });

    //  Text

    this.tweens.add({
      targets: [this.text1, this.text2],
      alpha: 1,
      ease: 'Power3',
      delay: i,
    });

    i += 500;

    this.movesTween = this.tweens.addCounter({
      from: 0,
      to: 25,
      ease: 'Power1',
      onUpdate(tween, targets, text) {
        text.setText(Phaser.Utils.String.Pad(tween.getValue().toFixed(), 2, '0', 1));
      },
      onUpdateParams: [this.text2],
      delay: i,
    });

    i += 500;

    this.tweens.add({
      targets: [this.instructions, this.arrow],
      alpha: 1,
      ease: 'Power3',
      delay: i,
    });

    this.time.delayedCall(i, this.startInputEvents, [], this);
  }

  startInputEvents() {
    this.input.on('gameobjectover', this.onIconOver, this);
    this.input.on('gameobjectout', this.onIconOut, this);
    this.input.on('gameobjectdown', this.onIconDown, this);

    //  Cheat mode :)

    this.input.keyboard.on('keydown-M', function () {
      this.moves += 1;
      this.text2.setText(Phaser.Utils.String.Pad(this.moves, 2, '0', 1));
    }, this);

    this.input.keyboard.on('keydown-X', function () {
      this.moves -= 1;
      this.text2.setText(Phaser.Utils.String.Pad(this.moves, 2, '0', 1));
    }, this);
  }

  stopInputEvents() {
    this.input.off('gameobjectover', this.onIconOver);
    this.input.off('gameobjectout', this.onIconOut);
    this.input.off('gameobjectdown', this.onIconDown);
  }

  onIconOver(pointer, gameObject) {
    const icon = gameObject;

    const newColor = icon.getData('color');

    //  Valid color?
    if (newColor !== this.currentColor) {
      this.cursor.setFrame('cursor-over');
    } else {
      this.cursor.setFrame('cursor-invalid');
    }

    this.cursor.setPosition(icon.x + 48, icon.y + 48);

    if (this.cursorTween) {
      this.cursorTween.stop();
    }

    this.cursor.setAlpha(1);
    this.cursor.setVisible(true);

    //  Change arrow color
    this.arrow.setFrame(`arrow-${this.frames[newColor]}`);

    //  Jiggle the monster :)
    const monster = icon.getData('monster');

    this.children.bringToTop(monster);

    this.monsterTween = this.tweens.add({
      targets: monster,
      y: '-=24',
      yoyo: true,
      repeat: -1,
      duration: 300,
      ease: 'Power2',
    });
  }

  onIconOut(pointer, gameObject) {
    // console.log(this.monsterTween.targets[0].y);

    this.monsterTween.stop(0);

    gameObject.getData('monster').setY(gameObject.y);

    // console.log(this.monsterTween.targets[0].y);

    this.cursorTween = this.tweens.add({
      targets: this.cursor,
      alpha: 0,
      duration: 300,
    });

    this.arrow.setFrame('arrow-white');
  }

  onIconDown(pointer, gameObject) {
    if (!this.allowClick) {
      return;
    }

    const icon = gameObject;

    const newColor = icon.getData('color');

    //  Valid color?
    if (newColor === this.currentColor) {
      return;
    }

    const oldColor = this.grid[0][0].getData('color');

    if (oldColor !== newColor) {
      this.currentColor = newColor;

      this.matched = [];

      if (this.monsterTween) {
        this.monsterTween.stop(0);
      }

      this.cursor.setVisible(false);
      this.instructions.setVisible(false);

      this.moves -= 1;

      this.text2.setText(Phaser.Utils.String.Pad(this.moves, 2, '0', 1));

      this.floodFill(oldColor, newColor, 0, 0);

      if (this.matched.length > 0) {
        this.startFlow();
      }
    }
  }

  createEmitter(color) {
    this.emitters[color] = this.particles.createEmitter({
      frame: color,
      lifespan: 1000,
      speed: { min: 300, max: 400 },
      alpha: { start: 1, end: 0 },
      scale: { start: 0.5, end: 0 },
      rotate: { start: 0, end: 360, ease: 'Power2' },
      blendMode: 'ADD',
      on: false,
    });
  }

  startFlow() {
    this.matched.sort((a, b) => {
      const aDistance = Phaser.Math.Distance.Between(a.x, a.y, 166, 66);
      const bDistance = Phaser.Math.Distance.Between(b.x, b.y, 166, 66);

      return aDistance - bDistance;
    });

    //  Swap the sprites

    let t = 0;
    const inc = (this.matched.length > 98) ? 6 : 12;

    this.allowClick = false;

    for (let i = 0; i < this.matched.length; i += 1) {
      this.block = this.matched[i];

      this.blockColor = this.frames[this.block.getData('color')];
      this.oldBlockColor = this.frames[this.block.getData('oldColor')];

      const emitter = this.emitters[this.oldBlockColor];

      this.time.delayedCall(t, (block, blockColor) => {
        block.setFrame(blockColor);

        emitter.explode(6, block.x, block.y);
      }, [this.block, this.blockColor, emitter]);

      t += inc;
    }

    this.time.delayedCall(t, function () {
      this.allowClick = true;

      if (this.checkWon()) {
        this.gameWon();
        window.score = this.moves;
        window.submitted = false;
        window.idGame = 6;
      } else if (this.moves === 0) {
        this.gameLost();
      }
    }, [], this);
  }

  checkWon() {
    const topLeft = this.grid[0][0].getData('color');

    for (let x = 0; x < 14; x += 1) {
      for (let y = 0; y < 14; y += 1) {
        if (this.grid[x][y].getData('color') !== topLeft) {
          return false;
        }
      }
    }

    return true;
  }

  clearGrid() {
    //  Hide everything :)

    this.tweens.add({
      targets: [
        this.icon1.monster, this.icon1.shadow,
        this.icon2.monster, this.icon2.shadow,
        this.icon3.monster, this.icon3.shadow,
        this.icon4.monster, this.icon4.shadow,
        this.icon5.monster, this.icon5.shadow,
        this.icon6.monster, this.icon6.shadow,
        this.arrow,
        this.cursor,
      ],
      alpha: 0,
      duration: 500,
      delay: 500,
    });

    let i = 500;

    for (let y = 13; y >= 0; y -= 1) {
      for (let x = 0; x < 14; x += 1) {
        const block = this.grid[x][y];

        this.tweens.add({

          targets: block,

          scaleX: 0,
          scaleY: 0,

          ease: 'Power3',
          duration: 800,
          delay: i,

        });

        i += 10;
      }
    }

    return i;
  }

  gameLost() {
    this.stopInputEvents();

    this.text1.setText('Lost!');
    this.text2.setText(':(');

    const i = this.clearGrid();

    this.text3.setAlpha(0);
    this.text3.setVisible(true);

    this.tweens.add({
      targets: this.text3,
      alpha: 1,
      duration: 1000,
      delay: i,
    });

    this.input.once('pointerdown', this.resetGame, this);
  }

  resetGame() {
    this.text1.setText('Moves');
    this.text2.setText('00');
    this.text3.setVisible(false);

    //  Show everything :)

    this.arrow.setFrame('arrow-white');

    this.tweens.add({
      targets: [
        this.icon1.monster, this.icon1.shadow,
        this.icon2.monster, this.icon2.shadow,
        this.icon3.monster, this.icon3.shadow,
        this.icon4.monster, this.icon4.shadow,
        this.icon5.monster, this.icon5.shadow,
        this.icon6.monster, this.icon6.shadow,
        this.arrow,
        this.cursor,
      ],
      alpha: 1,
      duration: 500,
      delay: 500,
    });

    let i = 500;

    for (let y = 13; y >= 0; y -= 1) {
      for (let x = 0; x < 14; x += 1) {
        const block = this.grid[x][y];

        //  Set a new color
        const color = Phaser.Math.Between(0, 5);

        block.setFrame(this.frames[color]);

        block.setData('oldColor', color);
        block.setData('color', color);

        this.tweens.add({

          targets: block,

          scaleX: 1,
          scaleY: 1,

          ease: 'Power3',
          duration: 800,
          delay: i,

        });

        i += 10;
      }
    }

    //  Do a few floods just to make it a little easier starting off
    this.helpFlood();

    for (let k = 0; k < this.matched.length; k += 1) {
      this.block = this.matched[k];

      this.block.setFrame(this.frames[this.block.getData('color')]);
    }

    this.currentColor = this.grid[0][0].getData('color');

    this.movesTween = this.tweens.addCounter({
      from: 0,
      to: 25,
      ease: 'Power1',
      onUpdate(tween, targets, text) {
        text.setText(Phaser.Utils.String.Pad(tween.getValue().toFixed(), 2, '0', 1));
      },
      onUpdateParams: [this.text2],
      delay: i,
    });

    this.moves = 25;

    this.time.delayedCall(i, this.startInputEvents, [], this);
  }

  gameWon() {
    this.stopInputEvents();

    this.text1.setText('Won!!');
    this.text2.setText(':)');

    const i = this.clearGrid();

    //  Put the winning monster in the middle

    const monster = this.add.image(400, 300, 'flood', `icon-${this.frames[this.currentColor]}`);

    monster.setScale(0);

    this.tweens.add({
      targets: monster,
      scaleX: 4,
      scaleY: 4,
      angle: 360 * 4,
      duration: 1000,
      delay: i,
    });

    this.time.delayedCall(2000, this.boom, [], this);
  }

  boom() {
    let color = Phaser.Math.RND.pick(this.frames);

    this.emitters[color].explode(8, Phaser.Math.Between(128, 672), Phaser.Math.Between(28, 572));

    color = Phaser.Math.RND.pick(this.frames);

    this.emitters[color].explode(8, Phaser.Math.Between(128, 672), Phaser.Math.Between(28, 572));

    this.time.delayedCall(100, this.boom, [], this);
  }

  floodFill(oldColor, newColor, x, y) {
    if (oldColor === newColor || this.grid[x][y].getData('color') !== oldColor) {
      return;
    }

    this.grid[x][y].setData('oldColor', oldColor);
    this.grid[x][y].setData('color', newColor);

    if (this.matched.indexOf(this.grid[x][y]) === -1) {
      this.matched.push(this.grid[x][y]);
    }

    if (x > 0) {
      this.floodFill(oldColor, newColor, x - 1, y);
    }

    if (x < 13) {
      this.floodFill(oldColor, newColor, x + 1, y);
    }

    if (y > 0) {
      this.floodFill(oldColor, newColor, x, y - 1);
    }

    if (y < 13) {
      this.floodFill(oldColor, newColor, x, y + 1);
    }
  }
}
