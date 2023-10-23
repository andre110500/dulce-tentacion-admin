import React from "react";
import callToApi from "../functions/callToApi";
import { useState, useEffect, useContext, useRef } from "react";
import ListContext from "../Contexts/ListContext";
import FlavoursMenu from "./FlavoursMenu";
import AddFlavourForm from "./AddFLavourForm";
import { toPng } from "html-to-image";
import spinner from "../assets/spinner.svg";
const apiUrl = import.meta.env.VITE_API_URL;
export default function FlavoursList() {
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

  return (
    <>
      <section>
        <h1>Sabores</h1>

        {isLoading ? (
          <img src={spinner} className="spinner" alt="spinner" />
        ) : (
          <>
            <ul className="flavours">
              {virtualFlavoursArr.map((virtualFlavour, index) => (
                <ListContext.Provider
                  value={{
                    virtualFlavoursArr,
                    setVirtualFlavoursArr,
                    fetchFlavoursAndSetState,
                    dbFlavoursArr,
                  }}
                >
                  <FlavourItem
                    key={virtualFlavour._id}
                    virtualFlavour={virtualFlavour}
                    index={index}
                  />
                </ListContext.Provider>
              ))}
            </ul>
            <AddFlavourForm
              fetchFlavoursAndSetState={fetchFlavoursAndSetState}
            />
          </>
        )}
      </section>
      <section>
        <FlavoursMenu refe={elementRef} flavoursList={dbFlavoursArr} />
        <button onClick={htmlToImageConvert}>Descargar</button>
      </section>
    </>
  );
}

function FlavourItem({ virtualFlavour, index }) {
  const [enableEdit, setEnableEdit] = useState(false);
  const { virtualFlavoursArr, setVirtualFlavoursArr } = useContext(ListContext);
  return (
    <li>
      <label htmlFor={`${virtualFlavour.name}-index`}>
        {virtualFlavour.name}
      </label>
      <input
        id={`${virtualFlavour.name}-index`}
        disabled={!enableEdit}
        onChange={(e) => {
          const newValue = e.target.checked;
          const virtualFlavoursArrCopy = [
            ...structuredClone(virtualFlavoursArr),
          ];
          virtualFlavoursArrCopy[index].outOfStock = newValue;
          setVirtualFlavoursArr(virtualFlavoursArrCopy);
          console.log(`the new value is ${newValue}`);
        }}
        checked={virtualFlavour.outOfStock}
        type="checkbox"
        name={virtualFlavour.name}
      />
      <Buttons
        index={index}
        key={virtualFlavour._id}
        enableEdit={enableEdit}
        setEnableEdit={setEnableEdit}
      />
    </li>
  );
}

function Buttons({
  enableEdit,

  setEnableEdit,

  index,
}) {
  const {
    dbFlavoursArr,
    setVirtualFlavoursArr,
    virtualFlavoursArr,
    fetchFlavoursAndSetState,
  } = useContext(ListContext);

  return (
    <div className="buttons">
      {enableEdit ? (
        <>
          <input
            type="submit"
            value="borrar"
            onClick={() => {
              const settings = {
                route: "flavours",
                id: `${virtualFlavoursArr[index]._id}`,
                method: "DELETE",

                callback: fetchFlavoursAndSetState,
              };

              callToApi(settings);
            }}
          />
          <input
            value="aceptar"
            type="submit"
            onClick={() => {
              const item = virtualFlavoursArr[index];
              const settings = {
                method: "PUT",
                route: "flavours",
                id: item._id,
                callback: fetchFlavoursAndSetState,
                body: JSON.stringify({
                  name: item.name,

                  outOfStock: item.outOfStock,
                }),
              };

              callToApi(settings);

              setEnableEdit(false);
            }}
          />
          <input
            value="cancelar"
            type="submit"
            onClick={() => {
              setEnableEdit(false);
              setVirtualFlavoursArr([...structuredClone(dbFlavoursArr)]);
            }}
          />
        </>
      ) : (
        <input
          value="editar"
          type="submit"
          className="edit"
          onClick={() => {
            console.log("edit button clicked");
            setEnableEdit(true);
          }}
        />
      )}
    </div>
  );
}
