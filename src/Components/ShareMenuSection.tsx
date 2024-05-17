import html2canvas from "html2canvas";
import { useEffect, useState, useContext, useRef } from "react";
import TimeStamp from "./TimeStamp";

export default function ShareMenuSection({ children, productsList }) {
  const [shareData, setShareData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (ref.current) {
      captureImage();
    }
  }, [ref.current, productsList]);

  async function getDataToShare() {
    setIsLoading(true);
    const scale = 2;
    const canvas = await html2canvas(ref.current, { scale });
    canvas.toBlob(async (blob) => {
      const files = [new File([blob], "image.png", { type: blob.type })];
      const shareData = {
        text: "Some text",
        title: "Some title",
        files,
      };
      setShareData(shareData);
      setIsLoading(false);
    });
  }

  const captureImage = async () => {
    const canvas = await html2canvas(ref.current, { useCORS: true });
    const dataURL = canvas.toDataURL("image/png");
    setImageSrc(dataURL);
  };

  async function sendShare() {
    try {
      await navigator.share(shareData);
      console.log("File was shared successfully");
      setShareData(null);
    } catch (err) {
      console.error(err.name, err.message);
    }
  }
  return (
    <section className="share">
      <div ref={ref} className="container">
        <TimeStamp />

        {children}
      </div>
      {!shareData && !isLoading && (
        <button onClick={getDataToShare}>GENERAR IMAGEN</button>
      )}
      {isLoading && (
        <button className="loadingDots" disabled>
          CARGANDO
        </button>
      )}

      {shareData && (
        <div>
          <button onClick={sendShare}>COMPARTIR IMAGEN</button>
        </div>
      )}
      {imageSrc && <img src={imageSrc} alt="Captured content" />}
    </section>
  );
}
