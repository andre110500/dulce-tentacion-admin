import { useEffect, useState, useContext, useRef } from "react";
import TableContext from "../Contexts/TableContext";
import {
  showSuccessAlert,
  showNotLoggedAlert,
  showUnknownErrorAlert,
} from "../alerts";
import AddProductForm from "./AddProductForm";

const apiUrl = import.meta.env.VITE_API_URL;

function Table() {
  const [virtualProductsArr, setVirtualProductsArr] = useState();
  const [dbProductsArr, setDbProductsArr] = useState();
  const elementRef = useRef(null);

  async function fetchProductsAndSetState() {
    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
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
    <section id="products">
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
    </section>
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
          <td key={`cell-${key}`}>
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

        <td className="buttons-container">
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
      const response = await fetch(
        `${apiUrl}/products/${product._id}`,
        requestOptions
      );
      if (!response.ok) {
        if (response.status === 403) {
          showNotLoggedAlert();
        } else {
          showUnknownErrorAlert();
        }
      } else {
        showSuccessAlert();
      }
    } catch (error) {
      console.log(error.message);
      if (error.message == "Cannot read properties of null (reading 'token')") {
        showNotLoggedAlert();
      }
    }
    fetchProductsAndSetState();
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
        showSuccessAlert();
      } else {
        if (response.status === 403) {
          showNotLoggedAlert();
        } else {
          showUnknownErrorAlert();
        }
        console.log("post not updated");
      }
    } catch (error) {
      if (error.message == "Cannot read properties of null (reading 'token')") {
        showNotLoggedAlert();
      }
      console.log(error.message);
    }
    fetchProductsAndSetState();
  }
  return (
    <>
      {enableEdit ? (
        <>
          <button
            onClick={() => {
              deleteProductFromDb(virtualProductsArr[index]);
            }}
          >
            borrar
          </button>

          <button
            onClick={() => {
              updateProductInDbFromState(virtualProductsArr[index]);
              setEnableEdit(false);
            }}
          >
            aceptar
          </button>

          <button
            onClick={() => {
              setEnableEdit(false);
              setVirtualProductsArr([...structuredClone(dbProductsArr)]);
            }}
          >
            cancelar
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            console.log("edit button clicked");
            setEnableEdit(true);
          }}
        >
          editar
        </button>
      )}
    </>
  );
}
