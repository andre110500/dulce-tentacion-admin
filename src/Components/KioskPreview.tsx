import { useState, useEffect } from "react";

export default function KioskPreview({ menuIds }: { menuIds: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Find the parent .kiosk-container that holds these menus
    const firstMenu = document.getElementById(menuIds[0]);
    const container = firstMenu?.closest(".kiosk-container") as HTMLElement;
    if (!container) return;

    // Save original values
    const origPosition = container.style.position;
    const origTop = container.style.top;
    const origLeft = container.style.left;
    const origZ = container.style.zIndex;
    const origMarginTop = container.style.marginTop;
    const origMarginLeft = container.style.marginLeft;
    const origDisplay = container.style.display;

    // Position centered on screen (no transform to avoid breaking container queries)
    container.style.position = "fixed";
    container.style.top = "50%";
    container.style.left = "50%";
    container.style.marginTop = "-384px";
    container.style.marginLeft = "-683px";
    container.style.zIndex = "10001";
    container.style.display = "";

    // Show only current menu, hide the rest
    const allMenus = container.querySelectorAll(".menu") as NodeListOf<HTMLElement>;
    const hiddenMenus: HTMLElement[] = [];
    allMenus.forEach((menu) => {
      if (menu.id !== menuIds[currentIndex]) {
        menu.style.display = "none";
        hiddenMenus.push(menu);
      }
    });

    return () => {
      container.style.position = origPosition;
      container.style.top = origTop;
      container.style.left = origLeft;
      container.style.zIndex = origZ;
      container.style.marginTop = origMarginTop;
      container.style.marginLeft = origMarginLeft;
      container.style.display = origDisplay;
      hiddenMenus.forEach((m) => {
        m.style.display = "";
      });
    };
  }, [isOpen, currentIndex, menuIds]);

  return (
    <>
      <button
        onClick={() => {
          setCurrentIndex(0);
          setIsOpen(true);
        }}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "0.5rem",
          border: "1px solid #e8547e",
          backgroundColor: "transparent",
          color: "#e8547e",
          fontWeight: 700,
          fontSize: "0.75rem",
          cursor: "pointer",
        }}
      >
        Previsualizar landscape
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            backgroundColor: "rgba(0,0,0,0.9)",
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              position: "absolute",
              top: "0.75rem",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "0.5rem",
              zIndex: 10002,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {menuIds.map((id, i) => (
              <button
                key={id}
                onClick={() => setCurrentIndex(i)}
                style={{
                  padding: "0.3rem 0.7rem",
                  borderRadius: "0.3rem",
                  border: "none",
                  backgroundColor: i === currentIndex ? "#e8547e" : "#333",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  cursor: "pointer",
                }}
              >
                {id.replace("kiosk-", "").replace(/-/g, " ")}
              </button>
            ))}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                padding: "0.3rem 0.7rem",
                borderRadius: "0.3rem",
                border: "none",
                backgroundColor: "#555",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.7rem",
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
          </div>

          <p
            style={{
              position: "absolute",
              bottom: "1rem",
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.7rem",
              zIndex: 10002,
            }}
          >
            1366 x 768 - ESC o click afuera para cerrar
          </p>
        </div>
      )}
    </>
  );
}
