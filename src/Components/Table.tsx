import { useEffect, useState, useContext, useRef } from "react";
import TableContext from "../Contexts/TableContext";

import AddProductForm from "./AddProductForm";

const apiUrl = import.meta.env.VITE_API_URL;

function Table() {
  const [virtualProductsArr, setVirtualProductsArr] = useState();
  const [dbProductsArr, setDbProductsArr] = useState();
  const elementRef = useRef(null);

  async function fetchProductsAndSetState() {
    const token = JSON.parse(localStorage.getItem("jwtToken")).token;
    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`, // Add the JWT to the Authorization header
      },
    };
    try {
      const response = await fetch(`${apiUrl}/products`, requestOptions);
      if (!response.ok) {
        throw new Error("Request failed");
      }

      const products = await response.json();

      setDbProductsArr(products);

      // Process the data or perform other operations
    } catch (error) {
      console.error("Error:", error);
    }
  }

  useEffect(() => {
    if (dbProductsArr) {
      setVirtualProductsArr(dbProductsArr);
    }
  }, [dbProductsArr]);

  useEffect(() => {
    fetchProductsAndSetState();
  }, []);

  const productKeys = ["name", "price", "imgUrl", "outOfStock", "flavours"];

  return (
    <>
      <h1>Productos</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {productKeys.map((key) => (
                <th key={`hcell-${key}`}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {virtualProductsArr?.map((virtualProduct, index) => (
              //return a row per product

              <TableContext.Provider
                value={{
                  productKeys,
                  fetchProductsAndSetState,
                  virtualProductsArr,
                  setVirtualProductsArr,
                  dbProductsArr,
                  setDbProductsArr,
                }}
              >
                <TableRow
                  key={`row-${virtualProduct._id}`}
                  index={index}
                  virtualProduct={virtualProduct}
                />
              </TableContext.Provider>
            ))}
          </tbody>
        </table>
      </div>
      <AddProductForm fetchProductsAndSetState={fetchProductsAndSetState} />
    </>
  );
}

export default Table;

function TableRow({
  virtualProduct,

  index,
}) {
  const [enableEdit, setEnableEdit] = useState(false);
  const {
    productKeys,

    virtualProductsArr,
    setVirtualProductsArr,
  } = useContext(TableContext);
  return (
    <>
      <tr id={virtualProduct._id}>
        {productKeys.map((key) => (
          //return a cell per key
          <td key={`cell-${key}`} style={{ borderRadius: "0.5rem" }}>
            <input
              value={virtualProduct[key]}
              required={key === "flavours" ? false : true}
              disabled={!enableEdit}
              type={key === "flavours" ? "number" : "text"}
              onChange={(e) => {
                const newValue = e.target.value;
                const virtualProductsArrCopy = [
                  ...structuredClone(virtualProductsArr),
                ];
                virtualProductsArrCopy[index][key] = newValue;
                setVirtualProductsArr(virtualProductsArrCopy);
                console.log(`the new value is ${newValue}`);
              }}
            />
          </td>
        ))}

        <td style={{ display: "flex" }}>
          <Buttons
            key={`buttons-${virtualProduct._id}`}
            enableEdit={enableEdit}
            setEnableEdit={setEnableEdit}
            index={index}
          />
        </td>
      </tr>
    </>
  );
}

function Buttons({
  enableEdit,

  setEnableEdit,

  index,
}) {
  const {
    fetchProductsAndSetState,
    virtualProductsArr,
    setVirtualProductsArr,
    dbProductsArr,
  } = useContext(TableContext);

  async function deleteProductFromDb(product) {
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
        `${apiUrl}/products/${product._id}`,
        requestOptions
      );
      if (!request.ok) {
        alert("response not ok");
      } else {
        alert("response ok");

        fetchProductsAndSetState();
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  async function updateProductInDbFromState(virtualProduct) {
    const body = {
      name: virtualProduct.name,
      price: virtualProduct.price,
      imgUrl: virtualProduct.imgUrl,
      outOfStock: virtualProduct.outOfStock,
    };

    if (virtualProduct?.flavours !== "") {
      body.flavours = virtualProduct.flavours;
    } else {
      body.flavours = undefined;
    }

    try {
      const token = JSON.parse(localStorage.getItem("jwtToken")).token;
      const fetchOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body), // Set the body content
      };
      console.log(`apiurl to update is ${apiUrl}`);
      const response = await fetch(
        `${apiUrl}/products/${virtualProduct._id}`,
        fetchOptions
      );
      if (response.ok) {
        alert("post updated");
        console.log("post updated");
        fetchProductsAndSetState();
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
              deleteProductFromDb(virtualProductsArr[index]);
            }}
          />
          <input
            value="aceptar"
            type="submit"
            onClick={() => {
              updateProductInDbFromState(virtualProductsArr[index]);
              setEnableEdit(false);
            }}
          />
          <input
            value="cancelar"
            type="submit"
            onClick={() => {
              setEnableEdit(false);
              setVirtualProductsArr([...structuredClone(dbProductsArr)]);
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
