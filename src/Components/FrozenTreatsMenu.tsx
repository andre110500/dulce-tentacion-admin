import React from "react";
import template from "../assets/products-template.png";
import List from "./List";

export default function FrozenTreatsMenu({ data }) {
  const frozenTreats = data.filter((product) => {
    return product.type === "frozen-treat";
  });
  return (
    <div id="products-menu" className="menu">
      <img src={template} alt="" style={{ width: "100%" }} />

      <div className="uls-container">
        <List items={frozenTreats} />
      </div>
    </div>
  );
}
