import React, { useRef, useContext, useState } from "react";
import ItemsContext from "../Contexts/ItemsContext";
import tryToModifyDbWithAuth from "../functions/tryToModifyDbWithAuth";

export function Dialog({ product }) {
  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const { get_AndDo_, route, setDbItemsArr, itemSchema, itemKeys, subTypesByType } =
    useContext(ItemsContext);

  const [showDeleConfirmation, setShowDeleteConfirmation] = useState(false);
  // Guarda el type actual para que el select de subType muestre solo opciones validas para ese tipo.
  const [selectedType, setSelectedType] = useState(product?.type || "");
  // Busca las opciones de subType usando el type elegido; si no hay type o no tiene subtypes, usa un array vacio.
  const subTypeOptions = subTypesByType?.[selectedType] || [];

  const openDialog = () => {
    dialogRef.current.showModal();
  };

  const closeDialog = () => {
    dialogRef.current.close();
  };

  function checkInputChanges(formElements) {
    console.log("Checking for input changes...");
    console.log("Original product:", product);

    if (!product) {
      console.log("No product provided - this is a new item");
      return true;
    }

    let hasChanges = false;

    itemKeys.forEach((key) => {
      const input = formElements[key];
      const originalValue = product[key];
      let currentValue;

      if (input.type === "checkbox") {
        currentValue = input.checked;
        console.log(`Field: ${key}`);
        console.log(`- Type: Checkbox`);
        console.log(`- Original value: ${originalValue}`);
        console.log(`- Current value: ${currentValue}`);
      } else {
        currentValue = input.value;
        console.log(`Field: ${key}`);
        console.log(`- Type: ${input.type}`);
        console.log(`- Original value: ${originalValue}`);
        console.log(`- Current value: ${currentValue}`);
      }

      // Handle different types of comparisons
      let isChanged = false;

      if (input.type === "number") {
        // For numbers, convert to numbers and compare
        const originalNum =
          originalValue !== undefined ? Number(originalValue) : 0;
        const currentNum = currentValue !== "" ? Number(currentValue) : 0;
        isChanged = originalNum !== currentNum;
      } else if (input.type === "checkbox") {
        // For checkboxes, compare booleans
        isChanged = originalValue !== currentValue;
      } else {
        // For text inputs, handle undefined and empty string cases
        const originalStr =
          originalValue !== undefined ? String(originalValue) : "";
        const currentStr =
          currentValue !== undefined ? String(currentValue) : "";
        isChanged = originalStr !== currentStr;
      }

      if (isChanged) {
        console.log(`- CHANGE DETECTED in ${key}!`);
        hasChanges = true;
      } else {
        console.log(`- No change in ${key}`);
      }
      console.log("-------------------");
    });

    console.log(
      "Final result:",
      hasChanges ? "Changes detected" : "No changes"
    );
    return hasChanges;
  }

  function handleSubmit(e) {
    e.preventDefault();

    const formElements = formRef.current.elements;

    // Check for changes before proceeding
    if (product && !checkInputChanges(formElements)) {
      console.log("No changes detected, closing dialog without submission");
      closeDialog();
      return;
    }

    const body = {}; // Initialize an empty object to hold the body data

    itemKeys.forEach((key) => {
      let value;
      if (formElements[key].type !== "checkbox") {
        value = formElements[key].value ? formElements[key].value : undefined;
      } else {
        value = formElements[key].checked;
      }
      body[key] = value;
    });

    console.log(`body is :${JSON.stringify(body)}`);

    const settings = {
      route: route,
      method: product ? "PUT" : "POST",
      callback: async () => {
        console.log("🟢 SUBMIT CALLBACK STARTED");
        try {
          closeDialog();
          console.log("📦 Dialog closed");
          console.log("📡 Fetching fresh data from DB...");
          const response = await get_AndDo_(route)
          console.log("📥 get_AndDo_ response:", response);
          if (!response) {
            console.error("❌ get_AndDo_ returned undefined!");
            return;
          }

          console.log("📊 Response data:", response.data);
          setDbItemsArr(response.data);
          console.log("✅ State updated");

          e.target.reset();
          console.log("🔄 Form reset");
          console.log("🟢 SUBMIT CALLBACK FINISHED SUCCESSFULLY");
        } catch (error) {
          console.error("❌ Error in submit callback:", error);
        }
      },
      body: JSON.stringify(body),
    };

    if (product) {
      settings.id = product._id;
    }

    tryToModifyDbWithAuth(settings);
  }

  function deleteProduct() {
    const settings = {
      route: route,
      id: `${product._id}`,
      method: "DELETE",

      callback: async () => {
        console.log("🟢 SUBMIT CALLBACK STARTED");
        try {
          closeDialog();
          console.log("📦 Dialog closed");
          console.log("📡 Fetching fresh data from DB...");
          const response = await get_AndDo_(route)
          console.log("📥 get_AndDo_ response:", response);
          if (!response) {
            console.error("❌ get_AndDo_ returned undefined!");
            return;
          }

          console.log("📊 Response data:", response.data);
          setDbItemsArr(response.data);
          console.log("✅ State updated");


          console.log("🔄 Form reset");
          console.log("🟢 SUBMIT CALLBACK FINISHED SUCCESSFULLY");
        } catch (error) {
          console.error("❌ Error in submit callback:", error);
        }
      },
    };

    tryToModifyDbWithAuth(settings);
  }

  return (
    <>
      <button onClick={openDialog}>{product ? "Editar" : "Agregar"}</button>

      <dialog className="crud" ref={dialogRef}>
        {showDeleConfirmation && (
          <div className="delete-comfirmation">
            <h2>Estas seguro?</h2>
            <div className="buttons-container">
              <button onClick={deleteProduct}>Aceptar</button>
              <button onClick={() => setShowDeleteConfirmation(false)}>
                cancelar
              </button>
            </div>
          </div>
        )}
        <form ref={formRef} onSubmit={handleSubmit}>
          {itemSchema?.map((keySchema) => {
            function getInputType(schemaType) {
              switch (schemaType) {
                case "String":
                  return "text";
                case "Number":
                  return "number";
                case "Boolean":
                  return "checkbox";
                case "Date":
                  return "date";
                case "Email":
                  return "email";
                // Add more cases as needed
                default:
                  return "text";
              }
            }
            // El campo subType usa select para permitir solo valores validos segun el type seleccionado.
            const isSubTypeField = keySchema.key === "subType";
            // El campo type actualiza selectedType para que las opciones de subType cambien en vivo.
            const isTypeField = keySchema.key === "type";

            return (
              <label>
                {keySchema.key}
                {isSubTypeField ? (
                  <select
                    name={keySchema.key}
                    defaultValue={product?.[keySchema.key] || ""}
                    required={keySchema.required}
                  >
                    {/* Permite dejar subType vacio porque el backend lo acepta cuando no corresponde. */}
                    <option value="">Sin subtipo</option>
                    {subTypeOptions.map((subType) => (
                      <option key={`subtype-option-${subType}`} value={subType}>
                        {subType}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={keySchema.key}
                    type={getInputType(keySchema.type)}
                    placeholder={keySchema.key}
                    onChange={
                      isTypeField
                        ? (event) => {
                          // Actualiza selectedType para recalcular las opciones validas del select subType.
                          setSelectedType(event.target.value);
                          // Limpia subType porque el valor anterior podria no ser valido para el nuevo type.
                          formRef.current.elements.subType.value = "";
                        }
                        : undefined
                    }
                    defaultValue={
                      keySchema.type !== "Boolean"
                        ? product?.[keySchema.key]
                        : undefined
                    }
                    defaultChecked={
                      keySchema.type === "Boolean"
                        ? product?.[keySchema.key]
                        : undefined
                    }
                    required={keySchema.required}
                  />
                )}
              </label>
            );
          })}

          <div className="buttons-container">
            {product && (
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
