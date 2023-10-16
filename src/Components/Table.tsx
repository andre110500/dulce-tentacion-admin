import { useEffect, useState, useContext, useRef } from "react";
import TableContext from "../Contexts/TableContext";
import callToApi from "../functions/callToApi";

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

  return (
    <>
      {enableEdit ? (
        <>
          <button
            onClick={() => {
              const settings = {
                route: "products",
                id: `${virtualProductsArr[index]._id}`,
                method: "DELETE",

                callback: fetchProductsAndSetState,
              };

              callToApi(settings);
            }}
          >
            borrar
          </button>

          <button
            onClick={() => {
              const item = virtualProductsArr[index];
              const body = {
                name: item.name,
                price: item.price,
                imgUrl: item.imgUrl,
                outOfStock: item.outOfStock,
              };
              if (item.flavours !== "") {
                body.flavours = item.flavours;
              } else {
                body.flavours = undefined;
              }
              const settings = {
                route: "products",
                id: item._id,
                method: "PUT",
                callback: fetchProductsAndSetState,
                body: JSON.stringify(body),
              };

              callToApi(settings);
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
