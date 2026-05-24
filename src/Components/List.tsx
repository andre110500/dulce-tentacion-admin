import React from "react";

export default function List({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item._id}>
          <span>
            {item.name}
            {item.flavours && (
              <span className="flavours-label">
                hasta {item.flavours} sabores
              </span>
            )}
          </span>{" "}
          <span>${item.price}</span>
        </li>
      ))}
    </ul>
  );
}

