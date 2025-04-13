import React from "react";

import "./Appbar.css";
import useAuth from "../../util/useAuth";
import Button from "../Button/Button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../Services/authServices";

const Appbar = () => {
  const isLoggedIn = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div className="appbar">
      <div className="appbar__inner">
        <div className="appbar__logo">
          <img src={`${process.env.PUBLIC_URL}/assets/images/logo.png`} alt="Logo" />
          <h1 className="app-title">LinkTracker</h1>
        </div>

        <div className="appbar__menus">
          <Link 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
            to="/"
          >
            <i className="fa fa-chart-bar"></i> Dashboard
          </Link>
          <Link 
            className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`} 
            to="/profile"
          >
            <i className="fa fa-user"></i> Profile
          </Link>

          {isLoggedIn ? (
            <Button
              label="Logout"
              variant="outlined-secondary"
              onClick={() => logout(navigate)}
            />
          ) : (
            <Button
              label="Login"
              variant="primary"
              onClick={() => navigate("/login")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Appbar;
