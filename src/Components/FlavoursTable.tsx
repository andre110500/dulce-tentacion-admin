import React from "react";
import callToApi from "../functions/callToApi";
import { useState, useEffect, useContext, useRef } from "react";
import ListContext from "../Contexts/FlavoursContext";
import { showConfirmAlert } from "../alerts";
import FlavoursMenu from "./FlavoursMenu";

import { FlavourDialog } from "./FlavourDialog";
import { toPng } from "html-to-image";
import spinner from "../assets/spinner.svg";
const apiUrl = import.meta.env.VITE_API_URL;

export default function FlavoursTable() {
  const [dbFlavoursArr, setDbFlavoursArr] = useState();
  const [virtualFlavoursArr, setVirtualFlavoursArr] = useState();
  const elementRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const htmlToImageConvert = () => {
    toPng(elementRef.current, { cacheBust: false })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "my-image-name.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  };

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
          <tr>
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
    <>
      <section>
        <h1>Sabores</h1>

        {isLoading ? (
          <img src={spinner} className="spinner" alt="spinner" />
        ) : (
          <ListContext.Provider
            value={{
              virtualFlavoursArr,
              setVirtualFlavoursArr,
              fetchFlavoursAndSetState,
              dbFlavoursArr,
            }}
          >
            <div className="table-container">{table}</div>
            <FlavourDialog virtualFlavour={undefined} />
          </ListContext.Provider>
        )}
      </section>
      <section>
        <FlavoursMenu refe={elementRef} flavoursList={dbFlavoursArr} />
        <button onClick={htmlToImageConvert}>Descargar</button>
      </section>
    </>
  );
}
