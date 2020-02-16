import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

import './SluglineNav.scss';
import { useAuth } from "../auth/AuthProvider";

const SluglineNav = () => {
    const auth = useAuth();

    const onLoginClick = () => {
        auth.login('admin', 'admin').then(() => {
            console.log('LOGIN COMPLETE');
            console.log(auth.user);
        });
    }

    const onLogoutClick = () => {
        auth.logout().then(() => {
            console.log('LOGOUT COMPLETE');
        })
    }

    return (
        <Navbar variant="dark" expand="lg" className="blackbox">
            <Navbar.Toggle aria-controls="slugline-nav" />
            <Navbar.Collapse id="slugline-nav">
                <Nav className="w-100" justify>
                    <Nav.Item>
                        <Link to="/" className="nav-link"><h4>Home</h4></Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Link to="/issues" className="nav-link"><h4>Issues</h4></Link>
                    </Nav.Item>
                    <Nav.Item>
                        {auth.isAuthenticated()
                            ? <a href="#" className="nav-link" onClick={onLoginClick}>
                                <h4>Login</h4>
                            </a>
                            : <a href="#" className="nav-link" onClick={onLogoutClick}>
                                <h4>Logout</h4>
                            </a>
                        }
                    </Nav.Item>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    )
}

export default SluglineNav;
