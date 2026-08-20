/*
  Table: tabla de productos con soporte para paginacion. Renderiza los encabezados desde keys
  (obtenidos del schema), las filas via TableRow, y los botones de paginacion si hay mas de 1 pagina.
*/

import gear from "../assets/gear.svg";
import { Dialog } from "./Dialog";
import TableRow from "./TableRow";

function Table({ keys, data, currentPage, totalPages, onPageChange }) {
  // keys: array de nombres de campos (ej. ["name", "price", "imgUrl", ...]).
  // data: arreglo de productos de la pagina actual.
  // currentPage, totalPages: estado de paginacion.
  // onPageChange: callback para cambiar de pagina.

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>_id</th>
            {/* Renderiza un <th> por cada key del schema mas uno fijo para la columna de edicion. */}
            {keys.map((key) => (
              <th key={`product-hcell-${key}`}>{key}</th>
            ))}
            <th>
              {/* Icono de engranaje en el header de la columna de edicion. */}
              <img src={gear} alt="" />
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((product) => (
            <TableRow key={`product-row-${product._id}`} product={product} />
          ))}
        </tbody>
      </table>
      <Dialog />
      {/* Renderiza los botones de paginacion solo si hay mas de 1 pagina. */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={`page-${page}`}
              className={`page-number ${currentPage === page ? "active" : ""}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default Table;
