import React from "react";
import template from "../assets/products-template.webp";
import iceCreamTubIcon2 from "../assets/2.png";
import iceCreamTubIcon3 from "../assets/3.png";
import iceCreamTubIcon4 from "../assets/4.png";
import DiscountCombosSection from "./DiscountCombosSection";

export default function IceCreamMenu({ data }) {
  function getPriceByFlavoursQuantity(number) {
    return data.find((obj) => obj.flavours === number)?.price;
  }

  const iconsByFlavours = {
    2: iceCreamTubIcon2,
    3: iceCreamTubIcon3,
    4: iceCreamTubIcon4,
  };

  const iceCream = data.filter((product) => {
    return product.type === "ice-cream" && !product.outOfStock;
  });

  const addOns = data.filter((product) => {
    return product.type === "add-on" && !product.outOfStock;
  });

  return (
    <div id="ice-cream-menu" className="menu products-menu">
      <img src={template} alt="" style={{ width: "100%" }} />

      <div className="uls-container">

        <ul>
          {iceCream.map((item) => (
            <li
              key={item._id}
              className={
                iconsByFlavours[item.flavours] ? "with-tub-icon" : undefined
              }
            >
              <span>
                {item.name}
                {item.flavours && (
                  <span className="flavours-label">
                    hasta {item.flavours} sabores
                  </span>
                )}
              </span>{" "}
              {iconsByFlavours[item.flavours] && (
                <img
                  src={iconsByFlavours[item.flavours]}
                  alt=""
                  className="product-tub-icon"
                />
              )}
              <span>${item.price}</span>
            </li>
          ))}
        </ul>
        <DiscountCombosSection
          familiarOriginal={getPriceByFlavoursQuantity(3) * 2}
          familiarDiscounted={getPriceByFlavoursQuantity(3) * 2 - 500}
          amigosOriginal={getPriceByFlavoursQuantity(2) * 2}
          amigosDiscounted={getPriceByFlavoursQuantity(2) * 2 - 300}
        />
        <h2>Adicionales</h2>
        <ul className="add-ons-list">
          {addOns.map((item) => {
            const words = item.name.split(" ");

            return (
              <li
                key={item._id}
                className={item.imgUrl ? "add-on-with-icon" : undefined}
              >
                <span className="add-on-name">
                  {words.map((word) => (
                    <span key={word}>{word}</span>
                  ))}
                </span>
                <span className="add-on-price">${item.price}</span>
                {item.imgUrl && (
                  <span className="add-on-icon">
                    <img src={item.imgUrl} alt="" crossOrigin="anonymous" />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
