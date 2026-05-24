import React from "react";

interface ListItem {
  _id: string;
  name: string;
  price: number;
  flavours?: number;
  [key: string]: any;
}

export default function List({ items }: { items: ListItem[] }) {
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

