import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";

import "./SluglineNav.scss";

interface NavLinkProps {
  to: string;
  onClick?: () => void;
  text: string;
}

// React Router's links and Bootstrap's navbar links don't play together too nicely,
// so try and mash them together here
const NavLink: React.FC<NavLinkProps> = props => {
  const { text, ...rest } = props;
  return (
    <Nav.Item>
      <Link {...rest} className="nav-link h4">
        {props.text}
      </Link>
    </Nav.Item>
  );
};

const SluglineNav = () => {
  const auth = useAuth();

  return (
    <Navbar bg="primary" expand="lg">
      <div className="container nav-container">
        <Navbar.Brand href="/">
          <span className="mathnews-logo" />
        </Navbar.Brand>
        <Navbar.Toggle
          className="custom-toggler"
          aria-controls="slugline-nav"
        />
        <Navbar.Collapse id="slugline-nav">
          <Nav className="mr-auto">
            <NavLink to="/" text="Home" />
            <NavLink to="/issues" text="Issues" />
            {auth.isAuthenticated() && <NavLink to="/dash" text="Dash" />}
            {auth.isAuthenticated() ? (
              <NavLink
                to="/"
                text="Logout"
                onClick={() => {
                  auth.logout();
                }}
              />
            ) : (
              <NavLink to="/login" text="Login" />
            )}
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default SluglineNav;
