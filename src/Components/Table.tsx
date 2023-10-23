import { useEffect, useState, useContext, useRef } from "react";
import TableContext from "../Contexts/TableContext";
import callToApi from "../functions/callToApi";
import spinner from "../assets/spinner.svg";
import AddProductForm from "./AddProductForm";
import { showConfirmAlert } from "../alerts";
const apiUrl = import.meta.env.VITE_API_URL;

function Table() {
  const [virtualProductsArr, setVirtualProductsArr] = useState();
  const [dbProductsArr, setDbProductsArr] = useState();
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
    }
  }, [dbProductsArr]);

  useEffect(() => {
    fetchProductsAndSetState();
  }, []);

  const productKeys = ["name", "price", "imgUrl", "outOfStock", "flavours"];

  const table = (
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
  );
  return (
    <section id="products">
      <h1>Productos</h1>
      {isLoading ? (
        <img className="spinner" src={spinner} alt="" />
      ) : (
        <>
          <div className="table-container">{table}</div>
          <AddProductForm fetchProductsAndSetState={fetchProductsAndSetState} />
        </>
      )}
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
          <td key={`cell-${key}`}>{`${virtualProduct[key]}`}</td>
        ))}

        <td>
          <Edit virtualProduct={virtualProduct} />
        </td>
      </tr>
    </>
  );
}

export function Edit({ virtualProduct }) {
  const dialogRef = useRef(null);
  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const imgUrlRef = useRef(null);
  const outOfStockRef = useRef(null);
  const flavoursRef = useRef(null);
  const {
    fetchProductsAndSetState,
    virtualProductsArr,
    setVirtualProductsArr,
    dbProductsArr,
  } = useContext(TableContext);

  const openDialog = () => {
    dialogRef.current.showModal();
  };

  const closeDialog = () => {
    dialogRef.current.close();
  };

  function handleSubmit(e) {
    e.preventDefault();
    const body = {
      name: nameRef.current.value,
      price: priceRef.current.value,
      imgUrl: imgUrlRef.current.value,
      outOfStock: outOfStockRef.current.value,
    };
    if (flavoursRef.current.value !== "") {
      body.flavours = flavoursRef.current.value;
    } else {
      body.flavours = undefined;
    }
    const settings = {
      route: "products",
      id: virtualProduct._id,
      method: "PUT",
      callback: () => {
        fetchProductsAndSetState();
        closeDialog();
      },
      body: JSON.stringify(body),
    };

    callToApi(settings);
  }

  function deleteProduct() {
    const settings = {
      route: "products",
      id: `${virtualProduct._id}`,
      method: "DELETE",

      callback: fetchProductsAndSetState,
    };

    callToApi(settings);
  }

  return (
    <>
      <button onClick={openDialog}>Edit</button>

      <dialog ref={dialogRef}>
        <form onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              ref={nameRef}
              name="name"
              defaultValue={virtualProduct.name}
              placeholder="name"
              required
            />
          </label>
          <label>
            Precio
            <input
              defaultValue={virtualProduct.price}
              ref={priceRef}
              name="price"
              type="number"
              placeholder="price"
              required
            />
          </label>
          <label>
            Sabores
            <input
              defaultValue={virtualProduct.flavours}
              ref={flavoursRef}
              type="number"
              name="flavours"
              placeholder="flavours"
              required
            />
          </label>
          <label>
            url de la imagen
            <input
              defaultValue={virtualProduct.imgUrl}
              ref={imgUrlRef}
              name="imgUrl"
              placeholder="imgUrl"
              required
            />
          </label>
          <label className="outOfStock">
            No hay stock ?
            <input
              type="checkbox"
              defaultChecked={virtualProduct.outOfStock}
              ref={outOfStockRef}
              name="outOfStock"
              required
            />
          </label>
          <div className="buttons-container">
            <button className="delete" onClick={deleteProduct}>
              borrar
            </button>
            <button type="submit">Aceptar</button>

            <button type="button" onClick={closeDialog}>
              Cancelar
            </button>
          </div>
        </form>
      </dialog>
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

              showConfirmAlert(callToApi, settings);

              ////
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
