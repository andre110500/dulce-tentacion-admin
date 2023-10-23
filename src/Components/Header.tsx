import React, { useState, useContext } from "react";
import Signup from "./Signup";
import Signin from "./Signin";

import LogoutButton from "./LogoutButton";
import UserContext from "../Contexts/UserContext";
import logo from "../assets/logo-white.png";

export default function Header() {
  const { isUserOnline, setIsUserOnline } = useContext(UserContext);

  const tabs = (
    <ul>
      {isUserOnline ? (
        <li>
          <LogoutButton setIsUserOnline={setIsUserOnline} />
        </li>
      ) : (
        <>
          {process.env.NODE_ENV == "production" ? (
            ""
          ) : (
            <li>
              <Signup />
            </li>
          )}
          <li>
            <Signin setIsUserOnline={setIsUserOnline} />
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
