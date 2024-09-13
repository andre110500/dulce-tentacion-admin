import React from "react";
import template from "../assets/flavours-template.png";

export default function FlavoursMenu({ data }) {
  const ulStyle = {
    display: "flex",
    flexDirection: "column",
  };
  const flavoursInStock = data.filter((flavour) => !flavour.outOfStock);
  return (
    <div className="menu" id="flavours-menu">
      <img src={template} alt="" style={{ width: "100%" }} />
      <div className="uls-container">
        <ul className="first" style={ulStyle}>
          {flavoursInStock?.map((flavour, index) => {
            if (index < 14) {
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
          {flavoursInStock?.map((flavour, index) => {
            if (index >= 14) {
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
