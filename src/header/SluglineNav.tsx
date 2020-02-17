import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

import "./SluglineNav.scss";
import { useAuth } from "../auth/AuthProvider";

const SluglineNav = () => {
  const auth = useAuth();

  return (
    <Navbar variant="dark" expand="lg" className="blackbox">
      <Navbar.Toggle aria-controls="slugline-nav" />
      <Navbar.Collapse id="slugline-nav">
        <Nav className="w-100" justify>
          <Nav.Item>
            <Link to="/" className="nav-link">
              <h4>Home</h4>
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/issues" className="nav-link">
              <h4>Issues</h4>
            </Link>
          </Nav.Item>
          <Nav.Item>
            {auth.isAuthenticated() ? (
              <Link to="/" onClick={() => auth.logout()} className="nav-link">
                <h4>Logout</h4>
              </Link>
            ) : (
              <Link to="/login" className="nav-link">
                <h4>Login</h4>
              </Link>
            )}
          </Nav.Item>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default SluglineNav;
