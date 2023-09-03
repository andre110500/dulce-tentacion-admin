import React from "react";
import { useState, useEffect } from "react";

import AddFlavourForm from "./AddFLavourForm";

const apiUrl = import.meta.env.VITE_API_URL;
export default function FlavoursList() {
  const [dbFlavoursArr, setDbFlavoursArr] = useState();
  const [virtualFlavoursArr, setVirtualFlavoursArr] = useState();
  const [enableEdit, setEnableEdit] = useState(false);

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
      console.log(`the posts content is : ${products}`);
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
      console.log(JSON.stringify(dbFlavoursArr));
    }
  }, [dbFlavoursArr]);

  return (
    <div>
      <ul className="flavours-list">
        {virtualFlavoursArr?.map((virtualFlavour, index) => (
          <li key={virtualFlavour._id}>
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
              fetchFlavoursAndSetState={fetchFlavoursAndSetState}
              setVirtualFlavoursArr={setVirtualFlavoursArr}
              virtualFlavoursArr={virtualFlavoursArr}
              dbFlavoursArr={dbFlavoursArr}
            />
          </li>
        ))}
      </ul>
      <AddFlavourForm fetchFlavoursAndSetState={fetchFlavoursAndSetState} />
    </div>
  );
}

function Buttons({
  enableEdit,
  fetchFlavoursAndSetState,
  setEnableEdit,
  setVirtualFlavoursArr,
  virtualFlavoursArr,
  dbFlavoursArr,
  index,
}) {
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
