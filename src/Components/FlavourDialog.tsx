import React, { useRef, useContext, useState } from "react";
import ListContext from "../Contexts/FlavoursContext";
import callToApi from "../functions/callToApi";
export function FlavourDialog({ virtualFlavour }) {
  const dialogRef = useRef(null);
  const nameRef = useRef(null);

  const outOfStockRef = useRef(null);

  const { fetchFlavoursAndSetState } = useContext(ListContext);

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

      outOfStock: outOfStockRef.current.checked,
    };

    const settings = {
      route: "flavours",

      method: virtualFlavour ? "PUT" : "POST",
      callback: () => {
        closeDialog();
        fetchFlavoursAndSetState();
      },
      body: JSON.stringify(body),
    };

    if (virtualFlavour) {
      settings.id = virtualFlavour._id;
    }

    callToApi(settings);
  }

  function deleteFlavour() {
    const settings = {
      route: "flavours",
      id: `${virtualFlavour._id}`,
      method: "DELETE",

      callback: () => {
        closeDialog();
        fetchFlavoursAndSetState();
      },
    };

    callToApi(settings);
  }

  return (
    <>
      <button onClick={openDialog}>
        {virtualFlavour ? "Edit" : "Agregar"}
      </button>

      <dialog className="edit-product" ref={dialogRef}>
        {showDeleConfirmation ? (
          <div className="delete-comfirmation">
            <h2>Estas seguro?</h2>
            <div className="buttons-container">
              <button onClick={deleteFlavour}>Aceptar</button>
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
              defaultValue={virtualFlavour?.name}
              placeholder="name"
              required
            />
          </label>

          <label className="outOfStock">
            No hay stock ?
            <input
              type="checkbox"
              defaultChecked={virtualFlavour?.outOfStock}
              ref={outOfStockRef}
              name="outOfStock"
            />
          </label>
          <div className="buttons-container">
            {virtualFlavour ? (
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
