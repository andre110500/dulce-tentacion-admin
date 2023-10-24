import React from "react";
import template from "../assets/flavours-template.png";

export default function FlavoursMenu({ flavoursList, refe }) {
  const ulStyle = {
    display: "flex",
    flexDirection: "column",
  };
  return (
    <div ref={refe} className="menu" id="flavours-menu">
      <img src={template} alt="" style={{ width: "100%" }} />
      <div className="uls-container">
        <ul className="first" style={ulStyle}>
          {flavoursList?.map((flavour, index) => {
            if (
              index < Math.floor(flavoursList.length / 2) &&
              !flavour.outOfStock
            ) {
              return (
                <li key={flavour._id}>
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
                <li key={flavour._id}>
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
