import React from "react";
import template from "../assets/products-template.png";
import List from "./List";

export default function IceCreamMenu({ data }) {
  function getPriceByFlavoursQuantity(number) {
    return data.find((obj) => obj.flavours === number)?.price;
  }

  const iceCream = data.filter((product) => {
    return product.type === "ice-cream";
  });

  const addOns = data.filter((product) => {
    return product.type === "add-on";
  });
  return (
    <div id="ice-cream-menu" className="menu products-menu">
      <img src={template} alt="" style={{ width: "100%" }} />

      <div className="uls-container">
        <h2>Helado artesanal</h2>
        <List items={iceCream} />
        <h2>Combos con descuento:</h2>
        <ul>
          <li>
            <span>2 de 1/2 kg</span>
            <p>
              <span className="line-through">
                ${getPriceByFlavoursQuantity(3) * 2}
              </span>
              <span> ${getPriceByFlavoursQuantity(3) * 2 - 500}</span>
            </p>
          </li>
          <li>
            <span>2 de 1/4 kg</span>
            <p>
              <span className="line-through">
                ${getPriceByFlavoursQuantity(2) * 2 || "undefined"}
              </span>
              <span>
                ${getPriceByFlavoursQuantity(2) * 2 - 300 || "undefined"}
              </span>
            </p>
          </li>
        </ul>
        <h2>Adicionales</h2>
        <List items={addOns} />
      </div>
    </div>
  );
}
