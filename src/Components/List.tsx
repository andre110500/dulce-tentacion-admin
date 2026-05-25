import React from "react";
import iceCreamTubIcon2 from "../assets/2.png";
import iceCreamTubIcon3 from "../assets/3.png";
import iceCreamTubIcon4 from "../assets/4.png";

interface ListItem {
  _id: string;
  name: string;
  price: number;
  flavours?: number;
  [key: string]: any;
}

export default function List({ items }: { items: ListItem[] }) {
  const getTubIcon = (item: ListItem) => {
    if (item.type !== "ice-cream") return null;

    if (!item.flavours) return null;

    const iconsByFlavours: Record<number, string> = {
      2: iceCreamTubIcon2,
      3: iceCreamTubIcon3,
      4: iceCreamTubIcon4,
    };

    return iconsByFlavours[item.flavours];
  };

  return (
    <ul>
      {items.map((item) => {
        const tubIcon = getTubIcon(item);

        return (
          <li key={item._id} className={tubIcon ? "with-tub-icon" : undefined}>
            <span>
              {item.name}
              {item.flavours && (
                <span className="flavours-label">
                  hasta {item.flavours} sabores
                </span>
              )}
            </span>{" "}
            {tubIcon && (
              <img src={tubIcon} alt="" className="product-tub-icon" />
            )}
            <span>${item.price}</span>
          </li>
        );
      })}
    </ul>
  );
}

