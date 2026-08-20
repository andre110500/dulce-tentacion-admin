import { useState, useEffect } from "react";
import Section from "./Section";
import MenuSection from "./MenuSection";
import IceCreamMenu from "./IceCreamMenu";
import FlavoursMenu from "./FlavoursMenu";
import KioskMenu from "./KioskMenu";
import FrozenTreatsMenu from "./FrozenTreatsMenu";
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
      // menuIds: base para generar IDs automaticos. Si hay >36 items, se crean varias hojas
      // con ids "drinks-cigarettes-menu-1", "drinks-cigarettes-menu-2", etc.
      MenuComponent={KioskMenu}
      // KioskMenu: menu en grilla con agrupacion por subType para bebidas/cigarrillos.
      //   MenuContent lo renderiza como <KioskMenu data={chunk} page={page} menuId={...} columns={2} templateImg={...} />.
      columns={2}
      chunkSize={36}
      // chunkSize: si hay mas de 36 productos, se genera una hoja extra.
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
      // menuIds: base para generar IDs automaticos. "frozen-treats-menu" coincide con el
      // id del div en FrozenTreatsMenu (via prop menuId).
      MenuComponent={FrozenTreatsMenu}
      // FrozenTreatsMenu: menu original en lista vertical para postres congelados.
      //   Ignora columns, templateImg y chunkSize porque no los necesita.
      //   Sin chunkSize ni columns, muestra todos los items en una sola hoja.
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
      // Sabores genera DOS menus (pagina 1 y pagina 2) porque entran ~8 sabores por hoja.
      // flavours-menu-1 y flavours-menu-2 son los IDs de los divs en FlavoursMenu.
      MenuComponent={FlavoursMenu}
      // FlavoursMenu: menu de sabores con diseno especifico (2 paginas, fuentes decorativas).
      //   Ignora columns, chunkSize y templateImg porque no los necesita.
      menuPages={[1, 2]}
      // menuPages: array de paginas a renderizar. Cada pagina crea un MenuUploadSection
      // separado con su propio FlavoursMenu, pasando page=1 y page=2 respectivamente.
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
