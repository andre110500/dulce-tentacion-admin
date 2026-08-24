import fondo2 from "../assets/fondo-2.webp";

const PlaceholderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ width: "100%", height: "100%", color: "#dc1537" }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);

export default function FrozenTreatsMenuKiosk({ data, menuId }) {
  return (
    <div id={menuId} className="kl-menu menu">
      <img src={fondo2} alt="" className="kl-bg" style={{ opacity: 0.6 }} />

      <div className="kl-frozen">
        <h2 className="kl-heading kl-frozen-title">Postres Congelados</h2>
        <div className="kl-frozen-grid">
          {data.map((item) => (
            <div key={item._id} className="kl-frozen-card">
              {item.imgUrl ? (
                <img src={item.imgUrl} alt={item.name} className="kl-frozen-thumb" crossOrigin="anonymous" />
              ) : (
                <div className="kl-frozen-thumb kl-frozen-placeholder">
                  <PlaceholderIcon />
                </div>
              )}
              <div className="kl-frozen-info">
                <span className="kl-frozen-name">
                  {item.name}
                  {item.flavours && (
                    <span className="kl-flavours-tag">hasta {item.flavours} sabores</span>
                  )}
                </span>
                <span className="kl-frozen-price">${item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
