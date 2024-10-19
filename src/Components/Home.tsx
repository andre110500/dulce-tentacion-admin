import React from "react";
import ProductsMenu from "./ProductsMenu";
import FlavoursMenu from "./FlavoursMenu";
import Section from "./Section";

export default function Home() {
  return (
    <>
      <Section
        h1="Productos"
        route="products"
        schemaRoute="products/schema"
        Menu={ProductsMenu}
      />
      <Section
        h1="Sabores"
        route="generic/flavour"
        schemaRoute="generic/flavour/schema"
        Menu={FlavoursMenu}
      />
    </>
  );
}
