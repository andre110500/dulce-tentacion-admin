import React, { useState, useRef, useContext } from "react";
import Signup from "./Signup";
import Signin from "./Signin";

import LogoutButton from "./LogoutButton";
import UserContext from "../Contexts/UserContext";
import logo from "../assets/logo-white.png";

export default function Header() {
  const { isUserOnline, setIsUserOnline } = useContext(UserContext);
  const signupDialogRef = useRef(null);
  const signinDialogRef = useRef(null);
  const tabs = (
    <ul>
      {isUserOnline ? (
        <li>
          <LogoutButton setIsUserOnline={setIsUserOnline} />
        </li>
      ) : (
        <>
          {process.env.NODE_ENV !== "production" && (
            <li>
              <button
                onClick={() => {
                  signupDialogRef.current.showModal();
                }}
              >
                Crea una cuenta
              </button>
            </li>
          )}
          <li>
            <button
              onClick={() => {
                signinDialogRef.current.showModal();
              }}
            >
              Inicia sesión
            </button>
          </li>
        </>
      )}
      <li>
        <a
          href="https://dulce-tentacion-mp.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tienda
        </a>
      </li>
    </ul>
  );
  return (
    <section id="header">
      <SignupDialog signupDialogRef={signupDialogRef} />
      <SigninDialog
        signinDialogRef={signinDialogRef}
        setIsUserOnline={setIsUserOnline}
      />
      <img
        className="logo"
        onClick={() => {
          window.scrollTo(0, 0);
        }}
        src={logo}
        alt=""
      />

      <nav>{tabs}</nav>

      <input type="checkbox" id="checkbox" />

      <aside>{tabs}</aside>
      <label className="burger-menu" htmlFor="checkbox"></label>
    </section>
  );
}

function SigninDialog({ signinDialogRef, setIsUserOnline }) {
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameRef.current.value,
        password: passwordRef.current.value,
      }),
    };
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/users/signin`, requestOptions);

    if (response.ok) {
      const token = await response.json();

      // Convert the JWT token to a string
      const tokenString = JSON.stringify(token);

      // Save the JWT token string to local storage
      localStorage.setItem("jwtToken", tokenString);
      setIsUserOnline(true);
      /*   closeDialog(); */
      showWelcomeAlert();
    } else {
      if (response.status === 404) {
        /* closeDialog(); */
        show_Alert("Usuario no encontrado");
        // user not found
      }
      if (response.status === 401) {
        //user found but the password doesnt match
        /*   closeDialog(); */
        show_Alert("Contrasenia incorrecta");
      }
    }
  }

  return (
    <dialog ref={signinDialogRef} className="user">
      <div className="content">
        <h2>Inicia sesión</h2>
        <form id="signin-form" onSubmit={handleSubmit}>
          <input
            ref={usernameRef}
            name="username"
            placeholder="username"
            required
          />

          <input
            ref={passwordRef}
            name="password"
            placeholder="password"
            required
          />
        </form>
        <div className="buttons-container">
          <button type="submit" form="signin-form">
            Ok
          </button>
          <button
            onClick={() => {
              signinDialogRef.current.close();
            }}
          >
            Salir
          </button>
        </div>
      </div>
    </dialog>
  );
}

function SignupDialog({ signupDialogRef }) {
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameRef.current.value,
        password: passwordRef.current.value,
      }),
    };
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/users/signup`, requestOptions);

    if (response.ok) {
      alert("account created");
      /*  closeDialog(); */
    } else {
      alert(response.statusText);
    }
  }
  return (
    <dialog ref={signupDialogRef} className="user">
      <div className="content">
        <h2>Sign up</h2>
        <form id="signup-form" onSubmit={handleSubmit}>
          <input ref={usernameRef} placeholder="user name" required />
          <input ref={passwordRef} placeholder="password" required />
        </form>
        <div className="buttons-container">
          <button type="submit" form="signup-form">
            Ok
          </button>
          <button
            onClick={() => {
              signupDialogRef.current.close();
            }}
          >
            Salir
          </button>
        </div>
      </div>
    </dialog>
  );
}
