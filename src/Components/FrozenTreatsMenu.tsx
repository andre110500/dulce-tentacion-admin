import React from "react";
import template from "../assets/products-template.png";

export default function FrozenTreatsMenu({ data }) {
  const sortedProductsByPriceDescending = data.sort(
    (a, b) => b.price - a.price
  );

  const availableProductsSortedByPriceDescending =
    sortedProductsByPriceDescending.filter((product) => {
      return !product.outOfStock;
    });

  const availableFrozenTreatsSortedByPriceDescending =
    availableProductsSortedByPriceDescending.filter((product) => {
      return product.type === "frozen-treat";
    });
  return (
    <div id="products-menu" className="menu">
      <img src={template} alt="" style={{ width: "100%" }} />

      <div className="uls-container">
        <List items={availableFrozenTreatsSortedByPriceDescending} />
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
