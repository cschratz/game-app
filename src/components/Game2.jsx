import React, { useEffect, useState } from 'react';
import Phaser from 'phaser';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from 'react-bootstrap';
import GameTwo from '../Game2/scenes/GameTwo';
import PhaserBro from '../assets/PhaserBro.gif';
import TitleScene from '../Game2/scenes/TitleScene';
import GameOver from '../Game2/scenes/GameOver';

const { saveScore } = require('../helpers/helpers.js');

const Game2 = React.memo(({ user }) => {
  const [count, setCount] = useState(0);
  const [room, setRoom] = useState('');

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
  if (!Array.isArray(user) && count === 0) {
    const game = new Phaser.Game(config);
    game.scene.add('GameTwo', GameTwo);
    game.scene.add('TitleScene', TitleScene);
    game.scene.add('gameOver', GameOver);
    game.scene.start('TitleScene', { room });
    setCount(1);
  }

  useEffect(() => {
    setRoom(window.location.href.split('?')[1]);
  }, []);

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
          <h4>Star Hunter</h4>
          <p>
            Get your team to 250 points!
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
          </p>
          <br />
          <br />
          <Button onClick={handleSubmit} variant="primary">
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

export default Game2;

Game2.propTypes = {
  user: PropTypes.objectOf.isRequired,
};
