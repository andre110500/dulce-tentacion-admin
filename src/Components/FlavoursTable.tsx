import React from "react";

import { useState, useEffect, useContext, useRef } from "react";
import FlavoursContext from "../Contexts/FlavoursContext";
import gear from "../assets/gear.svg";
import FlavoursMenu from "./FlavoursMenu";

import { FlavourDialog } from "./FlavourDialog";

import spinner from "../assets/spinner.svg";
import ShareMenuSection from "./ShareMenuSection";
const apiUrl = import.meta.env.VITE_API_URL;

export default function FlavoursTable() {
  const [dbFlavoursArr, setDbFlavoursArr] = useState();

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
      setIsLoading(false);
      // Process the data or perform other operations
    } catch (error) {
      console.error("Error:", error);
    }
  }

  useEffect(() => {
    fetchFlavoursAndSetState();
  }, []);

  const table = (
    <table>
      <thead>
        <tr>
          <th>Sabor</th>
          <th>OutOfStock</th>
          <th>
            <img src={gear} alt="" />
          </th>
        </tr>
      </thead>
      <tbody>
        {dbFlavoursArr?.map((flavour) => (
          <tr key={`flavour-row-${flavour._id}`}>
            <td className="flavour" data-cell="name">{`${flavour.name}`}</td>
            <td data-cell="outOfStock">{`${flavour.outOfStock}`}</td>

            <td data-cell="Edit">
              <FlavourDialog flavour={flavour} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <FlavoursContext.Provider
      value={{
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
            <FlavourDialog />
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
    </FlavoursContext.Provider>
  );
}
