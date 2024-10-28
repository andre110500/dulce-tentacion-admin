import React from "react";

export default function List({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item._id}>
          <span>{item.name}</span> <span>${item.price}</span>
        </li>
      ))}
    </ul>
  );
}
