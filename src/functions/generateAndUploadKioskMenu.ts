import html2canvas from "html2canvas";

const KIOSK_WIDTH = 1366;
const KIOSK_HEIGHT = 768;

export async function generateAndUploadKioskMenu(menuId: string) {
    const kioskId = `kiosk-${menuId}`;
    console.log("Generating kiosk image for:", kioskId);

    const element = document.getElementById(kioskId);
    if (!element) {
        console.error("Kiosk element not found:", kioskId);
        return;
    }

    // Find the parent .kiosk-container
    const container = element.closest(".kiosk-container") as HTMLElement | null;

    // Save original styles
    let origStyles = {};
    if (container) {
        origStyles = {
            top: container.style.top,
            left: container.style.left,
            zIndex: container.style.zIndex,
            marginTop: container.style.marginTop,
            marginLeft: container.style.marginLeft,
        };

        // Move container on-screen for html2canvas
        container.style.top = "0px";
        container.style.left = "0px";
        container.style.marginTop = "0px";
        container.style.marginLeft = "0px";
        container.style.zIndex = "-1";
    }

    // Hide all sibling menus except the target
    const hiddenSiblings: HTMLElement[] = [];
    if (container) {
        const allMenus = container.querySelectorAll(".menu") as NodeListOf<HTMLElement>;
        allMenus.forEach((menu) => {
            if (menu.id !== kioskId) {
                menu.style.display = "none";
                hiddenSiblings.push(menu);
            }
        });
    }

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            width: KIOSK_WIDTH,
            height: KIOSK_HEIGHT,
            windowWidth: KIOSK_WIDTH,
            windowHeight: KIOSK_HEIGHT,
        });

        return new Promise<void>((resolve, reject) => {
            canvas.toBlob(async (blob) => {
                if (!blob) return reject("Blob not created");

                const reader = new FileReader();
                reader.readAsDataURL(blob);

                reader.onloadend = async () => {
                    console.log("Uploading kiosk image for:", kioskId);

                    await fetch("/.netlify/functions/upload-menu", {
                        method: "POST",
                        body: JSON.stringify({
                            image: reader.result,
                            id: kioskId,
                        }),
                    });

                    console.log("Kiosk upload finished for:", kioskId);
                    resolve();
                };
            }, "image/webp", 0.85);
        });
    } finally {
        // Restore container styles
        if (container) {
            Object.assign(container.style, origStyles);
        }
        // Restore hidden siblings
        hiddenSiblings.forEach((m) => {
            m.style.display = "";
        });
    }
}
