import { useState, useEffect, useRef, useMemo } from "react";
import Swal from "sweetalert2";
import client from "../client";
import IceCreamMenuKiosk from "./IceCreamMenuKiosk";
import FrozenTreatsMenuKiosk from "./FrozenTreatsMenuKiosk";
import KioskMenu from "./KioskMenu";
import FlavoursMenuKiosk from "./FlavoursMenuKiosk";

interface Slide {
  _id?: string;
  type: "menu" | "imagen";
  imageId?: string;
  imageUrl?: string;
  duration: number;
  order: number;
  active: boolean;
}

interface Carousel {
  _id: string;
  name: string;
  slides: Slide[];
}

const menuOptions = [
  { id: "kiosk-ice-cream-menu", label: "Helados" },
  { id: "kiosk-frozen-treats-menu", label: "Postres congelados" },
  { id: "kiosk-drinks-cigarettes-menu", label: "Bebidas y cigarrillos" },
  { id: "kiosk-flavours-menu-1", label: "Sabores (1)" },
  { id: "kiosk-flavours-menu-2", label: "Sabores (2)" },
];

const PREVIEW_WIDTH = 80;
const PREVIEW_HEIGHT = 48;
const SCALE = PREVIEW_WIDTH / 1366;

const previewWrapperStyle: React.CSSProperties = {
  width: `${PREVIEW_WIDTH}px`,
  height: `${PREVIEW_HEIGHT}px`,
  borderRadius: "0.3rem",
  overflow: "hidden",
  flexShrink: 0,
  backgroundColor: "#eee",
};

const previewFrameStyle: React.CSSProperties = {
  width: "1366px",
  height: "768px",
  transformOrigin: "top left",
  transform: `scale(${SCALE})`,
  pointerEvents: "none",
};

export default function ConfigurarCartelesPage() {
  const [carousel, setCarousel] = useState<Carousel | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [flavours, setFlavours] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      client.get("/products"),
      client.get("/discounts"),
      client.get("/generic/flavour"),
    ]).then(([pRes, dRes, fRes]) => {
      setProducts(pRes.data);
      setDiscounts(dRes.data);
      setFlavours(fRes.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    client.get("/carousel/slug/kiosk").then((res) => {
      setCarousel(res.data);
      setSlides(res.data.slides || []);
    }).catch(() => {
      client.post("/carousel", { name: "kiosk", slides: [] }, {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("jwtToken") || "{}").token}` },
      }).then((res) => {
        setCarousel(res.data.carousel);
        setSlides([]);
      }).catch(() => {});
    });
  }, []);

  const iceCreamProducts = useMemo(() =>
    products.filter((p) => (p.type === "ice-cream" || p.type === "add-on") && !p.outOfStock),
    [products]
  );
  const iceCreamDiscounts = useMemo(() =>
    discounts.filter((d) => d.type === "ice-cream"),
    [discounts]
  );
  const frozenProducts = useMemo(() =>
    products.filter((p) => p.type === "frozen-treat" && !p.outOfStock),
    [products]
  );
  const drinkProducts = useMemo(() =>
    products.filter((p) => (p.type === "drink" || p.type === "cigarette") && !p.outOfStock),
    [products]
  );

  const saveSlides = async (updated: Slide[]) => {
    if (!carousel) return;
    try {
      await client.put(`/carousel/${carousel._id}`, {
        name: "kiosk",
        slides: updated,
      }, {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("jwtToken") || "{}").token}` },
      });
      setSlides(updated);
      Swal.fire({ icon: "success", text: "Guardado", timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", text: "No se pudo guardar" });
    }
  };

  const addMenuSlide = () => {
    const nextOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.order)) + 1 : 1;
    const newSlide: Slide = {
      type: "menu",
      imageId: menuOptions[0].id,
      duration: 5,
      order: nextOrder,
      active: true,
    };
    saveSlides([...slides, newSlide]);
  };

  const addImageSlide = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const id = `custom-slide-${Date.now()}`;
        const res = await fetch("/.netlify/functions/upload-menu", {
          method: "POST",
          body: JSON.stringify({ image: reader.result, id }),
        });
        const data = await res.json();
        const nextOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.order)) + 1 : 1;
        const newSlide: Slide = {
          type: "imagen",
          imageUrl: data.url,
          duration: 5,
          order: nextOrder,
          active: true,
        };
        saveSlides([...slides, newSlide]);
      } catch {
        Swal.fire({ icon: "error", text: "No se pudo subir la imagen" });
      }
    };
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSlide = (index: number) => {
    const updated = slides.filter((_, i) => i !== index);
    const reordered = updated.map((s, i) => ({ ...s, order: i + 1 }));
    saveSlides(reordered);
  };

  const updateSlide = (index: number, changes: Partial<Slide>) => {
    const updated = slides.map((s, i) => (i === index ? { ...s, ...changes } : s));
    saveSlides(updated);
  };

  const moveSlide = (from: number, to: number) => {
    if (to < 0 || to >= slides.length) return;
    const updated = [...slides];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    const reordered = updated.map((s, i) => ({ ...s, order: i + 1 }));
    saveSlides(reordered);
  };

  const renderPreview = (slide: Slide) => {
    if (slide.type === "imagen" && slide.imageUrl) {
      return (
        <img
          src={slide.imageUrl}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          crossOrigin="anonymous"
        />
      );
    }

    if (slide.type !== "menu" || !slide.imageId) return null;
    const id = slide.imageId;

    let component: React.ReactNode = null;
    if (id === "kiosk-ice-cream-menu") {
      component = <IceCreamMenuKiosk data={iceCreamProducts} discounts={iceCreamDiscounts} menuId={id} />;
    } else if (id === "kiosk-frozen-treats-menu") {
      component = <FrozenTreatsMenuKiosk data={frozenProducts} menuId={id} />;
    } else if (id === "kiosk-drinks-cigarettes-menu") {
      component = <KioskMenu data={drinkProducts} menuId={id} columns={4} templateImg="" />;
    } else if (id === "kiosk-flavours-menu-1") {
      component = <FlavoursMenuKiosk data={flavours} page={1} menuId={id} />;
    } else if (id === "kiosk-flavours-menu-2") {
      component = <FlavoursMenuKiosk data={flavours} page={2} menuId={id} />;
    }

    if (!component) return null;

    return (
      <div style={previewFrameStyle}>
        {component}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "60rem", margin: "auto", color: "#2d2430" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Configurar Carteles</h1>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={addMenuSlide}>+ Menú</button>
        <button onClick={() => fileInputRef.current?.click()}>+ Imagen</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={addImageSlide}
        />
        <a href="#/carteles/carousel" style={{
          padding: "0.4rem 0.8rem",
          borderRadius: "0.3rem",
          backgroundColor: "#e8547e",
          color: "#fff",
          textDecoration: "none",
          fontSize: "0.8rem",
          fontWeight: 600,
        }}>
          Ver carousel
        </a>
      </div>

      {slides.length === 0 && (
        <p style={{ opacity: 0.5 }}>No hay slides configurados. Agregá uno para empezar.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {slides.map((slide, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.6rem",
              border: "1px solid rgba(234,221,228,0.9)",
              backgroundColor: slide.active ? "#fff" : "#f5f5f5",
              opacity: slide.active ? 1 : 0.6,
              flexWrap: "wrap",
            }}
          >
            {/* Preview */}
            <div style={previewWrapperStyle}>
              {renderPreview(slide)}
            </div>

            {/* Type + selector */}
            {slide.type === "menu" ? (
              <select
                value={slide.imageId || ""}
                onChange={(e) => updateSlide(index, { imageId: e.target.value })}
                style={{ padding: "0.4rem", borderRadius: "0.3rem", minWidth: "12rem" }}
              >
                {menuOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <span style={{ fontSize: "0.8rem", minWidth: "12rem" }}>Imagen personalizada</span>
            )}

            {/* Duration */}
            <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem" }}>
              Seg:
              <input
                type="number"
                min={1}
                max={60}
                value={slide.duration}
                onChange={(e) => updateSlide(index, { duration: Number(e.target.value) || 5 })}
                style={{ width: "3.5rem", padding: "0.3rem", borderRadius: "0.3rem", textAlign: "center" }}
              />
            </label>

            {/* Active toggle */}
            <button
              onClick={() => updateSlide(index, { active: !slide.active })}
              style={{
                padding: "0.3rem 0.6rem",
                borderRadius: "0.3rem",
                fontSize: "0.75rem",
                backgroundColor: slide.active ? "#4caf50" : "#999",
                color: "#fff",
                border: "none",
              }}
            >
              {slide.active ? "Activo" : "Inactivo"}
            </button>

            {/* Move buttons */}
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <button
                onClick={() => moveSlide(index, index - 1)}
                disabled={index === 0}
                style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", minWidth: "auto" }}
              >
                ▲
              </button>
              <button
                onClick={() => moveSlide(index, index + 1)}
                disabled={index === slides.length - 1}
                style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", minWidth: "auto" }}
              >
                ▼
              </button>
            </div>

            {/* Delete */}
            <button
              onClick={() => removeSlide(index)}
              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", backgroundColor: "#d33", color: "#fff", border: "none" }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {slides.length > 0 && (
        <p style={{ marginTop: "1rem", fontSize: "0.75rem", opacity: 0.5 }}>
          Los cambios se guardan automáticamente. Abrí <a href="#/carteles/carousel" style={{ color: "#e8547e" }}>#/carteles/carousel</a> en la notebook para ver el carrusel.
        </p>
      )}
    </div>
  );
}
