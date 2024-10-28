import React from "react";
import template from "../assets/products-template.png";

export default function IceCreamMenu({ data }) {
  const sortedProductsByPriceDescending = data.sort(
    (a, b) => b.price - a.price
  );

  const availableProductsSortedByPriceDescending =
    sortedProductsByPriceDescending.filter((product) => {
      return !product.outOfStock;
    });

  function getPriceByFlavoursQuantity(number) {
    return sortedProductsByPriceDescending.find(
      (obj) => obj.flavours === number
    )?.price;
  }

  const availableIceCreamSortedByPriceDescending =
    availableProductsSortedByPriceDescending.filter((product) => {
      return product.type === "ice-cream";
    });

  const availableAddOnsSortedByPriceDescending =
    availableProductsSortedByPriceDescending.filter((product) => {
      return product.type === "add-ons";
    });
  return (
    <div id="products-menu" className="menu">
      <img src={template} alt="" style={{ width: "100%" }} />

      <div className="uls-container">
        <List items={availableIceCreamSortedByPriceDescending} />
        <h2>Combos con descuento:</h2>
        <ul>
          <li>
            <span>2u 1 kg</span>
            <p>
              <span className="line-through">
                ${getPriceByFlavoursQuantity(4) * 2}
              </span>
              <span> ${getPriceByFlavoursQuantity(4) * 2 - 300}</span>
            </p>
          </li>
          <li>
            <span>2u 1/2 kg</span>
            <p>
              <span className="line-through">
                ${getPriceByFlavoursQuantity(3) * 2}
              </span>
              <span> ${getPriceByFlavoursQuantity(3) * 2 - 200}</span>
            </p>
          </li>
          <li>
            <span>2u 1/4 kg</span>
            <p>
              <span className="line-through">
                ${getPriceByFlavoursQuantity(2) * 2 || "undefined"}
              </span>
              <span>
                {" "}
                ${getPriceByFlavoursQuantity(2) * 2 - 200 || "undefined"}
              </span>
            </p>
          </li>
        </ul>
        <h2>Adicionales</h2>
        <List items={availableAddOnsSortedByPriceDescending} />
      </div>
    </div>
  );
}

function List({ items }) {
  return (
    <ul className="first">
      {items.map((item) => (
        <li key={item._id}>
          <span>{item.name}</span> <span>${item.price}</span>
        </li>
      ))}
    </ul>
  );
}
