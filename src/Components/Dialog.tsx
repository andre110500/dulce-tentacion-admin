import React, { useRef, useContext, useState } from "react";
import ItemsContext from "../Contexts/ItemsContext";
import { show_ErrorAlert } from "../alerts";
import tryToModifyDbWithAuth from "../functions/tryToModifyDbWithAuth";

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const uploadImageFile = async (file, id) => {
  console.log("Uploading product image:", {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    id,
  });

  const image = await fileToDataUrl(file);
  console.log("Product image converted to data URL:", {
    id,
    dataUrlLength: typeof image === "string" ? image.length : 0,
  });

  const response = await fetch("/.netlify/functions/upload-menu", {
    method: "POST",
    body: JSON.stringify({
      image,
      id,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;

    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = null;
    }

    console.error("Product image upload response failed:", {
      status: response.status,
      statusText: response.statusText,
      body: errorData || errorText,
    });

    const detailLines = [
      errorData?.error || "Image upload failed",
      errorData?.details?.name ? `name: ${errorData.details.name}` : "",
      errorData?.details?.httpCode
        ? `httpCode: ${errorData.details.httpCode}`
        : "",
      errorData?.debug?.publicId ? `publicId: ${errorData.debug.publicId}` : "",
      errorData?.debug?.imagePrefix
        ? `imagePrefix: ${errorData.debug.imagePrefix}`
        : "",
    ].filter(Boolean);

    throw new Error(detailLines.join("\n"));
  }

  const data = await response.json();
  console.log("Product image uploaded:", data);
  return data.url;
};

export function Dialog({ product }) {
  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const { get_AndDo_, route, setDbItemsArr, itemSchema, itemKeys, subTypesByType } =
    useContext(ItemsContext);

  const [showDeleConfirmation, setShowDeleteConfirmation] = useState(false);
  // Guarda si el usuario pidio eliminar la imagen actual del producto.
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false);
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

  async function handleSubmit(e) {
    e.preventDefault();

    const formElements = formRef.current.elements;
    // Lee el archivo elegido para saber si el usuario quiere agregar o reemplazar la imagen.
    const imageFile = formElements.imgUrlFile?.files?.[0];

    // Check for changes before proceeding
    if (
      product &&
      !imageFile &&
      !shouldRemoveImage &&
      !checkInputChanges(formElements)
    ) {
      console.log("No changes detected, closing dialog without submission");
      closeDialog();
      return;
    }

    try {
      if (shouldRemoveImage) {
        // Deja imgUrl vacio para que el body envie undefined y la API quite la imagen del producto.
        formElements.imgUrl.value = "";
      } else if (imageFile) {
        // Usa el id del producto al editar, y un id temporal al crear, para generar un public_id estable en Cloudinary.
        const imageId = product?._id || `product-${Date.now()}`;
        const imageUrl = await uploadImageFile(imageFile, imageId);
        // Guarda la URL final en el input oculto para que el loop de itemKeys la envie como imgUrl.
        formElements.imgUrl.value = imageUrl;
      }
    } catch (error) {
      console.error("Error uploading product image:", error);
      const message =
        error instanceof Error ? error.message : "No se pudo subir la imagen";
      show_ErrorAlert(`No se pudo subir la imagen\n${message}`);
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
            // El campo imgUrl usa un selector de archivo y guarda la URL en un input oculto.
            const isImageField = keySchema.key === "imgUrl";

            return (
              <label>
                {keySchema.key}
                {isImageField ? (
                  <div className="image-upload-field">
                    {product?.imgUrl && !shouldRemoveImage && (
                      <img
                        src={product.imgUrl}
                        alt={product.name || "Imagen actual"}
                        className="current-product-image"
                      />
                    )}
                    <input
                      name="imgUrl"
                      type="hidden"
                      defaultValue={product?.imgUrl || ""}
                    />
                    {product?.imgUrl && (
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => {
                          // Alterna entre marcar la imagen para borrar y restaurarla antes de guardar.
                          setShouldRemoveImage((currentValue) => !currentValue);
                          formRef.current.elements.imgUrlFile.value = "";
                        }}
                      >
                        {shouldRemoveImage ? "Restaurar imagen" : "Quitar imagen"}
                      </button>
                    )}
                    {shouldRemoveImage && (
                      <p className="image-removal-note">
                        La imagen se quitara al guardar.
                      </p>
                    )}
                    <input
                      name="imgUrlFile"
                      type="file"
                      accept="image/*"
                      disabled={shouldRemoveImage}
                    />
                  </div>
                ) : isSubTypeField ? (
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
                          if (formRef.current.elements.subType) {
                            formRef.current.elements.subType.value = "";
                          }
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
