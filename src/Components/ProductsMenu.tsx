/*
  ProductsMenu: menu generico de productos en formato grilla de 4 columnas con cards.
  Agrupa los productos por subType. Cada grupo se distingue por un color de fondo distinto
  en sus cards y una etiqueta compacta en cada card. Las cards fluyen continuamente en la
  grilla sin cortes entre grupos, maximizando el espacio de cada fila.
*/

import template from "../assets/products-template.webp";

// Mapa de traduccion de subType (ingles -> español).
const subTypeTranslations = {
  soda: "Gaseosas",
  water: "Aguas",
  juice: "Jugos",
  beer: "Cervezas",
  "energy-drink": "Bebidas energéticas",
  "sports-drink": "Bebidas deportivas",
  tea: "Tés",
  coffee: "Cafés",
  milk: "Leches",
  cocktail: "Cócteles",
  liquor: "Licores",
  regular: "Regulares",
  menthol: "Mentolados",
  premium: "Premium",
  light: "Light",
  slim: "Slim",
  capsule: "Cápsula",
  "ice-cream-bar": "Barritas de helado",
  popsicle: "Paletas",
  "ice-cream": "Helados",
  sorbet: "Sorbetes",
  sandwich: "Sándwiches de helado",
  other: "Otros",
};

const translateSubType = (subType) => {
  if (!subType) return null;
  const translation = subTypeTranslations[subType];
  if (!translation) {
    console.warn(`ProductsMenu: subType sin traduccion "${subType}"`);
    return subType;
  }
  return translation;
};

// Paleta de colores para distinguir grupos. Cada grupo recibe un fondo y borde sutiles.
const groupPalette = [
  { bg: "rgba(220, 21, 55, 0.07)", border: "rgba(220, 21, 55, 0.2)", badge: "#dc1537" },
  { bg: "rgba(255, 152, 0, 0.07)", border: "rgba(255, 152, 0, 0.2)", badge: "#ff9800" },
  { bg: "rgba(33, 150, 243, 0.07)", border: "rgba(33, 150, 243, 0.2)", badge: "#2196f3" },
  { bg: "rgba(76, 175, 80, 0.07)", border: "rgba(76, 175, 80, 0.2)", badge: "#4caf50" },
  { bg: "rgba(156, 39, 176, 0.07)", border: "rgba(156, 39, 176, 0.2)", badge: "#9c27b0" },
  { bg: "rgba(0, 188, 212, 0.07)", border: "rgba(0, 188, 212, 0.2)", badge: "#00bcd4" },
  { bg: "rgba(233, 30, 99, 0.07)", border: "rgba(233, 30, 99, 0.2)", badge: "#e91e63" },
  { bg: "rgba(121, 85, 72, 0.07)", border: "rgba(121, 85, 72, 0.2)", badge: "#795548" },
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

export default function ProductsMenu({ data, menuId }) {
  // Agrupa los productos por subType.
  const groups = {};
  for (const item of data) {
    const key = item.subType || "__no_subtype__";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  }

  // Ordena los grupos y asigna color a cada uno.
  const groupKeys = Object.keys(groups).sort((a, b) => {
    if (a === "__no_subtype__") return 1;
    if (b === "__no_subtype__") return -1;
    return a.localeCompare(b);
  });

  // A cada grupo le toca un color de la paleta (ciclica).
  const getColor = (groupKey) => {
    const idx = groupKeys.indexOf(groupKey);
    return groupPalette[idx % groupPalette.length];
  };

  return (
    <div id={menuId} className="menu products-menu">
      <img src={template} alt="" style={{ width: "100%" }} />

      <div className="uls-container">

        <div className="products-grouped-grid">
          {groupKeys.flatMap((groupKey) => {
            const items = groups[groupKey];
            const label = groupKey === "__no_subtype__" ? null : translateSubType(groupKey);
            const color = getColor(groupKey);

            return items.map((item, i) => (
              <div
                key={item._id}
                className="products-card"
                style={{ backgroundColor: color.bg, borderColor: color.border }}
              >
                {label && i === 0 && (
                  <div className="products-card-badge" style={{ color: color.badge }}>
                    {label}
                  </div>
                )}
                <div className="products-card-inner">
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
              </div>
            ));
          })}
        </div>
      </div>
    </div>
  );
}
