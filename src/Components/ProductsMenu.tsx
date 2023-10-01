import React from "react";
import template from "../assets/flavours-template.png";

export default function ProductsMenu({ flavoursList }) {
  const ulStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };
  return (
    <div id="menu" style={{ width: "400px", position: "relative" }}>
      <img src={template} alt="" style={{ width: "100%" }} />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50% ,-50%)",
          width: "100%",
          height: "45%",
          outline: "1px solid black",
          display: "grid",

          gridTemplateColumns: "1fr 1fr",

          fontSize: "0.8rem",
          letterSpacing: "0.05rem",
          wordSpacing: "0.1rem",
          padding: "0rem 0.5rem",
        }}
      >
        <ul style={ulStyle}>
          {flavoursList?.map((flavour, index) => {
            if (index <= flavoursList.length / 2) {
              return <li>. {flavour.name}</li>;
            }
          })}
        </ul>
        <ul style={ulStyle}>
          {flavoursList?.map((flavour, index) => {
            if (index > flavoursList.length / 2) {
              return <li>. {flavour.name}</li>;
            }
          })}
        </ul>
      </div>
    </div>
  );
}
