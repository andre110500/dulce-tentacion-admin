import React from "react";
import IceCreamMenu from "./IceCreamMenu";
import FlavoursMenu from "./FlavoursMenu";
import Section from "./Section";
import FrozenTreatsMenu from "./FrozenTreatsMenu";

export default function Home() {
  return (
    <>
      <Section
        h1="Productos"
        route="products"
        schemaRoute="products/schema"
        Menu={IceCreamMenu}
        SecondaryMenu={FrozenTreatsMenu}
      />
      <Section
        h1="Sabores"
        route="generic/flavour"
        schemaRoute="generic/flavour/schema"
        Menu={FlavoursMenu}
      />

      <Section
        h1="Salsas"
        route="generic/sauce"
        schemaRoute="generic/sauce/schema"
      />

      <Section
        h1="Crocks"
        route="generic/crock"
        schemaRoute="generic/crock/schema"
      />
      <Section
        h1="Palitos de crema"
        route="generic/cream"
        schemaRoute="generic/crock/schema"
      />
    </>
  );
}
