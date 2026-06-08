/*
  ProductsMenu: menu generico de productos en formato grilla de 2 columnas con cards.
  Acepta cualquier array de products (ya filtrados por la route del fetch) y recibe un
  menuId dinamico para reutilizarse en distintas secciones sin conflictos de id en el DOM.
  Organiza los productos en 2 filas (grid de 2 columnas) con cards compactas para que
  quepan ~20 items por hoja. Los nombres se muestran completos sin truncar.
*/

import template from "../assets/products-template.webp";

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
  // data: arreglo de productos a renderizar.
  // menuId: id del div contenedor para la captura con html2canvas.

  return (
    <div id={menuId} className="menu products-menu">
      <img src={template} alt="" style={{ width: "100%" }} />

      <div className="uls-container">

        <ul className="products-grid">
          {data.map((item) => (
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
    </div>
  );
}
