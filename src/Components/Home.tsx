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
  return (
    <>
      <Table />
      <FlavoursList />
    </>
  );
}
