import React from "react";
import ribbonBannerPng from "../assets/ribbon-pink-banner.png";

const ACCENT = "#e8547e";

/** Sello con bordes ondulados (estampa), no estrella */
function buildScallopedSealPath(
  cx = 40,
  cy = 40,
  lobes = 16,
  outerR = 36,
  innerR = 30
): string {
  const steps = lobes * 2;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) d = `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    else d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${d} Z`;
}

const SEAL_PATH = buildScallopedSealPath();

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  );
}

function RibbonBanner() {
  return (
    <div className="discount-combos__ribbon">
      <img
        src={ribbonBannerPng}
        alt="Combos con descuento"
        className="discount-combos__ribbon-img"
      />
      <div className="discount-combos__ribbon-text">
        <HeartIcon className="discount-combos__ribbon-heart" />
        <span>COMBOS CON DESCUENTO</span>
        <HeartIcon className="discount-combos__ribbon-heart" />
      </div>
    </div>
  );
}

function ScallopedBadge({ savings }: { savings: number }) {
  return (
    <div className="discount-combos__badge">
      <svg viewBox="0 0 80 80" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <path fill={ACCENT} d={SEAL_PATH} />
      </svg>
      <div className="discount-combos__badge-text">
        <span>¡AHORRÁS</span>
        <strong>${savings}!</strong>
      </div>
    </div>
  );
}

function IceCreamPlaceholder() {
  return (
    <div className="discount-combos__image" aria-hidden="true">
      <HeartIcon className="discount-combos__float-heart discount-combos__float-heart--1" />
      <HeartIcon className="discount-combos__float-heart discount-combos__float-heart--2" />
      <svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="58" rx="26" ry="8" fill="#f8bbd0" />
        <path
          d="M14 58 L20 28 Q32 18 44 28 L50 58 Z"
          fill="#fff"
          stroke="#f48fb1"
          strokeWidth="1.5"
        />
        <path
          d="M20 30 Q32 14 44 30 Q38 42 32 44 Q26 42 20 30Z"
          fill="#f48fb1"
        />
        <circle cx="26" cy="32" r="3" fill="#e91e63" opacity="0.7" />
        <circle cx="38" cy="28" r="2.5" fill="#e91e63" opacity="0.6" />
        <circle cx="34" cy="38" r="2" fill="#e91e63" opacity="0.5" />
      </svg>
    </div>
  );
}

type ComboCardProps = {
  name: string;
  quantity: string;
  originalPrice: number;
  discountedPrice: number;
  savings: number;
  imageSrc?: string;
  centered?: boolean;
};

function ComboCard({
  name,
  quantity,
  originalPrice,
  discountedPrice,
  savings,
  imageSrc,
  centered,
}: ComboCardProps) {
  const parts = name.split(/\s+/);
  const scriptWord = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const displayName = parts.slice(1).join(" ").toUpperCase();

  return (
    <article
      className={`discount-combos__combo${centered ? " discount-combos__combo--centered" : ""}`}
    >
      {imageSrc ? (
        <div className="discount-combos__image">
          <img
            src={imageSrc}
            alt={`Combo ${name}`}
            className="discount-combos__combo-img"
          />
        </div>
      ) : (
        <IceCreamPlaceholder />
      )}
      <div className="discount-combos__combo-info">
        <h3 className="discount-combos__combo-title">
          <span className="discount-combos__combo-script">{scriptWord}</span>
          <span className="discount-combos__combo-name">{displayName}</span>
        </h3>
        <p className="discount-combos__combo-qty">{quantity}</p>
        <div className="discount-combos__price-box">
          <span className="discount-combos__price-old">${originalPrice}</span>
          <span className="discount-combos__price-new">${discountedPrice}</span>
        </div>
        <ScallopedBadge savings={savings} />
      </div>
    </article>
  );
}

type ComboData = {
  name: string;
  quantity: string;
  originalPrice: number;
  discountedPrice: number;
  savings: number;
  imageSrc?: string;
};

type DiscountCombosSectionProps = {
  combos: ComboData[];
};

export default function DiscountCombosSection({
  combos,
}: DiscountCombosSectionProps) {
  return (
    <section className="discount-combos" aria-label="Combos con descuento">
      <div className="discount-combos__card">
        <RibbonBanner />
        <div className="discount-combos__body">
          {combos.map((combo, index) => (
            <React.Fragment key={combo.name}>
              {index === 1 && (
                <div className="discount-combos__divider" aria-hidden="true" />
              )}
              <ComboCard
                name={combo.name}
                quantity={combo.quantity}
                originalPrice={combo.originalPrice}
                discountedPrice={combo.discountedPrice}
                savings={combo.savings}
                imageSrc={combo.imageSrc}
                centered={combos.length === 3 && index === 2}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
