import React from "react";
import callToApi from "../functions/callToApi";
import { useState, useRef } from "react";

export default function AddFlavourForm({ fetchFlavoursAndSetState }) {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  async function handleSubmit(e) {
    e.preventDefault();

    const flavour = {
      outOfStock: formRef.current.elements.outOfStock.checked,
      name: formRef.current.elements.name.value,
    };

    const settings = {
      route: "flavours",
      callback: () => {
        setShowForm(false);
        fetchFlavoursAndSetState();
      },
      method: "POST",
      body: JSON.stringify(flavour),
    };

    callToApi(settings);
  }

  return (
    <>
      {!showForm ? (
        <button onClick={() => setShowForm(true)}>Agregar</button>
      ) : (
        <form className="flavour" ref={formRef} onSubmit={handleSubmit}>
          <div className="input-container">
            <input type="text" name="name" placeholder="name" required />
            <label>
              <input type="checkbox" name="outOfStock" />
              outOfStock
            </label>
          </div>
          <div className="buttons-container">
            <button>Ok</button>
            <button onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
    </>
  );
}
