import React, { useState, useContext } from "react";
import Signup from "./Signup";
import Signin from "./Signin";
import logo from "../assets/react.svg";
import LogoutButton from "./LogoutButton";
import UserContext from "../Contexts/UserContext";

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
    </ul>
  );
  return (
    <section id="header">
      <a className="logo" href="">
        <img src={logo} alt="" />
      </a>
      <nav>{tabs}</nav>

      <input type="checkbox" id="checkbox" />

      <aside>{tabs}</aside>
      <label className="burger-menu" htmlFor="checkbox"></label>
    </section>
  );
}
