import html2canvas from "html2canvas";

export async function generateAndUploadMenu(menuId: string) {
    console.log("Generating image for:", menuId);

    const element = document.getElementById(menuId);
    if (!element) {
        throw new Error(`Element not found: ${menuId}`);
    }

    const canvas = await html2canvas(element, { scale: 2, useCORS: true });

    return new Promise<void>((resolve, reject) => {
        canvas.toBlob(async (blob) => {
            if (!blob) return reject(new Error("Blob not created"));

            const reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = async () => {
                console.log("Uploading image for:", menuId);

                try {
                    const res = await fetch("/.netlify/functions/upload-menu", {
                        method: "POST",
                        body: JSON.stringify({
                            image: reader.result,
                            id: menuId,
                        }),
                    });

                    if (!res.ok) {
                        const text = await res.text().catch(() => "Unknown error");
                        throw new Error(`Upload failed (${res.status}): ${text}`);
                    }

                    console.log("Upload finished for:", menuId);
                    resolve();
                } catch (err) {
                    reject(err instanceof Error ? err : new Error(String(err)));
                }
            };
        }, "image/webp", 0.85);
    });
}
