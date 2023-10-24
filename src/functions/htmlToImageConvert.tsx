import { toPng } from "html-to-image";

const htmlToImageConvert = (ref) => {
  toPng(ref.current, { cacheBust: false })
    .then((dataUrl) => {
      const link = document.createElement("a");
      link.download = "my-image-name.png";
      link.href = dataUrl;
      link.click();
    })
    .catch((err) => {
      console.log(err);
    });
};

export default htmlToImageConvert;
