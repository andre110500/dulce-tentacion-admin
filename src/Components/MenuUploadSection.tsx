import html2canvas from "html2canvas";
import { useEffect, useState, useRef } from "react";
import TimeStamp from "./TimeStamp";

export default function MenuUploadSection({
  children,
  productsList,
  flavoursList,
  onManualMenuUpload,
  isUploadingMenu,
}: {
  children: React.ReactNode;
  productsList: unknown;
  flavoursList: unknown;
  onManualMenuUpload?: () => void;
  isUploadingMenu?: boolean;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    (async () => {
      setIsLoading(true);

      const scale = 2;
      const canvas = await html2canvas(ref.current as HTMLElement, { scale, useCORS: true });

      canvas.toBlob((blob) => {
        if (!blob) {
          setIsLoading(false);
          return;
        }

        // 🔥 Crear URL para preview (sin base64)
        const objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);

        setIsLoading(false);
      }, "image/png");
    })();

    // 🔥 Limpieza importante para evitar memory leaks
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [productsList, flavoursList]);

  return (
    <section className="share">
      <div
        ref={ref}
        className="container"
        style={{ position: "absolute", right: "999990px" }}
      >
        <TimeStamp />

        {children}
      </div>
      {imageSrc && (
        <img className="promotional" src={imageSrc} alt="Captured content" />
      )}

      {isLoading && (
        <button className="loadingDots" disabled>
          CARGANDO
        </button>
      )}

      {imageSrc && onManualMenuUpload && (
        <button onClick={onManualMenuUpload} disabled={isUploadingMenu}>
          {isUploadingMenu ? "SUBIENDO MENÚ..." : "SUBIR MENÚ"}
        </button>
      )}
    </section>
  );
}
