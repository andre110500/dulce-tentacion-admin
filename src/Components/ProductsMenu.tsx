/*
  ProductsMenu: menu generico de productos en formato grilla de 2 columnas con cards.
  Agrupa los productos por subType (traduciendo los valores de ingles a español) y muestra
  encabezados de grupo compactos para una navegacion visual rapida.
  Acepta cualquier array de products y un menuId dinamico.
*/

import template from "../assets/products-template.webp";

// Mapa de traduccion de subType (ingles -> español).
// Los valores no incluidos se muestran tal cual con un aviso en consola.
const subTypeTranslations = {
  // Bebidas
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
  // Cigarrillos
  regular: "Regulares",
  menthol: "Mentolados",
  premium: "Premium",
  light: "Light",
  slim: "Slim",
  capsule: "Cápsula",
  // Postres congelados
  "ice-cream-bar": "Barritas de helado",
  popsicle: "Paletas",
  "ice-cream": "Helados",
  sorbet: "Sorbetes",
  sandwich: "Sándwiches de helado",
  // Generico
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
  // Agrupa los productos por subType. Los que no tienen subType van al final.
  const groups = {};
  for (const item of data) {
    const key = item.subType || "__no_subtype__";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  }

  // Ordena los grupos: primero los que tienen subType (alfabetico), luego los que no.
  const groupKeys = Object.keys(groups).sort((a, b) => {
    if (a === "__no_subtype__") return 1;
    if (b === "__no_subtype__") return -1;
    return a.localeCompare(b);
  });

  return (
    <div id={menuId} className="menu products-menu">
      <img src={template} alt="" style={{ width: "100%" }} />

      <div className="uls-container">

        {groupKeys.map((groupKey) => {
          const items = groups[groupKey];
          const label = groupKey === "__no_subtype__" ? null : translateSubType(groupKey);

          return (
            <div key={groupKey} className="products-group">
              {label && (
                <div className="products-group-header">
                  <span>{label}</span>
                </div>
              )}

              <ul className="products-grid">
                {items.map((item) => (
                  <li key={item._id} className="products-card">
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
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
