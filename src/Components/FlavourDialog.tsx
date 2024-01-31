import React, { useRef, useContext, useState } from "react";
import FlavoursContext from "../Contexts/FlavoursContext";
import tryToModifyDbWithAuth from "../functions/tryToModifyDbWithAuth";
export function FlavourDialog({ flavour }) {
  const dialogRef = useRef(null);
  const nameRef = useRef(null);

  const outOfStockRef = useRef(null);

  const { get_AndDo_, setDbFlavoursArr } = useContext(FlavoursContext);

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

      method: flavour ? "PUT" : "POST",
      callback: () => {
        closeDialog();
        get_AndDo_("flavours", (response) => {
          setDbFlavoursArr(response.data);
        });
        e.target.reset();
      },
      body: JSON.stringify(body),
    };

    if (flavour) {
      settings.id = flavour._id;
    }

    tryToModifyDbWithAuth(settings);
    //reset form
  }

  function deleteFlavour() {
    const settings = {
      route: "flavours",
      id: `${flavour._id}`,
      method: "DELETE",

      callback: () => {
        closeDialog();
        get_AndDo_("flavours", (response) => {
          setDbFlavoursArr(response.data);
        });
      },
    };

    tryToModifyDbWithAuth(settings);
  }

  const deleteConfirmation = (
    <div className="delete-comfirmation">
      <h2>Estas seguro?</h2>
      <div className="buttons-container">
        <button onClick={deleteFlavour}>Aceptar</button>
        <button onClick={() => setShowDeleteConfirmation(false)}>
          cancelar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={openDialog}>{flavour ? "Editar" : "Agregar"}</button>

      <dialog className="crud" ref={dialogRef}>
        {showDeleConfirmation && deleteConfirmation}
        <form onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              ref={nameRef}
              name="name"
              defaultValue={flavour?.name}
              placeholder="name"
              required
            />
          </label>

          <label className="outOfStock">
            No hay stock ?
            <input
              type="checkbox"
              defaultChecked={flavour?.outOfStock}
              ref={outOfStockRef}
              name="outOfStock"
            />
          </label>
          <div className="buttons-container">
            {flavour && (
              <button
                type="button"
                className="delete"
                onClick={() => {
                  setShowDeleteConfirmation(true);
                }}
              >
                borrar
              </button>
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
