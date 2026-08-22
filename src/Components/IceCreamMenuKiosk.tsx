import iceCreamTubIcon2 from "../assets/2.png";
import iceCreamTubIcon3 from "../assets/3.png";
import iceCreamTubIcon4 from "../assets/4.png";
import comboFamiliarPng from "../assets/combo-familiar.png";
import comboAmigosPng from "../assets/combo-amigos.png";

const comboImages = [comboAmigosPng, comboFamiliarPng];

export default function IceCreamMenuKiosk({ data, discounts = [] as any[], menuId }) {
  const iconsByFlavours = { 2: iceCreamTubIcon2, 3: iceCreamTubIcon3, 4: iceCreamTubIcon4 };

  const iceCream = data.filter((p) => p.type === "ice-cream" && !p.outOfStock);
  const addOns = data.filter((p) => p.type === "add-on" && !p.outOfStock);

  const combos = discounts.map((discount, i) => {
    const product = data.find((p) => p._id === discount.productId);
    const originalPrice = product ? product.price * discount.quantity : 0;
    const parts = discount.name.split(/\s+/);
    return {
      scriptWord: parts[0].charAt(0).toUpperCase() + parts[0].slice(1),
      displayName: parts.slice(1).join(" ").toUpperCase(),
      quantity: `${discount.quantity} de ${product?.name || ""}`,
      originalPrice,
      discountedPrice: originalPrice - discount.value,
      savings: discount.value,
      imageSrc: comboImages[i],
    };
  });

  return (
    <div id={menuId || "ice-cream-menu"} className="kl-menu menu" style={{ backgroundColor: '#FBC6D7' }}>

      <div className="kl-ice-cream">
        {/* Column 1: Helados */}
        <div className="kl-col">
          <h2 className="kl-heading">Helados</h2>
          <ul className="kl-product-list">
            {iceCream.map((item) => (
              <li key={item._id} className="kl-product-row">
                {iconsByFlavours[item.flavours] && (
                  <img src={iconsByFlavours[item.flavours]} alt="" className="kl-tub-icon" />
                )}
                <span className="kl-product-name">
                  {item.name}
                  {item.flavours && (
                    <span className="kl-flavours-tag">hasta {item.flavours} sabores</span>
                  )}
                </span>
                <span className="kl-product-price">${item.price}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2: Combos */}
        {combos.length > 0 && (
          <div className="kl-col kl-col-combos">
            <h2 className="kl-heading">Combos</h2>
            <div className="kl-combos-list">
              {combos.map((combo, i) => (
                <div key={i} className="kl-combo-card">
                  {combo.imageSrc && (
                    <img src={combo.imageSrc} alt="" className="kl-combo-img" />
                  )}
                  <div className="kl-combo-info">
                    <span className="kl-combo-title">
                      <em>{combo.scriptWord}</em> {combo.displayName}
                    </span>
                    <span className="kl-combo-qty">{combo.quantity}</span>
                    <div className="kl-combo-prices">
                      <span className="kl-combo-old">${combo.originalPrice}</span>
                      <span className="kl-combo-new">${combo.discountedPrice}</span>
                    </div>
                  </div>
                  <div className="kl-combo-badge">
                    <span>Ahorras</span>
                    <strong>${combo.savings}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Column 3: Adicionales */}
        <div className="kl-col">
          <h2 className="kl-heading">Adicionales</h2>
          <ul className="kl-addons-grid">
            {addOns.map((item) => (
              <li key={item._id} className="kl-addon-card">
                {item.imgUrl && (
                  <img src={item.imgUrl} alt="" className="kl-addon-img" crossOrigin="anonymous" />
                )}
                <span className="kl-addon-name">{item.name}</span>
                <span className="kl-addon-price">${item.price}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
