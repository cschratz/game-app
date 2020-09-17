import React from 'react';
import Phaser from 'phaser';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from 'react-bootstrap';
import PlayScene from '../Game/scenes/playScenes';
import PreloadScene from '../Game/scenes/PreloadScene';
import GameOverScene from '../Game/scenes/GameOver';
import PhaserBro from '../assets/PhaserBro.gif';

const { saveScore } = require('../helpers/helpers.js');

const SpaceBlaster = React.memo(({ user }) => {
  const descriptionStyle = {
    float: 'right',
    marginTop: '50px',
  };
  const config = {
    width: 800,
    height: 600,
    type: Phaser.AUTO,
    parent: 'phaser-game',
    audio: {
      disableWebAudio: true,
    },
    physics: {
      default: 'arcade',
      arcade: {
        fps: 60,
        gravity: { y: 0 },
      },
    },
  };
  if (!Array.isArray(user)) {
    const game = new Phaser.Game(config);
    game.scene.add('PlayScene', PlayScene);
    game.scene.add('preload', PreloadScene);
    game.scene.add('gameOver', GameOverScene);
    game.scene.start('preload');
  }

  const notify = () => toast(`Your Score of ${window.score} Was Submitted!`);

  const scoreError = () => toast('There was an error submitting your score!');

  const alreadySubmitted = () => toast(`Score of ${window.score} already submitted!`);

  const submitScore = () => {
    if (window.score) {
      const scoreObj = {
        idUser: user.idUser,
        idGame: window.idGame,
        value: window.score,
      };
      if (window.submitted === false) {
        saveScore(scoreObj)
          .then((score) => {
            if (score) {
              notify();
            }
          })
          .then(() => {
            window.submitted = true;
          })
          .catch(() => {
            scoreError();
          });
      } else if (window.submitted === true) {
        alreadySubmitted();
      }
    } else if (!window.score) {
      scoreError();
    }
  };

  // const redirect = 'https://phaserbros.com/join';
  const handleSubmit = () => {
    window.open('https://phaserbros.com/join', 'chat-window', 'height=900,width=750'); return false;
  };

  // const redirect = process.env.REACT_APP_CHAT || 'https://phaserbros.com/join';
  // const handleSubmit = () => {
  //   window.open(`${redirect}`, 'chat-window', 'height=900,width=750'); return false;
  // };

  return (
    <div id="phaser-game">
      <br />
      {!Array.isArray(user) ? (
        <div style={descriptionStyle}>
          <h4>Space Blaster</h4>
          <p>
            Destroy asteroids and aliens to
            <br />
            increase your score!
            <br />
            Join the Leader Board by submitting
            <br />
            your score!
          </p>
          <br />
          <br />
          <h4>Controls</h4>
          <p>
            Arrow keys: Navigate your ship
            <br />
            Spacebar: Fire your lasers
            <br />
            Shift: Launch a salvo of missiles
          </p>
          <br />
          <br />
          <Button onClick={handleSubmit} variant="danger">
            <h6>Live Game Chat</h6>
          </Button>
          <br />
          <div>
            <Button onClick={submitScore} variant="danger">
              <h6>Submit Your Score!</h6>
            </Button>
            <ToastContainer />
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', height: '64vh' }}>
          <h1>Please Login With Discord or Google</h1>
          <img src={PhaserBro} alt="PhaserBro" />
        </div>
      ) }
      <br />
    </div>
  );
});

SpaceBlaster.propTypes = {
  user: PropTypes.objectOf.isRequired,
};

export default SpaceBlaster;
