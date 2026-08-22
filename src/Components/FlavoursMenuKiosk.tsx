import template from "../assets/flavours-template.webp";

const PlaceholderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ width: "100%", height: "100%", color: "#dc1537" }}>
    <path d="M12 2a5 5 0 0 0-5 5v1a4 4 0 0 0-3 3.87 3.13 3.13 0 0 0 3.13 3.13h9.74A3.13 3.13 0 0 0 20 11.87 4 4 0 0 0 17 8V7a5 5 0 0 0-5-5z" />
    <path d="M6 15v1a6 6 0 0 0 12 0v-1" />
  </svg>
);

export default function FlavoursMenuKiosk({ data, page, menuId }) {
  const flavoursInStock = data.filter((f) => !f.outOfStock);
  const halfLength = Math.ceil(flavoursInStock.length / 2);
  const currentPage = page || 1;
  const pageFlavours = currentPage === 1
    ? flavoursInStock.slice(0, halfLength)
    : flavoursInStock.slice(halfLength);

  const menuIdFinal = menuId || (page ? `flavours-menu-${page}` : "flavours-menu");

  return (
    <div id={menuIdFinal} className="kl-menu menu">
      <img src={template} alt="" className="kl-bg" />

      <div className="kl-flavours">
        <h2 className="kl-heading kl-flavours-title">Sabores</h2>
        <div className="kl-flavours-grid">
          {pageFlavours.map((flavour) => (
            <div key={flavour._id} className="kl-flavour-item">
              {flavour.imgUrl ? (
                <img src={flavour.imgUrl} alt="" className="kl-flavour-img" crossOrigin="anonymous" />
              ) : (
                <div className="kl-flavour-img kl-flavour-placeholder">
                  <PlaceholderIcon />
                </div>
              )}
              <span className="kl-flavour-name">{flavour.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
