import Section from "./Section";
// Section: componente base para secciones SIN menu (solo tabla de datos).

import MenuSection from "./MenuSection";
// MenuSection: wrapper para secciones CON menu. Recibe MenuComponent, menuIds y menuPages.

import IceCreamMenu from "./IceCreamMenu";
import FlavoursMenu from "./FlavoursMenu";
import ProductsMenu from "./ProductsMenu";
// ProductsMenu: menu generico de productos en lista, usado para postres congelados, bebidas y cigarrillos.
// Cada MenuComponent define el diseno visual de su menu. Se pasan como prop a MenuSection.

export default function Home() {
  return (
    <>
      <MenuSection
        h1="Menu de Helados"
        route="products?type=ice-cream&type=add-on"
        schemaRoute="products/schema"
        menuIds={["ice-cream-menu"]}
        // menuIds: IDs de los elementos DOM del menu para la captura (html2canvas).
        // "ice-cream-menu" coincide con el id del div en IceCreamMenu.
        MenuComponent={IceCreamMenu}
        // MenuComponent: el componente que renderiza el diseno visual del menu.
      />
      <MenuSection
        h1="Bebidas y cigarrillos"
        route="products?type=drink&type=cigarette"
        schemaRoute="products/schema"
        menuIds={["drinks-cigarettes-menu"]}
        // menuIds: base para generar IDs automaticos. Si hay >10 items, se crean varias hojas
        // con ids "drinks-cigarettes-menu-1", "drinks-cigarettes-menu-2", etc.
        MenuComponent={ProductsMenu}
        chunkSize={20}
        // chunkSize: si hay mas de 20 productos, se genera una hoja extra.
      />

      <MenuSection
        h1="Postres congelados"
        route="products?type=frozen-treat"
        schemaRoute="products/schema"
        menuIds={["frozen-treats-menu"]}
        // menuIds: base para IDs. Con chunkSize se generan "frozen-treats-menu-1", etc.
        MenuComponent={ProductsMenu}
        chunkSize={20}
      />
      <MenuSection
        h1="Sabores"
        route="generic/flavour"
        schemaRoute="generic/flavour/schema"
        menuIds={["flavours-menu-1", "flavours-menu-2"]}
        // Sabores genera DOS menus (pagina 1 y pagina 2) porque entran ~8 sabores por hoja.
        // flavours-menu-1 y flavours-menu-2 son los IDs de los divs en FlavoursMenu.
        MenuComponent={FlavoursMenu}
        menuPages={[1, 2]}
        // menuPages: array de paginas a renderizar. Cada pagina crea un MenuUploadSection
        // separado con su propio FlavoursMenu, pasando page=1 y page=2 respectivamente.
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
