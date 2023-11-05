import React, { useRef, useContext, useState } from "react";
import TableContext from "../Contexts/ProductsContext";
import callToApi from "../functions/callToApi";
export function ProductDialog({ product }) {
  const dialogRef = useRef(null);
  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const imgUrlRef = useRef(null);
  const outOfStockRef = useRef(null);
  const flavoursRef = useRef(null);
  const { fetchProductsAndSetState } = useContext(TableContext);

  const [showDeleConfirmation, setShowDeleteConfirmation] = useState(false);

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
      outOfStock: outOfStockRef.current.checked,
    };
    if (flavoursRef.current.value !== "") {
      body.flavours = flavoursRef.current.value;
    } else {
      body.flavours = undefined;
    }
    const settings = {
      route: "products",

      method: product ? "PUT" : "POST",
      callback: () => {
        closeDialog();
        fetchProductsAndSetState();
        e.target.reset();
      },
      body: JSON.stringify(body),
    };

    if (product) {
      settings.id = product._id;
    }

    callToApi(settings);
  }

  function deleteProduct() {
    const settings = {
      route: "products",
      id: `${product._id}`,
      method: "DELETE",

      callback: () => {
        closeDialog();
        fetchProductsAndSetState();
      },
    };

    callToApi(settings);
  }

  return (
    <>
      <button onClick={openDialog}>{product ? "Editar" : "Agregar"}</button>

      <dialog className="crud" ref={dialogRef}>
        {showDeleConfirmation ? (
          <div className="delete-comfirmation">
            <h2>Estas seguro?</h2>
            <div className="buttons-container">
              <button onClick={deleteProduct}>Aceptar</button>
              <button onClick={() => setShowDeleteConfirmation(false)}>
                cancelar
              </button>
            </div>
          </div>
        ) : (
          ""
        )}
        <form onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              ref={nameRef}
              name="name"
              defaultValue={product?.name}
              placeholder="name"
              required
            />
          </label>
          <label>
            Precio
            <input
              defaultValue={product?.price}
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
              defaultValue={product?.flavours}
              ref={flavoursRef}
              type="number"
              name="flavours"
              placeholder="flavours"
            />
          </label>
          <label>
            url de la imagen
            <input
              defaultValue={product?.imgUrl}
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
              defaultChecked={product?.outOfStock}
              ref={outOfStockRef}
              name="outOfStock"
            />
          </label>
          <div className="buttons-container">
            {product ? (
              <button
                type="button"
                className="delete"
                onClick={() => {
                  setShowDeleteConfirmation(true);
                }}
              >
                borrar
              </button>
            ) : (
              ""
            )}
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
