/*
  TableRow: fila de la tabla de productos. Renderiza una celda por cada key del schema,
  con manejo especial para imgUrl (thumbnail clickeable con preview en dialog) y una
  celda final con el Dialog de edicion.
*/

import { useRef, useState, useContext } from "react";
import ItemsContext from "../Contexts/ItemsContext";
import { Dialog } from "./Dialog";
import OverflowCell from "./OverflowCell";
import Swal from "sweetalert2";

function TableRow({ product }) {
  // product: objeto del producto actual (contiene _id, name, imgUrl, y demas campos del schema).

  const { itemKeys } = useContext(ItemsContext);
  // itemKeys: array de nombres de campos definidos en el schema, se usa para saber que columnas renderizar.

  const dialogRef = useRef(null);
  // Ref al dialog de preview de imagen.

  const [previewImageUrl, setPreviewImageUrl] = useState("");
  // URL de la imagen que se muestra en el dialog de preview al hacer click en el thumbnail.

  // Limpia la URL antes de usarla para que espacios o valores falsos no creen una miniatura rota.
  const rawProductImageUrl = typeof product.imgUrl === "string" ? product.imgUrl.trim() : "";
  // Considera valida la imagen solo si hay una URL real; evita tratar "undefined" o "null" como imagen.
  const productImageUrl =
    rawProductImageUrl &&
      rawProductImageUrl !== "undefined" &&
      rawProductImageUrl !== "null"
      ? rawProductImageUrl
      : "";

  return (
    <>
      {/* Dialog de preview de imagen: se muestra al hacer click en el thumbnail. */}
      <dialog className="preview" ref={dialogRef}>
        <img className="image-preview" src={previewImageUrl} />
        <button onClick={() => dialogRef.current.close()}>X</button>
      </dialog>

      <tr id={product._id}>
        <td
          data-cell="_id"
          className="id-cell activable"
          onClick={() => {
            navigator.clipboard.writeText(product._id);
            Swal.fire({
              title: "Copiado",
              text: product._id,
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
            });
          }}
        >
          <span>{product._id}</span>
        </td>
        {itemKeys.map((key) => {
          // Itera sobre cada key del schema y renderiza una celda.
          if (key === "imgUrl") {
            // La celda imgUrl es especial: muestra un thumbnail clickeable que abre un dialog
            // con la imagen en tamaño completo.
            return (
              <td
                data-cell={key}
                className={productImageUrl ? "activable image-cell" : "image-cell"}
                onClick={() => {
                  if (!productImageUrl) {
                    return;
                  }

                  dialogRef.current.showModal();
                  setPreviewImageUrl(productImageUrl);
                }}
                key={`product-cell-${product._id}-${key}`}
              >
                <span className="thumbnail-wrap">
                  {productImageUrl && (
                    <img
                      src={productImageUrl}
                      alt={product.name || "Imagen del producto"}
                      className="table-thumbnail"
                    />
                  )}
                </span>
              </td>
            );
          } else
            // Para el resto de campos usa OverflowCell que maneja texto truncado con tooltip.
            return (
              <OverflowCell
                key={`product-cell-${product._id}-${key}`}
                content={product[key]}
                dataCell={key}
              />
            );
        })}

        {/* Celda fija de edicion: siempre presente al final de cada fila. */}
        <td data-cell="edit">
          <Dialog product={product} />
        </td>
      </tr>
    </>
  );
}

export default TableRow;
