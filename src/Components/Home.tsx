import React from "react";
import { useState, useEffect } from "react";
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Signin from "./Signin";
import Signup from "./Signup";
import LogoutButton from "./LogoutButton";
import Table from "./Table";
import ProductsMenu from "./ProductsMenu";
import FlavoursList from "./FlavoursList";
export default function Home() {
  const [isUserOnline, setIsUserOnline] = useState(false);
  const isProduction = process.env.NODE_ENV === "production";

  async function checkTokenValidityAndSetUserOnlineStatus(token) {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`, // Add the JWT to the Authorization header
      },
    };
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/users/auth`, requestOptions);
      if (!response.ok) {
        setIsUserOnline(false);
        throw new Error("Request failed");
      }
      console.log("auth succeded, setting user state to online!");
      setIsUserOnline(true);

      // Process the data or perform other operations
    } catch (error) {
      console.error("Error:", error);
      setIsUserOnline(false);
    }
  }

  //at page load
  //if token at localStorage
  ////////use server to check it
  ////////if valid
  //////////////set isUserOnline to true
  useEffect(() => {
    const token = localStorage.getItem("jwtToken")
      ? JSON.parse(localStorage.getItem("jwtToken"))?.token
      : undefined;

    if (token) {
      // check if token is valid

      checkTokenValidityAndSetUserOnlineStatus(token);
    } else {
      setIsUserOnline(false);
    }
  }, []);

  return (
    <>
      <div>
        Home
        {!isUserOnline ? (
          <div>
            {!isProduction && <Signup />}

            <Signin setIsUserOnline={setIsUserOnline} />
          </div>
        ) : (
          <div>
            <LogoutButton setIsUserOnline={setIsUserOnline} />

            <Table />
            <FlavoursList />
          </div>
        )}
      </div>
    </>
  );
}
