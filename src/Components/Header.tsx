import React, { useState, useContext } from "react";

import logo from "../assets/react.svg";
import LogoutButton from "./LogoutButton";
import UserContext from "../Contexts/UserContext";

const tabsArr = ["a", "b", "c"];

export default function Header() {
  const { isUserOnline, setIsUserOnline } = useContext(UserContext);
  return (
    <section id="header">
      <a className="logo" href="">
        <img src={logo} alt="" />
      </a>
      <nav>
        <ul>
          <li>
            {isUserOnline ? (
              <LogoutButton setIsUserOnline={setIsUserOnline} />
            ) : (
              <button> Sign Up</button>
            )}
          </li>
        </ul>
      </nav>

      <input type="checkbox" id="checkbox" />

      <Sidebar />
      <label className="burger-menu" htmlFor="checkbox"></label>
    </section>
  );
}

function Sidebar() {
  return (
    <aside>
      <ul>
        {tabsArr.map((tab) => (
          <li>
            <a href="#">{tab}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
