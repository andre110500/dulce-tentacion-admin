import React from "react";
import { useState, useEffect, useContext, useRef } from "react";
import ListContext from "../Contexts/ListContext";
import ProductsMenu from "./ProductsMenu";
import AddFlavourForm from "./AddFLavourForm";
import { toPng } from "html-to-image";
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
    <div>
      <ul className="flavours-list">
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
      <ProductsMenu refe={elementRef} flavoursList={dbFlavoursArr} />
      <button onClick={htmlToImageConvert}>Download Image</button>
    </div>
  );
}

function FlavourItem({ virtualFlavour, index }) {
  const [enableEdit, setEnableEdit] = useState(false);
  const { virtualFlavoursArr, setVirtualFlavoursArr } = useContext(ListContext);
  return (
    <li>
      <label>
        {virtualFlavour.name}
        <input
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
      </label>
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
        alert("post updated");
        console.log("post updated");
        fetchFlavoursAndSetState();
      } else {
        alert(`response not ok : ${response.statusTex}`);
        console.log("post not updated");
      }
    } catch (error) {
      alert("error");
      console.log(error.message);
    }
  }
  return (
    <>
      {enableEdit ? (
        <>
          <input
            type="submit"
            disabled={!enableEdit}
            value="delete"
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
          value="edit"
          type="submit"
          className="edit"
          onClick={() => {
            console.log("edit button clicked");
            setEnableEdit(true);
          }}
        />
      )}
    </>
  );
}
