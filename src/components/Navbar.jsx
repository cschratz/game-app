import React, { useState } from 'react';
import {
  Nav, Navbar, Modal,
} from 'react-bootstrap';

const { getAuth, getUserData } = require('../helpers/helpers.js');

const NavBar = () => {
  const [show, setShow] = useState(false);

  const handleShow = () => {
    setShow(true);
  };
  const handleClose = () => setShow(false);

  return (
    <Navbar bg="dark" variant="dark">
      <Nav className="mr-auto">
        <Navbar.Brand href="/">
          <h3>GameTime</h3>
        </Navbar.Brand>
        <Nav.Link onClick={handleShow}>
          <h3>HighScore</h3>
        </Nav.Link>
        <Nav.Link href="/game">
          <h3>Game</h3>
        </Nav.Link>
        <Nav.Link href="/forum">
          <h3>Forum</h3>
        </Nav.Link>
        <Nav.Link href="/profile">
          <h3>Profile</h3>
        </Nav.Link>
        <Nav.Link href="/api">
          <h3>Login</h3>
        </Nav.Link>
      </Nav>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>High Scores!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            <li>Grant: 10,000</li>
            <li>James: 5,000</li>
            <li>Ben: 4,500</li>
            <li>Connor: 500</li>
          </ul>
        </Modal.Body>
      </Modal>
    </Navbar>
  );
};

export default NavBar;

// { /* // <MDBNavbar color="unique-color-dark" dark>
// //   <MDBNavbarBrand href="/">
// //     <h3>GameTime</h3>
// //   </MDBNavbarBrand>
// //   <MDBNavLink to="/game">
// //     <h3>Game</h3>
// //   </MDBNavLink>
// // </MDBNavbar> */ }
