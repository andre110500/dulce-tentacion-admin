import html2canvas from "html2canvas";
import { useEffect, useState, useRef } from "react";
import TimeStamp from "./TimeStamp";

export default function ShareMenuSection({
  children,
  productsList,
  flavoursList,
}: {
  children: React.ReactNode;
  productsList: unknown;
  flavoursList: unknown;
}) {
  type SharePayload = ShareData & { files: File[] };
  const [shareData, setShareData] = useState<SharePayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    (async () => {
      setIsLoading(true);
      const scale = 2;
      const canvas = await html2canvas(ref.current as HTMLElement, { scale });

      // Preview image
      const dataURL = canvas.toDataURL("image/png");
      setImageSrc(dataURL);

      // Share payload
      await new Promise<void>((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) return resolve();
          const files = [new File([blob], "image.png", { type: blob.type })];
          const nextShareData = {
            text: "Some text",
            title: "Some title",
            files,
          };
          setShareData(nextShareData);
          resolve();
        });
      });

      setIsLoading(false);
    })();
  }, [productsList, flavoursList]);

  async function sendShare() {
    try {
      if (navigator.share && shareData && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        console.log("File was shared successfully");
        setShareData(null);
      } else {
        throw new Error("Funcion no compatible en tu dispositivo");
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.name, err.message);
        alert(err.message);
      } else {
        console.error("Unknown error", err);
        alert("Ocurrió un error desconocido");
      }
    }
  }
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

      {shareData && <button onClick={sendShare}>COMPARTIR IMAGEN</button>}
    </section>
  );
}
