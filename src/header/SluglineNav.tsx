import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";
import { useToast } from "../shared/contexts/ToastContext";

import "./SluglineNav.scss";

const LoginLogoutLink = () => {
  const auth = useAuth();
  const toast = useToast();

  return (
    <Nav.Item>
      {auth.isAuthenticated() ? (
        <NavLink
          to="/"
          text="Logout"
          onClick={() => {
            auth.logout().then(
              () => {
                toast.addToasts([
                  {
                    id: Math.random.toString(),
                    body: "Logout successful!",
                    delay: 3000
                  }
                ]);
              },
              (errors: string[]) => {
                toast.addToasts(
                  errors.map(e => ({
                    id: Math.random.toString(),
                    title: "Logout error",
                    body: e,
                    delay: 3000
                  }))
                );
              }
            );
          }}
        />
      ) : (
        <NavLink to="/login" text="Login" />
      )}
    </Nav.Item>
  );
};

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
        <Navbar.Brand as={Link} to="/" href="/">
          <span className="mathnews-logo" />
        </Navbar.Brand>
        <Navbar.Toggle
          className="custom-toggler"
          aria-controls="slugline-nav"
        />
        <Navbar.Collapse id="slugline-nav">
          <Nav>
            <NavLink text="Home" to="/" />
            <NavLink text="Issues" to="/issues" />
            {auth.isAuthenticated() && <NavLink text="Dash" to="/dash" />}
            {auth.isAuthenticated() && <NavLink text="Profile" to="/profile" />}
            {auth.isEditor() && <NavLink text="admin" to="/admin" />}
            <LoginLogoutLink />
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default SluglineNav;
