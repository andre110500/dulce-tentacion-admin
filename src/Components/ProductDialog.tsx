import React, { useRef, useContext, useState } from "react";
import TableContext from "../Contexts/TableContext";
import callToApi from "../functions/callToApi";
export function ProductDialog({ virtualProduct }) {
  const dialogRef = useRef(null);
  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const imgUrlRef = useRef(null);
  const outOfStockRef = useRef(null);
  const flavoursRef = useRef(null);
  const { fetchProductsAndSetState, productKeys } = useContext(TableContext);
  console.log(` fetchP is: ${fetchProductsAndSetState}`);
  console.log(`productskeys is : ${productKeys}`);

  const [showConfirmation, setShowConfirmation] = useState(false);

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

      method: virtualProduct ? "PUT" : "POST",
      callback: () => {
        closeDialog();
        fetchProductsAndSetState();
      },
      body: JSON.stringify(body),
    };

    if (virtualProduct) {
      settings.id = virtualProduct._id;
    }

    callToApi(settings);
  }

  function deleteProduct() {
    const settings = {
      route: "products",
      id: `${virtualProduct._id}`,
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
      <button onClick={openDialog}>
        {virtualProduct ? "Edit" : "Agregar"}
      </button>

      <dialog className="edit-product" ref={dialogRef}>
        {showConfirmation ? (
          <div className="comfirmation">
            <h2>Estas seguro?</h2>
            <button onClick={deleteProduct}>Aceptar</button>
            <button onClick={() => setShowConfirmation(false)}>cancelar</button>
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
              defaultValue={virtualProduct?.name}
              placeholder="name"
              required
            />
          </label>
          <label>
            Precio
            <input
              defaultValue={virtualProduct?.price}
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
              defaultValue={virtualProduct?.flavours}
              ref={flavoursRef}
              type="number"
              name="flavours"
              placeholder="flavours"
            />
          </label>
          <label>
            url de la imagen
            <input
              defaultValue={virtualProduct?.imgUrl}
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
              defaultChecked={virtualProduct?.outOfStock}
              ref={outOfStockRef}
              name="outOfStock"
            />
          </label>
          <div className="buttons-container">
            {virtualProduct ? (
              <button
                type="button"
                className="delete"
                onClick={() => {
                  setShowConfirmation(true);
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
