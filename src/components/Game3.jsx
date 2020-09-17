import React from 'react';
import Phaser from 'phaser';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from 'react-bootstrap';
import GameThree from '../Game3/GameThree';
import TitleScene from '../Game3/scenes/TitleScene';
import GameOverScene from '../Game3/scenes/GameOverScene';
import PhaserBro from '../assets/PhaserBro.gif';

const { saveScore } = require('../helpers/helpers.js');

const Game3 = React.memo(({ user }) => {
  const descriptionStyle = {
    float: 'right',
    marginTop: '50px',
  };
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-game',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300 },
        debug: false,
      },
    },
  };
  if (!Array.isArray(user)) {
    const game = new Phaser.Game(config);
    game.scene.add('titleScene', TitleScene);
    game.scene.add('GameThree', GameThree);
    game.scene.add('gameOverScene', GameOverScene);
    // game.scene.start('GameThree');
    game.scene.start('titleScene');
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

  // const redirect = process.env.REACT_APP_CHAT || 'https://phaserbros.com/join';
  // const handleSubmit = () => {
  //   window.open(`${redirect}`, 'chat-window', 'height=900,width=750'); return false;
  // };

  const handleSubmit = () => {
    window.open('https://phaserbros.com/join', 'chat-window', 'height=900,width=750'); return false;
  };

  return (
    <div id="phaser-game">
      <br />
      {!Array.isArray(user) ? (
        <div style={descriptionStyle}>
          <h4>Star Pickup</h4>
          <p>
            Collect stars and avoid dangers!
            <br />
            Join the Leader Board by submitting
            <br />
            your score!
          </p>
          <br />
          <br />
          <h4>Controls</h4>
          <p>
            Arrow keys: Move your avatar
            <br />
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

export default Game3;

Game3.propTypes = {
  user: PropTypes.objectOf.isRequired,
};
