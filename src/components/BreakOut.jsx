import React from 'react';
import Phaser from 'phaser';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from 'react-bootstrap';
import BreakOut from './BreakOut/breakout';
import PhaserBro from '../assets/PhaserBro.gif';

const { saveScore } = require('../helpers/helpers.js');

const Snake = React.memo(({ user }) => {
  const descriptionStyle = {
    float: 'right',
    marginTop: '50px',
  };

  const config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    parent: 'phaser-game',
    physics: {
      default: 'arcade',
    },
  };
  if (!Array.isArray(user)) {
    const game = new Phaser.Game(config);
    game.scene.add('BreakOut', BreakOut);
    game.scene.start('BreakOut');
  }

  const notify = () => toast(`Your Score of ${window.score} Was Submitted!`);

  const scoreError = () => toast('There was an error submitting your score!');

  const alreadySubmitted = () => toast(`Score of ${window.score} already submitted!`);

  const submitScore = () => {
    const scoreObj = {
      idUser: user.idUser,
      idGame: 4,
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
  };

  // const redirect = 'https://phaserbros.com/join';
  const handleSubmit = () => {
    window.open('https://phaserbros.com/join', 'chat-window', 'height=900,width=750'); return false;
  };

  // const handleRedirect = () => {
  //   window.open('http://localhost:8080/join', 'new-chat', 'height=900,width=750'); return false;
  // };

  return (
    <div id="phaser-game">
      <br />
      {!Array.isArray(user) ? (
        <div style={descriptionStyle}>
          <h4>Breakout!</h4>
          <p>
            Use the paddle to blast
            <br />
            apart all the blocks
            <br />
            Join the Leader Board by submitting
            <br />
            your score!
          </p>
          <br />
          <h4>Controls</h4>
          <p>
            Mouse: Controls the paddle
          </p>
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

Snake.propTypes = {
  user: PropTypes.objectOf.isRequired,
};

export default Snake;
