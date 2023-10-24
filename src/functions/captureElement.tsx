import html2canvas from "html2canvas";

const captureElement = (targetElementRef, imageRef) => {
  if (targetElementRef.current) {
    const scale = 4; // Increase the scale for higher resolution (e.g., 2 for double resolution)

    html2canvas(targetElementRef.current, { scale }).then((canvas) => {
      // Convert canvas to data URL as a JPG image
      const imgData = canvas.toDataURL("image/jpeg");
      imageRef.current.src = imgData;
    });
  }
};

export default captureElement;
