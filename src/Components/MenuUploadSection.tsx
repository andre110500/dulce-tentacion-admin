/*
  MenuUploadSection: captura el contenido del menu como imagen (html2canvas) y muestra una preview.
  Se regenera automaticamente cuando cambian productsList o flavoursList (nuevos datos del fetch).
  Es usado por MenuSection para envolver cada instancia de IceCreamMenu, FlavoursMenu, KioskMenu
  o FrozenTreatsMenu.
*/

import html2canvas from "html2canvas";
// html2canvas: toma una captura del DOM del menu y la convierte en un canvas para generar la imagen.

import { useEffect, useState, useRef } from "react";
// useEffect: regenera la captura cuando cambian los datos del menu.
// useState: controla el estado de carga (isLoading) y la URL de la preview (imageSrc).
// useRef: referencia al div invisible que contiene el menu para pasarlo a html2canvas.

import TimeStamp from "./TimeStamp";
// TimeStamp: muestra la fecha/hora actual en la esquina del menu para tracking de versiones.

import KioskPreview from "./KioskPreview";

export default function MenuUploadSection({
  children,
  productsList,
  flavoursList,
  discountsList,
  kioskMenuIds,
}: {
  children: React.ReactNode;
  productsList: unknown;
  flavoursList: unknown;
  discountsList?: unknown;
  kioskMenuIds?: string[];
}) {
  // children: el componente de menu concreto (IceCreamMenu, FlavoursMenu, etc.).
  // productsList / flavoursList: se usan como dependencias del useEffect para regenerar la imagen
  //   cuando los datos cambian. MenuSection los pasa desde dbItemsArr.
  // kioskMenuIds: ids de las versiones landscape que previsualiza KioskPreview.

  const [isLoading, setIsLoading] = useState<boolean>(false);
  // isLoading: true mientras html2canvas esta procesando la captura. Muestra un boton "CARGANDO".

  const ref = useRef<HTMLDivElement | null>(null);
  // ref: apunta al div oculto (position absolute + right 999990px) que contiene el menu renderizado
  // para que html2canvas lo capture sin que sea visible en pantalla.

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  // imageSrc: URL del objeto blob de la captura. Se muestra como <img> preview debajo del menu.
  // Es null hasta que se completa la primera captura.

  useEffect(() => {
    // Cada vez que cambian los datos del menu (productsList o flavoursList), se regenera la
    // captura automaticamente. Esto asegura que la preview siempre refleje los datos actuales.
    if (!ref.current) return;
    // Si el div de referencia aun no esta montado, no hace nada.

    (async () => {
      setIsLoading(true);

      const scale = 1;
      const canvas = await html2canvas(ref.current as HTMLElement, { scale, useCORS: true });
      // html2canvas renderiza el div oculto en un canvas. useCORS: true permite cargar imagenes
      // externas (como las de los productos) siempre que el servidor lo permita.

      canvas.toBlob((blob) => {
        if (!blob) {
          setIsLoading(false);
          return;
        }

        // Crea una URL de objeto a partir del blob para mostrarlo como preview sin tener que
        // codificarlo en base64 (mas eficiente en memoria).
        const objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);

        setIsLoading(false);
      }, "image/webp", 0.85);
      // Codifica la imagen en WebP con calidad 0.85 para buena compresion sin perdida visible.
    })();

    // Limpieza: revoca la URL del objeto anterior para evitar memory leaks.
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [productsList, flavoursList, discountsList]);
  // Se re-ejecuta cuando cambian productsList o flavoursList (nuevos datos del fetch o edicion).

  return (
    <section className="share">
      {/* Div invisible (position absolute + right enorme) que contiene el menu renderizado.
          html2canvas captura este div. No se muestra en pantalla. */}
      <div
        ref={ref}
        className="container"
        style={{ position: "absolute", right: "999990px" }}
      >
        <TimeStamp />
        {/* TimeStamp: sello de fecha/hora en el menu para saber de cuando es la version capturada. */}

        {children}
        {/* children: el componente de menu (IceCreamMenu, FlavoursMenu, etc.) que se captura. */}
      </div>

      {imageSrc && (
        // Una vez generada la captura, muestra la preview de la imagen debajo del formulario.
        <img className="promotional" src={imageSrc} alt="Captured content" />
      )}

      {isLoading && (
        // Mientras html2canvas esta procesando, muestra un boton deshabilitado "CARGANDO".
        <button className="loadingDots" disabled>
          CARGANDO
        </button>
      )}

      {imageSrc && kioskMenuIds && kioskMenuIds.length > 0 && (
        <KioskPreview menuIds={kioskMenuIds} />
      )}
    </section>
  );
}
