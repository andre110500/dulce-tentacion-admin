import React from "react";
import { useState, useEffect, useContext, useRef } from "react";
import ListContext from "../Contexts/ListContext";
import ProductsMenu from "./ProductsMenu";
import AddFlavourForm from "./AddFLavourForm";
import { toPng } from "html-to-image";
import Swal from "sweetalert2";

const apiUrl = import.meta.env.VITE_API_URL;
export default function FlavoursList() {
  const [dbFlavoursArr, setDbFlavoursArr] = useState();
  const [virtualFlavoursArr, setVirtualFlavoursArr] = useState();
  const elementRef = useRef(null);
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
    }
  }, [dbFlavoursArr]);

  return (
    <>
      <section>
        <h1>Sabores</h1>

        <ul className="flavours">
          {virtualFlavoursArr?.map((virtualFlavour, index) => (
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
        <AddFlavourForm fetchFlavoursAndSetState={fetchFlavoursAndSetState} />
      </section>
      <section>
        <ProductsMenu refe={elementRef} flavoursList={dbFlavoursArr} />
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

  async function deleteFlavourFromDb(flavour) {
    const token = JSON.parse(localStorage.getItem("jwtToken")).token;
    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`, // Add the JWT to the Authorization header
      },
    };

    try {
      const request = await fetch(
        `${apiUrl}/flavours/${flavour._id}`,
        requestOptions
      );
      if (!request.ok) {
        alert("response not ok");
      } else {
        alert("response ok");

        fetchFlavoursAndSetState();
      }
    } catch (error) {
      console.log(error.message);
      alert(`error: ${error}`);
    }
  }

  async function updateFlavoursInDbFromState(virtualFlavour) {
    try {
      const token = JSON.parse(localStorage.getItem("jwtToken")).token;
      const fetchOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: virtualFlavour.name,

          outOfStock: virtualFlavour.outOfStock,
        }), // Set the body content
      };
      const response = await fetch(
        `${apiUrl}/flavours/${virtualFlavour._id}`,
        fetchOptions
      );
      if (response.ok) {
        Swal.fire({
          title: "Todo bien",
          text: "Loa cambios se realizaron con exito",
          icon: "success", // Displays a warning icon
          confirmButtonText: "OK",
        });

        fetchFlavoursAndSetState();
      } else {
        /* alert(`response not ok : ${response.statusTex}`); */
        if (response.status === 403) {
          Swal.fire({
            title: "Error!",
            text: "Debes estar logeado para realizar cambios.",
            icon: "warning", // Displays a warning icon
            confirmButtonText: "OK",
          });
        } else {
          Swal.fire({
            title: `Error ${response.status}`,
            text: "Contacta con un administrador",
            icon: "warning", // Displays a warning icon
            confirmButtonText: "OK",
          });
        }
        console.log("post not updated");
      }
    } catch (error) {
      /*   alert(`error: ${error}`); */
      console.log(error.message);
      if (error.message == "Cannot read properties of null (reading 'token')") {
        Swal.fire({
          title: `Inicia session`,
          text: "No podes realizar modificaciones sin logearte",
          icon: "warning", // Displays a warning icon
          confirmButtonText: "OK",
        });
      }
    }
  }
  return (
    <div className="buttons">
      {enableEdit ? (
        <>
          <input
            type="submit"
            disabled={!enableEdit}
            value="borrar"
            onClick={() => {
              deleteFlavourFromDb(virtualFlavoursArr[index]);
            }}
          />
          <input
            value="aceptar"
            type="submit"
            onClick={() => {
              updateFlavoursInDbFromState(virtualFlavoursArr[index]);
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
