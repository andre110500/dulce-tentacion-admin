import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import client from "../client";
import IceCreamMenuKiosk from "./IceCreamMenuKiosk";
import FrozenTreatsMenuKiosk from "./FrozenTreatsMenuKiosk";
import KioskMenu from "./KioskMenu";
import FlavoursMenuKiosk from "./FlavoursMenuKiosk";

interface Slide {
  _id: string;
  type: "menu" | "imagen";
  imageId?: string;
  imageUrl?: string;
  duration: number;
  order: number;
  active: boolean;
}

export default function CartelesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);

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
      const active = (res.data.slides || [])
        .filter((s: Slide) => s.active)
        .sort((a: Slide, b: Slide) => a.order - b.order);
      setSlides(active);
    }).catch(() => {});
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length === 0) return;
    const duration = (slides[currentIndex]?.duration || 5) * 1000;
    const timer = setTimeout(nextSlide, duration);
    return () => clearTimeout(timer);
  }, [currentIndex, slides, nextSlide]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
      if (e.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen();
      }
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
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

  const renderSlideContent = (slide: Slide) => {
    if (slide.type === "imagen" && slide.imageUrl) {
      return <img src={slide.imageUrl} alt="" style={imgStyle} crossOrigin="anonymous" />;
    }

    if (slide.type !== "menu" || !slide.imageId) return null;

    const id = slide.imageId;

    if (id === "kiosk-ice-cream-menu") {
      return <IceCreamMenuKiosk data={iceCreamProducts} discounts={iceCreamDiscounts} menuId={id} />;
    }
    if (id === "kiosk-frozen-treats-menu") {
      return <FrozenTreatsMenuKiosk data={frozenProducts} menuId={id} />;
    }
    if (id === "kiosk-drinks-cigarettes-menu") {
      return <KioskMenu data={drinkProducts} menuId={id} columns={4} templateImg="" />;
    }
    if (id === "kiosk-flavours-menu-1") {
      return <FlavoursMenuKiosk data={flavours} page={1} menuId={id} />;
    }
    if (id === "kiosk-flavours-menu-2") {
      return <FlavoursMenuKiosk data={flavours} page={2} menuId={id} />;
    }

    return null;
  };

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleDragStart = (clientX: number, clientY: number) => {
    dragStartX.current = clientX;
    dragStartY.current = clientY;
  };

  const handleDragEnd = (clientX: number, clientY: number) => {
    if (dragStartX.current === null) return;
    const dx = clientX - dragStartX.current;
    const dy = clientY - (dragStartY.current ?? clientY);
    dragStartX.current = null;
    dragStartY.current = null;

    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;

    if (dx < 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  if (slides.length === 0) {
    return (
      <div style={emptyStyle}>
        <p>No hay slides configurados.</p>
        <p style={{ fontSize: "0.8rem", opacity: 0.6 }}>
          Presioná F para pantalla completa
        </p>
      </div>
    );
  }

  return (
    <div
      style={containerStyle}
      onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
      onMouseUp={(e) => handleDragEnd(e.clientX, e.clientY)}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
      onClick={() => {
        if (dragStartX.current === null && !document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        }
      }}
    >
      <div className="kiosk-frame" style={{ ...kioskFrameStyle, position: "relative" }}>
        {slides.map((s, i) => (
          <div
            key={s._id}
            style={{
              ...slideLayerStyle,
              visibility: i === currentIndex ? "visible" : "hidden",
              zIndex: i === currentIndex ? 1 : 0,
            }}
          >
            {renderSlideContent(s)}
          </div>
        ))}
      </div>

      {!isFullscreen && (
        <div style={hintStyle}>
          F para pantalla completa · Click para iniciar · Deslizá para cambiar slide
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            style={arrowLeftStyle}
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            style={arrowRightStyle}
          >
            ›
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div style={dotsStyle}>
          {slides.map((_, i) => (
            <span
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(i);
              }}
              style={{
                ...dotStyle,
                opacity: i === currentIndex ? 1 : 0.3,
                transform: i === currentIndex ? "scale(1.3)" : "scale(1)",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "#000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  userSelect: "none",
};

const kioskFrameStyle: React.CSSProperties = {
  width: "1366px",
  height: "768px",
  overflow: "hidden",
  flexShrink: 0,
  pointerEvents: "none",
};

const slideLayerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
};

const imgStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
};

const emptyStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "#000",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.5rem",
};

const hintStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "1rem",
  left: "50%",
  transform: "translateX(-50%)",
  color: "rgba(255,255,255,0.4)",
  fontSize: "0.75rem",
};

const dotsStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "2.5rem",
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: "0.5rem",
};

const dotStyle: React.CSSProperties = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: "#fff",
  transition: "opacity 0.3s, transform 0.3s",
};

const arrowBaseStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: "3rem",
  color: "rgba(255,255,255,0.4)",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "1rem",
  lineHeight: 1,
  zIndex: 10,
  transition: "color 0.2s",
};

const arrowLeftStyle: React.CSSProperties = {
  ...arrowBaseStyle,
  left: "1.5rem",
};

const arrowRightStyle: React.CSSProperties = {
  ...arrowBaseStyle,
  right: "1.5rem",
};
