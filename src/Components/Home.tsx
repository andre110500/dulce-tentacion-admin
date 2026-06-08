import Section from "./Section";
// Section: componente base para secciones SIN menu (solo tabla de datos).

import MenuSection from "./MenuSection";
// MenuSection: wrapper para secciones CON menu. Recibe MenuComponent (el componente React que
//   renderiza el diseno visual del menu), menuIds, menuPages y props especificas del menu
//   como columns, chunkSize y templateImg que se reenvian al MenuComponent.

import IceCreamMenu from "./IceCreamMenu";
import FlavoursMenu from "./FlavoursMenu";
import ProductsMenu from "./ProductsMenu";
// ProductsMenu: menu generico de productos en grilla, usado para postres congelados, bebidas y cigarrillos.
// MenuComponent: prop de MenuSection que recibe un componente de menu. MenuSection se lo pasa a
//   MenuContent, que lo renderiza como <MenuComponent data={...} page={...} menuId={...} columns={...} />.
//   Cualquier componente que acepte esas props puede usarse aqui (ProductsMenu, IceCreamMenu, FlavoursMenu).

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
        // MenuComponent: componente React que renderiza el diseno del menu.
        //   MenuSection lo pasa a MenuContent, que lo invoca como <IceCreamMenu data={...} page={...} />.
        //   Las props extra (columns, templateImg, etc.) simplemente las ignora si no las usa.
      />
      <MenuSection
        h1="Bebidas y cigarrillos"
        route="products?type=drink&type=cigarette"
        schemaRoute="products/schema"
        menuIds={["drinks-cigarettes-menu"]}
        // menuIds: base para generar IDs automaticos. Si hay >36 items, se crean varias hojas
        // con ids "drinks-cigarettes-menu-1", "drinks-cigarettes-menu-2", etc.
        MenuComponent={ProductsMenu}
        // ProductsMenu: menu generico en grilla. Recibe columns, chunkSize, templateImg desde MenuSection.
        //   MenuContent lo renderiza como <ProductsMenu data={chunk} page={page} menuId={...} columns={4} templateImg={...} />.
        columns={4}
        chunkSize={36}
        // chunkSize: si hay mas de 36 productos, se genera una hoja extra.
      />

      <MenuSection
        h1="Postres congelados"
        route="products?type=frozen-treat"
        schemaRoute="products/schema"
        menuIds={["frozen-treats-menu"]}
        // menuIds: base para IDs. Con chunkSize se generan "frozen-treats-menu-1", etc.
        MenuComponent={ProductsMenu}
        // ProductsMenu con 3 columnas para que las cards de postres congelados se vean mas anchas.
        columns={3}
        chunkSize={36}
      />
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
