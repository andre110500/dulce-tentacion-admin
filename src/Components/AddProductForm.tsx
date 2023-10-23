import React from "react";
import { useState, useRef } from "react";
import callToApi from "../functions/callToApi";

export default function AddProductForm({ fetchProductsAndSetState }) {
  const dialogRef = useRef(null);
  const formRef = useRef(null);

  const openDialog = () => {
    dialogRef.current.showModal();
  };

  const closeDialog = () => {
    dialogRef.current.close();
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const product = {
      outOfStock: formRef.current.elements.outOfStock.checked,
      name: formRef.current.elements.name.value,
      price: formRef.current.elements.price.value,
      imgUrl: formRef.current.elements.imgUrl.value,
    };

    if (product?.flavours !== "") {
      product.flavours = formRef.current.elements.flavours.value;
    }

    const settings = {
      route: "products",
      method: "POST",
      body: JSON.stringify(product),
      callback: () => {
        closeDialog();
        fetchProductsAndSetState();
      },
    };

    callToApi(settings);
  }

  return (
    <>
      <button onClick={openDialog}>Agregar</button>

      <dialog ref={dialogRef}>
        <form className="product" ref={formRef} onSubmit={handleSubmit}>
          <div className="input-container">
            <input type="text" name="name" placeholder="name" required />
            <input type="number" name="price" placeholder="price" required />
            <input type="number" name="flavours" placeholder="flavours" />
            <input type="text" name="imgUrl" placeholder="imgUrl" required />
            <label>
              <input type="checkbox" name="outOfStock" />
              outOfStock
            </label>
          </div>
          <div className="buttons-container">
            <button>Ok</button>
            <button onClick={closeDialog}>Cancel</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
