import React from "react";

import { useState, useEffect } from "react";
import FlavoursContext from "../Contexts/FlavoursContext";
import gear from "../assets/gear.svg";
import FlavoursMenu from "./FlavoursMenu";
import get_AndDo_ from "../functions/get_AndDo_";
import { FlavourDialog } from "./FlavourDialog";

import spinner from "../assets/spinner.svg";
import ShareMenuSection from "./ShareMenuSection";
const apiUrl = import.meta.env.VITE_API_URL;

export default function FlavoursTable() {
  const [dbFlavoursArr, setDbFlavoursArr] = useState();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function handleResponse_(response) {
      setDbFlavoursArr(response.data);
      setIsLoading(false);
    }
    get_AndDo_("flavours", handleResponse_);
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
        get_AndDo_,
        dbFlavoursArr,
        setDbFlavoursArr,
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
        <ShareMenuSection>
          <FlavoursMenu flavoursList={dbFlavoursArr} />
        </ShareMenuSection>
      )}
    </FlavoursContext.Provider>
  );
}
