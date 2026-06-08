/*
  KioskMenu: menu generico de productos en formato grilla de 4 columnas con cards.
  Agrupa los productos por subType con colores de fondo distintos y un índice compacto
  de grupos en la parte superior. Las cards fluyen continuamente sin cortes entre grupos,
  maximizando el espacio de cada fila.
  Se usa para bebidas y cigarrillos (seccion kiosco).
*/

import template from "../assets/kiosk-template.webp";

const subTypeTranslations = {
  can: "Latas",
  fernet: "Fernet",
  liqueur: "Licores",
  "small-bottle": "Petacas",
  "soft-drink": "Sin alcohol",
  wine: "Vino",
};

const translateSubType = (subType) => {
  if (!subType) return null;
  const translation = subTypeTranslations[subType];
  if (!translation) {
    console.warn(`KioskMenu: subType sin traduccion "${subType}"`);
    return subType;
  }
  return translation;
};

const groupPalette = [
  { bg: "rgba(220, 21, 55, 0.07)", border: "rgba(220, 21, 55, 0.2)", marker: "#dc1537" },
  { bg: "rgba(255, 152, 0, 0.07)", border: "rgba(255, 152, 0, 0.2)", marker: "#ff9800" },
  { bg: "rgba(33, 150, 243, 0.07)", border: "rgba(33, 150, 243, 0.2)", marker: "#2196f3" },
  { bg: "rgba(76, 175, 80, 0.07)", border: "rgba(76, 175, 80, 0.2)", marker: "#4caf50" },
  { bg: "rgba(156, 39, 176, 0.07)", border: "rgba(156, 39, 176, 0.2)", marker: "#9c27b0" },
  { bg: "rgba(0, 188, 212, 0.07)", border: "rgba(0, 188, 212, 0.2)", marker: "#00bcd4" },
  { bg: "rgba(233, 30, 99, 0.07)", border: "rgba(233, 30, 99, 0.2)", marker: "#e91e63" },
  { bg: "rgba(121, 85, 72, 0.07)", border: "rgba(121, 85, 72, 0.2)", marker: "#795548" },
];

const PlaceholderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "100%", height: "100%", color: "#dc1537" }}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);

export default function KioskMenu({ data, menuId, columns = 4, templateImg }) {
  const groups = {};
  for (const item of data) {
    const key = item.subType || "__no_subtype__";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  }

  const groupKeys = Object.keys(groups).sort((a, b) => {
    if (a === "__no_subtype__") return 1;
    if (b === "__no_subtype__") return -1;
    return a.localeCompare(b);
  });

  const getColor = (groupKey) => {
    const idx = groupKeys.indexOf(groupKey);
    return groupPalette[idx % groupPalette.length];
  };

  return (
    <div id={menuId} className="menu products-menu">
      <img src={templateImg || template} alt="" style={{ width: "100%" }} />

      <div className="uls-container">

        <div className="products-grouped-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {/* Indice compacto de grupos con sus colores */}
          <div className="products-index">
            {groupKeys.map((groupKey) => {
              const label = groupKey === "__no_subtype__" ? null : translateSubType(groupKey);
              if (!label) return null;
              const color = getColor(groupKey);
              return (
                <div key={groupKey} className="products-index-item">
                  <span className="products-index-dot" style={{ backgroundColor: color.marker }} />
                  <span className="products-index-label">{label}</span>
                </div>
              );
            })}
          </div>

          {groupKeys.flatMap((groupKey) => {
            const items = groups[groupKey];
            const color = getColor(groupKey);

            return items.map((item) => (
              <div
                key={item._id}
                className="products-card"
                style={{ backgroundColor: color.bg, borderColor: color.border }}
              >
                <div className="products-card-col1">
                  {item.imgUrl ? (
                    <img src={item.imgUrl} alt={item.name} className="products-thumbnail" crossOrigin="anonymous" />
                  ) : (
                    <div className="products-thumbnail products-placeholder">
                      <PlaceholderIcon />
                    </div>
                  )}
                </div>
                <div className="products-card-col2">
                  <span className="products-name">
                    {item.name}
                    {item.flavours && (
                      <span className="flavours-label">
                        hasta {item.flavours} sabores
                      </span>
                    )}
                  </span>
                  <span className="products-price">${item.price}</span>
                </div>
              </div>
            ));
          })}
        </div>
      </div>
    </div>
  );
}
