/**
 * goosePRESS is a news publishing platform.
 * Copyright (C) 2020-2021  Kevin Trieu, Terry Chen, Yang Zhong
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/Auth";
import { useToast } from "../shared/contexts/ToastContext";

import { ReactComponent as Logo } from "../logo.svg";
import "./styles/SluglineNav.scss";
import { inverseMode, useTheme } from "../shared/contexts/ThemeContext";
import Button from "../shared/components/Button";

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
                    delay: 3000,
                  },
                ]);
              },
              (errors: string[]) => {
                toast.addToasts(
                  errors.map((e) => ({
                    id: Math.random.toString(),
                    title: "Logout error",
                    body: e,
                    delay: 3000,
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
const NavLink: React.FC<NavLinkProps> = (props) => {
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
  const { mode, setMode } = useTheme();

  return (
    <Navbar className="SluglineNav" expand="lg">
      <div className="container nav-container">
        <Navbar.Brand as={Link} to="/" href="/">
          <Logo height={28} className="navbar-logo align-top" />
        </Navbar.Brand>
        <Navbar.Toggle className="custom-toggler" aria-controls="header-nav" />
        <Navbar.Collapse id="header-nav">
          <Nav>
            <NavLink text="Home" to="/" />
            <NavLink text="Issues" to="/issues" />
            {auth.isAuthenticated() && <NavLink text="Dash" to="/dash" />}
            {auth.isAuthenticated() && (
              <NavLink text="Profile" to="/dash/profile" />
            )}
            {auth.isEditor() && <NavLink text="admin" to="/dash/admin" />}
            <LoginLogoutLink />
            <Button
              variant="secondary"
              onClick={() => {
                setMode(inverseMode[mode]);
              }}
            >
              {inverseMode[mode]} mode
            </Button>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default SluglineNav;
