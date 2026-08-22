import { useState, useEffect } from "react";
import Section from "./Section";
import MenuSection from "./MenuSection";
import IceCreamMenu from "./IceCreamMenu";
import IceCreamMenuKiosk from "./IceCreamMenuKiosk";
import FlavoursMenu from "./FlavoursMenu";
import FlavoursMenuKiosk from "./FlavoursMenuKiosk";
import KioskMenu from "./KioskMenu";
import FrozenTreatsMenu from "./FrozenTreatsMenu";
import FrozenTreatsMenuKiosk from "./FrozenTreatsMenuKiosk";
import get_AndDo_ from "../functions/get_AndDo_";

export function IceCreamPage() {
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    get_AndDo_("discounts").then((response) => {
      if (response?.data) {
        setDiscounts(response.data.filter((d) => d.type === "ice-cream"));
      }
    });
  }, []);

  return (
    <MenuSection
      h1="Menu de Helados"
      route="products?type=ice-cream&type=add-on"
      schemaRoute="products/schema"
      menuIds={["ice-cream-menu"]}
      MenuComponent={IceCreamMenu}
      KioskMenuComponent={IceCreamMenuKiosk}
      discountsList={discounts}
    />
  );
}

export function DrinksAndCigarettesPage() {
  return (
    <MenuSection
      h1="Bebidas y cigarrillos"
      route="products?type=drink&type=cigarette"
      schemaRoute="products/schema"
      menuIds={["drinks-cigarettes-menu"]}
      MenuComponent={KioskMenu}
      columns={2}
      chunkSize={36}
    />
  );
}

export function FrozenTreatsPage() {
  return (
    <MenuSection
      h1="Postres congelados"
      route="products?type=frozen-treat"
      schemaRoute="products/schema"
      menuIds={["frozen-treats-menu"]}
      MenuComponent={FrozenTreatsMenu}
      KioskMenuComponent={FrozenTreatsMenuKiosk}
    />
  );
}

export function FlavoursPage() {
  return (
    <MenuSection
      h1="Sabores"
      route="generic/flavour"
      schemaRoute="generic/flavour/schema"
      menuIds={["flavours-menu-1", "flavours-menu-2"]}
      MenuComponent={FlavoursMenu}
      KioskMenuComponent={FlavoursMenuKiosk}
      menuPages={[1, 2]}
    />
  );
}

export function DiscountsPage() {
  return (
    <Section
      h1="Descuentos"
      route="discounts"
      schemaRoute="discounts/schema"
    />
  );
}

export default function Home() {
  return (
    <>
      <a         href="#/carteles" style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.65rem 1.2rem",
        borderRadius: "0.55rem",
        backgroundColor: "#100b35",
        color: "white",
        fontWeight: 800,
        fontSize: "0.78rem",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        textDecoration: "none",
        cursor: "pointer",
      }}>
        Configurar Carteles
      </a>

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
      <Section
        h1="Ositos"
        route="generic/osito"
        schemaRoute="generic/osito/schema"
      />
      <Section
        h1="Alfamios"
        route="generic/alfamio"
        schemaRoute="generic/alfamio/schema"
      />
    </>
  );
}
