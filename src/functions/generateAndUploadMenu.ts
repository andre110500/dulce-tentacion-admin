import html2canvas from "html2canvas";

export async function generateAndUploadMenu(menuId: string) {
    console.log("🖼 Generating image for:", menuId);

    const element = document.getElementById(menuId);
    if (!element) {
        console.error("❌ Element not found:", menuId);
        return;
    }

    const canvas = await html2canvas(element, { scale: 1, useCORS: true });

    return new Promise<void>((resolve, reject) => {
        canvas.toBlob(async (blob) => {
            if (!blob) return reject("Blob not created");

            const reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = async () => {
                console.log("☁ Uploading image for:", menuId);

                await fetch("/.netlify/functions/upload-menu", {
                    method: "POST",
                    body: JSON.stringify({
                        image: reader.result,
                        id: menuId   // 🔥 enviamos el id
                    }),
                });

                console.log("✅ Upload finished for:", menuId);
                resolve();
            };
        }, "image/png");
    });
}
