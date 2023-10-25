import React from "react";

import { useState, useEffect, useContext, useRef } from "react";
import ListContext from "../Contexts/FlavoursContext";

import FlavoursMenu from "./FlavoursMenu";

import { FlavourDialog } from "./FlavourDialog";

import spinner from "../assets/spinner.svg";
import ShareMenuSection from "./ShareMenuSection";
const apiUrl = import.meta.env.VITE_API_URL;

export default function FlavoursTable() {
  const [dbFlavoursArr, setDbFlavoursArr] = useState();
  const [virtualFlavoursArr, setVirtualFlavoursArr] = useState();
  const flavoursMenuRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchFlavoursAndSetState() {
    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const response = await fetch(`${apiUrl}/flavours`, requestOptions);
      if (!response.ok) {
        throw new Error("Request failed");
      }

      const products = await response.json();

      setDbFlavoursArr(products);

      // Process the data or perform other operations
    } catch (error) {
      console.error("Error:", error);
    }
  }

  useEffect(() => {
    fetchFlavoursAndSetState();
  }, []);

  useEffect(() => {
    if (dbFlavoursArr) {
      setVirtualFlavoursArr(dbFlavoursArr);
      setIsLoading(false);
    }
  }, [dbFlavoursArr]);

  const table = (
    <table>
      <thead>
        <tr>
          <th>Sabor</th>
          <th>OutOfStock</th>
        </tr>
      </thead>
      <tbody>
        {virtualFlavoursArr?.map((virtualFlavour) => (
          <tr key={`flavour-row-${virtualFlavour._id}`}>
            <td>{`${virtualFlavour.name}`}</td>
            <td>{`${virtualFlavour.outOfStock}`}</td>

            <td>
              <FlavourDialog virtualFlavour={virtualFlavour} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <ListContext.Provider
      value={{
        virtualFlavoursArr,
        setVirtualFlavoursArr,
        fetchFlavoursAndSetState,
        dbFlavoursArr,
      }}
    >
      <section>
        <h1>Sabores</h1>

        {isLoading ? (
          <img src={spinner} className="spinner" alt="spinner" />
        ) : (
          <>
            <div className="table-container">{table}</div>
            <FlavourDialog virtualFlavour={undefined} />
          </>
        )}
      </section>
      {isLoading ? (
        "Loading"
      ) : (
        <ShareMenuSection targetElementRef={flavoursMenuRef}>
          <FlavoursMenu refe={flavoursMenuRef} flavoursList={dbFlavoursArr} />
        </ShareMenuSection>
      )}
    </ListContext.Provider>
  );
}
