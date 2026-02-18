import html2canvas from "html2canvas";

export async function generateAndUploadMenu(menuId: string) {
    const element = document.getElementById(menuId);
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });

    return new Promise<void>((resolve, reject) => {
        canvas.toBlob(async (blob) => {
            if (!blob) return reject();

            const reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = async () => {
                await fetch("/.netlify/functions/upload-menu", {
                    method: "POST",
                    body: JSON.stringify({ image: reader.result }),
                });

                resolve();
            };
        }, "image/png");
    });
}
