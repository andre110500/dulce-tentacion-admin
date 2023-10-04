import React from "react";
import template from "../assets/flavours-template.png";

export default function ProductsMenu({ flavoursList, refe }) {
  const ulStyle = {
    display: "flex",
    flexDirection: "column",
  };
  return (
    <div ref={refe} id="menu" style={{ position: "relative" }}>
      <img src={template} alt="" style={{ width: "100%" }} />
      <div className="uls-container">
        <ul className="first" style={ulStyle}>
          {flavoursList?.map((flavour, index) => {
            if (
              index < Math.floor(flavoursList.length / 2) &&
              !flavour.outOfStock
            ) {
              return (
                <li>
                  <span>.</span>
                  {flavour.name}
                </li>
              );
            }
          })}
        </ul>
        <ul className="second" style={{ ...ulStyle }}>
          {flavoursList?.map((flavour, index) => {
            if (
              index >= Math.floor(flavoursList.length / 2) &&
              !flavour.outOfStock
            ) {
              return (
                <li>
                  <span>.</span>
                  {flavour.name}
                </li>
              );
            }
          })}
        </ul>
      </div>
    </div>
  );
}
