import React from "react";
import template from "../assets/flavours-template.png";

interface FlavourItem {
  _id: string;
  name: string;
  outOfStock: boolean;
  imgUrl?: string;
  [key: string]: any;
}

interface FlavoursMenuProps {
  data: FlavourItem[];
  page?: number;
}

const PlaceholderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "100%", height: "100%", color: "#dc1537" }}
  >
    <path d="M12 2a5 5 0 0 0-5 5v1a4 4 0 0 0-3 3.87 3.13 3.13 0 0 0 3.13 3.13h9.74A3.13 3.13 0 0 0 20 11.87 4 4 0 0 0 17 8V7a5 5 0 0 0-5-5z" />
    <path d="M6 15v1a6 6 0 0 0 12 0v-1" />
  </svg>
);

export default function FlavoursMenu({ data, page }: FlavoursMenuProps) {
  const ulStyle = {
    display: "flex",
    flexDirection: "column",
  };

  const flavoursInStock = data.filter((flavour) => !flavour.outOfStock);
  const halfLength = Math.ceil(flavoursInStock.length / 2);

  const currentPage = page || 1;
  const pageFlavours = currentPage === 1
    ? flavoursInStock.slice(0, halfLength)
    : flavoursInStock.slice(halfLength);

  const firstColCount = Math.floor(pageFlavours.length * 0.4);
  const firstCol = pageFlavours.slice(0, firstColCount);
  const secondCol = pageFlavours.slice(firstColCount);

  const menuId = page ? `flavours-menu-${page}` : "flavours-menu";

  return (
    <div className="menu" id={menuId}>
      <img src={template} alt="" style={{ width: "100%" }} />
      <div className="uls-container">
        <ul className="first" style={ulStyle}>
          {firstCol.map((flavour) => (
            <li key={flavour._id}>
              {flavour.imgUrl ? (
                <img src={flavour.imgUrl} alt="" className="flavour-img" crossOrigin="anonymous" />
              ) : (
                <div className="flavour-img-placeholder">
                  <PlaceholderIcon />
                </div>
              )}
              <span>{flavour.name}</span>
            </li>
          ))}
        </ul>
        <ul className="second" style={ulStyle}>
          {secondCol.map((flavour) => (
            <li key={flavour._id}>
              {flavour.imgUrl ? (
                <img src={flavour.imgUrl} alt="" className="flavour-img" crossOrigin="anonymous" />
              ) : (
                <div className="flavour-img-placeholder">
                  <PlaceholderIcon />
                </div>
              )}
              <span>{flavour.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
