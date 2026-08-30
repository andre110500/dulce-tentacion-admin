/*
  MenuSection: wrapper para secciones que tienen un menú visual (vista previa + subida automática).
  Reemplaza el uso directo de <Section Menu={...}> separando la lógica de menú en su propio componente.
  Recibe un MenuComponent (KioskMenu, FrozenTreatsMenu, IceCreamMenu, FlavoursMenu) y lo renderiza dentro de
  MenuUploadSection con soporte para captura de pantalla y subida automática cuando los datos cambian.
*/

import { useLayoutEffect, useRef, useContext, useMemo } from "react";
// useLayoutEffect: dispara la subida automatica apenas el DOM se actualiza con nuevos datos.
// useRef: isFirstRender flag para saltear el primer render (Strict Mode).
// useContext: lee dbItemsArr del ItemsContext que Section provee a sus hijos.

import { toast } from "react-toastify";
// toast: notificaciones de exito/error de la subida automatica del menu.

import { generateAndUploadMenu } from "../functions/generateAndUploadMenu";
// generateAndUploadMenu: genera una captura del DOM del menu y la sube al storage.

import { generateAndUploadKioskMenu } from "../functions/generateAndUploadKioskMenu";
// generateAndUploadKioskMenu: genera version landscape (1366x768) y la sube con prefijo kiosk-.

import Section from "./Section";
// Section: componente base que ya maneja el fetch de datos, la tabla y la paginacion.
// MenuSection anida su contenido como children de Section para reusar toda esa logica.

import MenuUploadSection from "./MenuUploadSection";
// MenuUploadSection: toma una captura del menu (html2canvas) y muestra la preview.

import ItemsContext from "../Contexts/ItemsContext";
// ItemsContext: contexto donde Section expone dbItemsArr, route, itemKeys, etc. Lo necesitamos
// para acceder a los datos desde adentro del arbol de Section (que es nuestro padre).

// MenuContent es un componente interno que se renderiza DENTRO de Section, por eso puede
// usar useContext(ItemsContext) para leer dbItemsArr. Aqui vive toda la logica de subida.
const entityMenuMap: Record<string, string[]> = {
  "ice-cream": ["ice-cream-menu"],
  "add-on": ["ice-cream-menu"],
  "frozen-treat": ["frozen-treats-menu"],
  "drink": ["drinks-cigarettes-menu"],
  "cigarette": ["drinks-cigarettes-menu"],
  "flavour": ["flavours-menu-1", "flavours-menu-2"],
  "discount": ["ice-cream-menu"],
  "__no_type__": ["flavours-menu-1", "flavours-menu-2"],
};

export function MenuContent({ menuIds, MenuComponent, KioskMenuComponent, menuPages, chunkSize, columns, templateImg, discountsList, productsData }) {
  // menuIds: ej. ["ice-cream-menu"], determina que IDs de menu se generan/suben.
  // MenuComponent: componente React que se renderiza dentro de MenuUploadSection.
  //   MenuContent lo invoca como <MenuComponent data={chunk} page={page} menuId={...} columns={columns} templateImg={templateImg} />.
  //   Puede ser KioskMenu, FrozenTreatsMenu, IceCreamMenu, FlavoursMenu, etc. — cualquier componente que acepte esas props.
  // menuPages: array de paginas a renderizar, ej. [1] para 1 menu, [1,2] para Sabores.
  // chunkSize: si esta definido, agrupa los productos por subType y empaqueta grupos enteros
  //   en cada hoja respetando este limite de items por pagina.
  // columns: cuantas columnas de grid usa el MenuComponent (solo aplica a KioskMenu).
  // templateImg: ruta de la imagen de fondo del menu (solo KioskMenu y FrozenTreatsMenu).
  // productsData: opcional. Cuando se provee (ej. pagina Descuentos), se usa como fuente de productos
  //   del menu en lugar de dbItemsArr del contexto (que en esa pagina son los descuentos).

  const { dbItemsArr } = useContext(ItemsContext);
  // Lee el arreglo de datos desde el contexto que Section expone a sus hijos.
  // Cuando Section termina el fetch, dbItemsArr cambia y esto re-renderiza MenuContent.
  // - Pagina de helados/paginas normales: dbItemsArr son los productos del menu.
  // - Pagina Descuentos: dbItemsArr son los descuentos (los que se editan desde la tabla).

  const usesProductsData = productsData !== undefined;
  // Cuando se provee productsData (pagina Descuentos), el menu usa productos de ese fetch extra,
  // y los combos con descuento salen de dbItemsArr (los descuentos editados de la tabla).
  // En las demas paginas no hay productsData: dbItemsArr son los productos y los descuentos
  // llegan por prop discountsList.

  // Productos del menu.
  const menuProducts = productsData ?? dbItemsArr;

  // Descuentos del menu. En la pagina Descuentos salen del contexto (siempre frescos tras editar).
  // Se filtran por tipo ice-cream igual que en IceCreamPage.
  const menuDiscounts = usesProductsData
    ? (dbItemsArr || []).filter((d) => !d.outOfStock && d.type === "ice-cream")
    : discountsList;

  // Fuente de cambios a vigilar para la subida automatica.
  const dataSource = menuProducts;

  // Filtra productos agotados y lo usa tanto para computar paginas como para pasar los datos.
  const filtered = dataSource?.filter((product) => !product.outOfStock) || [];

  // Cuando chunkSize esta activo, agrupa por subType y empaqueta grupos enteros en cada hoja
  // para que ningun grupo quede partido entre dos paginas.
  const groupPages = useMemo(() => {
    if (!chunkSize) return null;

    // Agrupa los items por subType (los que no tienen subType van a "__no_subtype__").
    const groups = {};
    for (const item of filtered) {
      const key = item.subType || "__no_subtype__";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }

    // Ordena: primero los grupos con subType (alfabetico), luego los que no tienen.
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === "__no_subtype__") return 1;
      if (b === "__no_subtype__") return -1;
      return a.localeCompare(b);
    });

    // Empaqueta grupos enteros en paginas respetando chunkSize.
    const chunks = [];
    let currentChunk = [];
    let currentCount = 0;

    for (const key of sortedKeys) {
      const items = groups[key];
      if (currentCount + items.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentCount = 0;
      }
      currentChunk.push(...items);
      currentCount += items.length;
    }
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }, [chunkSize, filtered]);

  // pages: con chunkSize usa las paginas de groupPages; sin chunkSize usa menuPages.
  // resolvedMenuIds: con chunkSize genera IDs secuenciales por pagina.
  const pages = chunkSize
    ? (groupPages || []).map((_, i) => i + 1)
    : menuPages;

  const resolvedMenuIds = chunkSize
    ? pages.map((_, i) => `${menuIds[0]}-${i + 1}`)
    : menuIds;

  const isFirstRender = useRef(true);
  // isFirstRender: evita la subida automatica en el primer render (incluye el re-monte de Strict Mode).

  const prevDataRef = useRef(dataSource);
  // prevDataRef: guarda la fuente de datos anterior para comparar y detectar que tipo de entidad cambio.

  const prevDiscountsRef = useRef(menuDiscounts);
  // prevDiscountsRef: guarda la lista de descuentos del menu anterior para detectar cambios en ella
  // (relevante en la pagina Descuentos, donde los productos no cambian al editar un descuento).

  const uploadMenus = async (idsToUpload = resolvedMenuIds) => {
    // Itera sobre cada menuId (resuelto) y genera+sube cada menu llamando a generateAndUploadMenu.
    // Con chunkSize activo, esto sube tantas imagenes como hojas tenga el menu.
    // idsToUpload: opcional, permite filtrar solo los menus afectados por el cambio.
    for (const id of idsToUpload) {
      await generateAndUploadMenu(id);
    }
  };

  const uploadKioskMenus = async (idsToUpload = resolvedMenuIds) => {
    // Genera versiones landscape (1366x768) de cada menu y las sube con prefijo kiosk-.
    for (const id of idsToUpload) {
      await generateAndUploadKioskMenu(id);
    }
  };

  useLayoutEffect(() => {
    // Efecto de SUBIDA AUTOMATICA: se dispara sincronicamente despues de cada cambio en la fuente
    // de datos (dbItemsArr, o productsData si se provee) o en discountsList.
    // Saltea el primer render (Strict Mode monta/desmonta dos veces y duplicaria la subida).
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevDataRef.current = dataSource;
      prevDiscountsRef.current = menuDiscounts;
      return;
    }

    // Si aun no hay datos (fetch pendiente) no hace nada.
    if (!dataSource) {
      return;
    }

    // Detecta que tipos de entidad cambiaron comparando el array anterior con el actual.
    const prevData = prevDataRef.current || [];
    const affectedTypes = new Set<string>();

    // Cuenta items por tipo en cada version.
    const countByType = (data) => {
      const counts: Record<string, number> = {};
      for (const item of data) {
        const key = item.type || "__no_type__";
        counts[key] = (counts[key] || 0) + 1;
      }
      return counts;
    };

    const prevCounts = countByType(prevData);
    const newCounts = countByType(dataSource);

    // Detecta tipos con cantidad diferente (agregados o eliminados).
    const allTypes = new Set([...Object.keys(prevCounts), ...Object.keys(newCounts)]);
    for (const type of allTypes) {
      if ((prevCounts[type] || 0) !== (newCounts[type] || 0)) {
        affectedTypes.add(type);
      }
    }

    // Detecta items modificados (misma cantidad pero contenido diferente).
    if (prevData.length === dataSource.length) {
      for (let i = 0; i < dataSource.length; i++) {
        if (JSON.stringify(prevData[i]) !== JSON.stringify(dataSource[i])) {
          const type = dataSource[i].type || "__no_type__";
          affectedTypes.add(type);
        }
      }
    }

    // Detecta items sin campo "type" (sabores u otros genericos).
    const hasNoTypeItems = dataSource.some((item) => !item.type);
    const prevHadNoTypeItems = prevData.some((item) => !item.type);
    if (hasNoTypeItems || prevHadNoTypeItems) {
      affectedTypes.add("__no_type__");
    }

    prevDataRef.current = dataSource;

    // En la pagina Descuentos, los productos del menu no cambian al editar un descuento,
    // pero los descuentos (menuDiscounts, desde el contexto) si. Detecta cambios en ellos
    // para re-subir el menu de helados automaticamente.
    const prevDiscounts = prevDiscountsRef.current || [];
    const discountsChanged =
      prevDiscounts.length !== (menuDiscounts || []).length ||
      (menuDiscounts || []).some(
        (d, i) => JSON.stringify(prevDiscounts[i]) !== JSON.stringify(d)
      );
    prevDiscountsRef.current = menuDiscounts;
    if (discountsChanged) {
      for (const d of menuDiscounts || []) {
        affectedTypes.add(d.type || "discount");
      }
      // Si la lista quedo vacia o sin tipos reconocibles, fuerza "discount".
      if (discountsChanged && affectedTypes.size === 0) {
        affectedTypes.add("discount");
      }
    }

    // Si no se detectaron cambios, no sube nada.
    if (affectedTypes.size === 0) {
      return;
    }

    // Mapea los tipos afectados a los menuIds que deben re-subirse.
    const affectedMenuIds = new Set<string>();
    for (const type of affectedTypes) {
      const mapped = entityMenuMap[type];
      if (mapped) {
        for (const id of mapped) {
          affectedMenuIds.add(id);
        }
      }
    }

    // Filtra resolvedMenuIds para subir solo los menus afectados.
    // Si un tipo no esta en el mapa (dato desconocido), no sube nada.
    if (affectedMenuIds.size === 0) {
      return;
    }

    const idsToUpload = resolvedMenuIds.filter((id) => affectedMenuIds.has(id));

    console.log("Auto-upload: affected types", [...affectedTypes], "→ menu IDs", [...affectedMenuIds], "→ filtered", idsToUpload);

    // Ejecuta la subida solo de los menus filtrados (vertical + kiosk landscape).
    Promise.all([
      uploadMenus(idsToUpload),
      uploadKioskMenus(idsToUpload),
    ])
      .then(() => {
        toast.success(`Menús actualizados: ${idsToUpload.join(", ")}`);
      })
      .catch((err) => {
        console.error("Auto-upload failed:", err);
        toast.error(`No se pudo actualizar el menú automáticamente (${idsToUpload.join(", ")})`);
      });

  }, [dataSource, menuDiscounts]);
  // Se re-ejecuta cuando cambia la fuente de datos (productos del menu) o los descuentos del menu.

  return (
    // Renderiza el contenedor de menus con tantas instancias de MenuUploadSection como paginas tenga.
    // Con chunkSize activo, cada pagina recibe un slice diferente de datos y un menuId unico.
    <>
    <div className="menu-container">
      {pages.map((page, index) => {
        // Con chunkSize usa los grupos pre-empaquetados; sin chunkSize pasa todo.
        const chunk = chunkSize ? (groupPages ? groupPages[index] : []) : filtered;

        return (
          <MenuUploadSection
            key={page}
            productsList={dataSource}
            flavoursList={dataSource}
            discountsList={menuDiscounts}
            kioskMenuIds={[`kiosk-${resolvedMenuIds[index]}`]}
          >
            <MenuComponent
              data={chunk}
              page={page}
              menuId={resolvedMenuIds[index]}
              columns={columns}
              templateImg={templateImg}
              discounts={menuDiscounts}
            />
          </MenuUploadSection>
        );
      })}
    </div>

    {/* Kiosk landscape container: renderiza versiones 1366x768 de cada menu, oculto offscreen */}
    <div className="kiosk-container">
      {pages.map((page, index) => {
        const chunk = chunkSize ? (groupPages ? groupPages[index] : []) : filtered;
        const kioskId = `kiosk-${resolvedMenuIds[index]}`;
        const LandscapeComponent = KioskMenuComponent || MenuComponent;

        return (
          <LandscapeComponent
            key={kioskId}
            data={chunk}
            page={page}
            menuId={kioskId}
            columns={columns}
            templateImg={templateImg}
            discounts={menuDiscounts}
          />
        );
      })}
    </div>
    </>
  );
}

export default function MenuSection({ h1, route, schemaRoute, menuIds, MenuComponent, KioskMenuComponent, menuPages = [1], chunkSize, columns: defaultColumns, templateImg, discountsList, productsData }) {
  // MenuSection es un wrapper que delega todo el fetch/tabla a Section y solo agrega la capa de menu.
  // menuIds: IDs de los elementos del DOM que se capturan como imagen (ej. "ice-cream-menu").
  // MenuComponent: componente React que se pasa como prop desde Home.jsx y se reenvia a MenuContent.
  //   MenuContent lo renderiza como <MenuComponent data={...} page={...} menuId={...} columns={...} templateImg={...} />.
  //   Puede ser KioskMenu, FrozenTreatsMenu, IceCreamMenu, FlavoursMenu, etc. — cualquier componente que acepte esas props.
  // menuPages: por defecto [1], para Sabores se pasa [1, 2] porque genera dos menus distintos.
  // chunkSize: opcional, divide el menu en varias hojas cuando hay mas items que este limite.
  // columns: opcional, cuantas columnas de grid (solo KioskMenu).
  // templateImg: opcional, ruta de la imagen de fondo (solo KioskMenu y FrozenTreatsMenu).
  // productsData: opcional. Fuente de productos del menu cuando difiere de dbItemsArr (pagina Descuentos).
  const columns = defaultColumns ?? 3;

  return (
    <Section h1={h1} route={route} schemaRoute={schemaRoute}>
      {/* Section se encarga del fetch, la tabla, la paginacion y expone dbItemsArr via context.
          MenuContent se renderiza como child, por lo que puede leer dbItemsArr del contexto. */}
      <MenuContent
        menuIds={menuIds}
        MenuComponent={MenuComponent}
        KioskMenuComponent={KioskMenuComponent}
        menuPages={menuPages}
        chunkSize={chunkSize}
        columns={columns}
        templateImg={templateImg}
        discountsList={discountsList}
        productsData={productsData}
      />
    </Section>
  );
}
