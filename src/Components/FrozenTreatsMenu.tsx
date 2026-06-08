/*
  FrozenTreatsMenu: menu de postres congelados en formato lista vertical con cards de izquierda a derecha.
  Es el menu original de postres congelados, restaurado como componente independiente
  para tener un diseno distinto al KioskMenu (bebidas/cigarrillos).
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

export default function FrozenTreatsMenu({ data, menuId, columns, templateImg }) {
  return (
    <div id={menuId} className="menu products-menu">
      <img src={templateImg || template} alt="" style={{ width: "100%" }} />

      <div className="uls-container">

        <ul className="frozen-treats-list">
          {data.map((item) => (
            <li key={item._id} className="frozen-treat-item">
              {item.imgUrl ? (
                <img src={item.imgUrl} alt={item.name} className="frozen-treat-thumbnail" crossOrigin="anonymous" />
              ) : (
                <div className="frozen-treat-thumbnail frozen-treat-placeholder">
                  <PlaceholderIcon />
                </div>
              )}
              <div className="frozen-treat-info">
                <span className="frozen-treat-name">
                  {item.name}
                  {item.flavours && (
                    <span className="flavours-label">
                      hasta {item.flavours} sabores
                    </span>
                  )}
                </span>
                <span className="frozen-treat-price">${item.price}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
