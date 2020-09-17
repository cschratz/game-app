import React from 'react';
import Phaser from 'phaser';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from 'react-bootstrap';
import flood from '../Flood/Flood';
import PhaserBro from '../assets/PhaserBro.gif';

const { saveScore } = require('../helpers/helpers.js');

const Flood = React.memo(({ user }) => {
  const descriptionStyle = {
    float: 'right',
    marginTop: '50px',
  };
  const config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    pixelArt: true,
    parent: 'phaser-game',
  };
  if (!Array.isArray(user)) {
    const game = new Phaser.Game(config);
    game.scene.add('flood', flood);
    game.scene.start('flood');
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
          <h4>Flood Fill</h4>
          <p>
            Starting from the top left, flood the
            <br />
            box all one color in 25 moves or less!
            <br />
            The more moves you have left, the higher
            <br />
            your score!
          </p>
          <br />
          <br />
          <h4>Controls</h4>
          <p>
            Click a monster to fill with its color!
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

Flood.propTypes = {
  user: PropTypes.objectOf.isRequired,
};

export default Flood;
