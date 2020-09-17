import React from 'react';
import Phaser from 'phaser';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from 'react-bootstrap';
import PhaserBro from '../assets/PhaserBro.gif';
import Boot from '../AvoidTheGerms/Boot';
import Preloader from '../AvoidTheGerms/Preloader';
import MainMenu from '../AvoidTheGerms/MainMenu';
import MainGame from '../AvoidTheGerms/Game';

const { saveScore } = require('../helpers/helpers.js');

const Germs = React.memo(({ user }) => {
  const descriptionStyle = {
    float: 'right',
    marginTop: '50px',
  };
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    parent: 'phaser-game',
    scene: [Boot, Preloader, MainMenu, MainGame],
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
  };
  if (!Array.isArray(user)) {
    const game = new Phaser.Game(config);
    console.log(game);
  }

  const notify = () => toast(`Your Score of ${window.score} Was Submitted!`);

  const scoreError = () => toast('There was an error submitting your score!');

  const submitScore = () => {
    const scoreObj = {
      idUser: user.idUser,
      idGame: 1,
      value: window.score,
    };
    saveScore(scoreObj)
      .then((score) => {
        if (score) {
          notify();
        }
      })
      .catch(() => {
        scoreError();
      });
  };

  // const redirect = 'https://phaserbros.com/join';
  // const handleSubmit = () => {
  //   window.open('https://phaserbros.com/join', 'chat-window', 'height=900,width=750'); return false;
  // };

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
          <h4>Germs!</h4>
          <p>
            Collect rings to increase your score!
            <br />
            Join the Leader Board by submitting
            <br />
            your score!
          </p>
          <br />
          <br />
          <h4>Controls</h4>
          <p>
            Mouse: Move your germ!
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

export default Germs;

Germs.propTypes = {
  user: PropTypes.objectOf.isRequired,
};
