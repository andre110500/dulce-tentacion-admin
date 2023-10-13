import React, { useState, useContext } from "react";
import Signup from "./Signup";
import Signin from "./Signin";
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
          {isUserOnline ? (
            <li>
              <LogoutButton setIsUserOnline={setIsUserOnline} />
            </li>
          ) : (
            <>
              <li>
                <Signup />
              </li>
              <li>
                <Signin setIsUserOnline={setIsUserOnline} />
              </li>
            </>
          )}
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
