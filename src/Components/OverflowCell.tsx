/*
  OverflowCell: celda de tabla con soporte para texto truncado. En hover detecta si el contenido
  desborda y agrega un tooltip nativo (title). En dispositivos touch (sin hover) muestra el
  contenido completo via SweetAlert al hacer click.
*/

import { useRef } from "react";
import Swal from "sweetalert2";

const OverflowCell = ({ content, dataCell }: { content: unknown; dataCell: string }) => {
  // content: valor de la celda (string, number, boolean, etc.).
  // dataCell: nombre del campo (key del schema), se usa como atributo data-cell para CSS.

  const cellRef = useRef<HTMLTableCellElement>(null);
  // Ref al td para medir scrollWidth vs clientWidth y detectar desbordamiento.

  // Convierte el valor a string para mostrar. Si es null o undefined muestra vacio.
  const displayContent = content === undefined || content === null ? "" : String(content);

  const checkOverflow = () => {
    // Se ejecuta onMouseEnter. Si el contenido desborda el ancho de la celda, asigna el
    // atributo title para que el navegador muestre un tooltip nativo con el texto completo.
    const el = cellRef.current;
    if (!el) return;

    // En mobile el td se convierte en grid (display: grid) y el span interno es quien
    // realmente tiene el overflow oculto, por eso primero busca un span hijo.
    const target = el.querySelector("span") || el;
    const isOverflowing = target.scrollWidth > target.clientWidth;

    if (isOverflowing) {
      el.setAttribute("title", displayContent);
    } else {
      el.removeAttribute("title");
    }
  };

  const handleClick = () => {
    // En dispositivos con hover (desktop) el tooltip nativo via title es suficiente.
    // En touch devices (sin hover) no hay tooltip, entonces muestra el contenido completo
    // como alerta SweetAlert al hacer click.
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (canHover) return;

    const el = cellRef.current;
    if (!el) return;

    const target = el.querySelector("span") || el;
    const isOverflowing = target.scrollWidth > target.clientWidth;

    if (isOverflowing) {
      Swal.fire({
        text: displayContent,
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#e8547e",
      });
    }
  };

  return (
    <td
      data-cell={dataCell}
      ref={cellRef}
      onMouseEnter={checkOverflow}
      onClick={handleClick}
    >
      <span>{displayContent}</span>
    </td>
  );
};

export default OverflowCell;
