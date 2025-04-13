import React from "react";
import TextInput from "../../components/TextInput/TextInput";
import Button from "../../components/Button/Button";
import { Link, useNavigate } from "react-router-dom";

import "./auth.css";
import { login } from "../../Services/authServices";
const Login = () => {
  const [loginPayload, setLoginPayload] = React.useState({
    fullName: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__logo">
          <img src={`${process.env.PUBLIC_URL}/assets/images/logo.png`} alt="Logo" />
          <h1 className="auth__title">ShortifyLink</h1>
        </div>
        <p className="auth__subtitle">Sign in to your account</p>
        <div className="auth__form">
          <TextInput
            label="Email"
            value={loginPayload.email}
            onChange={(val) =>
              setLoginPayload({
                ...loginPayload,
                email: val.toLocaleString(),
              })
            }
            placeholder="yourname@email.com"
          />
          <TextInput
            label="Password"
            value={loginPayload.password}
            onChange={(val) =>
              setLoginPayload({
                ...loginPayload,
                password: val.toLocaleString(),
              })
            }
            type="password"
          />
        </div>
        <div className="auth__action">
          <Button label="Login" onClick={() => login(loginPayload, navigate)} />
          <p>
            No account yet? <Link to="/signup">Signup</Link>{" "}
          </p>
          <p>
            {" "}
            <Link to="/forgot-password">Forgot password?</Link>{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
