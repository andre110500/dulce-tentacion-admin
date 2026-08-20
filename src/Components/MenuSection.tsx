/*
  MenuSection: wrapper para secciones que tienen un menú visual (vista previa + subida automática).
  Reemplaza el uso directo de <Section Menu={...}> separando la lógica de menú en su propio componente.
  Recibe un MenuComponent (KioskMenu, FrozenTreatsMenu, IceCreamMenu, FlavoursMenu) y lo renderiza dentro de
  MenuUploadSection con soporte para captura de pantalla y subida automática cuando los datos cambian.
*/

import { useLayoutEffect, useRef, useState, useContext, useMemo } from "react";
// useLayoutEffect: dispara la subida automatica apenas el DOM se actualiza con nuevos datos.
// useRef: isFirstRender flag para saltear el primer render (Strict Mode).
// useState: estado local de subida (isUploadingMenu) para controlar el boton de subir.
// useContext: lee dbItemsArr del ItemsContext que Section provee a sus hijos.

import Swal from "sweetalert2";
// Swal: alertas de exito/error al subir el menu manualmente.

import { generateAndUploadMenu } from "../functions/generateAndUploadMenu";
// generateAndUploadMenu: genera una captura del DOM del menu y la sube al storage.

import Section from "./Section";
// Section: componente base que ya maneja el fetch de datos, la tabla y la paginacion.
// MenuSection anida su contenido como children de Section para reusar toda esa logica.

import MenuUploadSection from "./MenuUploadSection";
// MenuUploadSection: toma una captura del menu (html2canvas), muestra la preview y provee el boton "SUBIR MENU".

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
};

function MenuContent({ menuIds, MenuComponent, menuPages, chunkSize, columns, templateImg, discountsList }) {
  // menuIds: ej. ["ice-cream-menu"], determina que IDs de menu se generan/suben.
  // MenuComponent: componente React que se renderiza dentro de MenuUploadSection.
  //   MenuContent lo invoca como <MenuComponent data={chunk} page={page} menuId={...} columns={columns} templateImg={templateImg} />.
  //   Puede ser KioskMenu, FrozenTreatsMenu, IceCreamMenu, FlavoursMenu, etc. — cualquier componente que acepte esas props.
  // menuPages: array de paginas a renderizar, ej. [1] para 1 menu, [1,2] para Sabores.
  // chunkSize: si esta definido, agrupa los productos por subType y empaqueta grupos enteros
  //   en cada hoja respetando este limite de items por pagina.
  // columns: cuantas columnas de grid usa el MenuComponent (solo aplica a KioskMenu).
  // templateImg: ruta de la imagen de fondo del menu (solo KioskMenu y FrozenTreatsMenu).

  const { dbItemsArr } = useContext(ItemsContext);
  // Lee el arreglo de productos desde el contexto que Section expone a sus hijos.
  // Cuando Section termina el fetch, dbItemsArr cambia y esto re-renderiza MenuContent.

  // Filtra productos agotados y lo usa tanto para computar paginas como para pasar los datos.
  const filtered = dbItemsArr?.filter((product) => !product.outOfStock) || [];

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

  const prevDataRef = useRef(dbItemsArr);
  // prevDataRef: guarda el dbItemsArr anterior para comparar y detectar que tipo de entidad cambio.

  const [isUploadingMenu, setIsUploadingMenu] = useState(false);
  // Estado que deshabilita el boton "SUBIR MENU" mientras se esta subiendo para evitar doble click.

  const uploadMenus = async (idsToUpload = resolvedMenuIds) => {
    // Itera sobre cada menuId (resuelto) y genera+sube cada menu llamando a generateAndUploadMenu.
    // Con chunkSize activo, esto sube tantas imagenes como hojas tenga el menu.
    // idsToUpload: opcional, permite filtrar solo los menus afectados por el cambio.
    for (const id of idsToUpload) {
      await generateAndUploadMenu(id);
    }
  };

  const handleManualMenuUpload = async () => {
    // Manejador del boton "SUBIR MENU" en MenuUploadSection.
    // Activa el estado de carga, ejecuta uploadMenus(), y muestra exito o error con Swal.
    try {
      setIsUploadingMenu(true);
      await uploadMenus();
      await Swal.fire({
        icon: "success",
        text: "Menú subido correctamente",
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#e8547e",
      });
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        text: "No se pudo subir el menú",
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#e8547e",
      });
    } finally {
      setIsUploadingMenu(false);
    }
  };

  useLayoutEffect(() => {
    // Efecto de SUBIDA AUTOMATICA: se dispara sincronicamente despues de cada cambio en dbItemsArr.
    // Saltea el primer render (Strict Mode monta/desmonta dos veces y duplicaria la subida).
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevDataRef.current = dbItemsArr;
      return;
    }

    // Si aun no hay datos (fetch pendiente) no hace nada.
    if (!dbItemsArr) {
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
    const newCounts = countByType(dbItemsArr);

    // Detecta tipos con cantidad diferente (agregados o eliminados).
    const allTypes = new Set([...Object.keys(prevCounts), ...Object.keys(newCounts)]);
    for (const type of allTypes) {
      if ((prevCounts[type] || 0) !== (newCounts[type] || 0)) {
        affectedTypes.add(type);
      }
    }

    // Detecta items modificados (misma cantidad pero contenido diferente).
    if (prevData.length === dbItemsArr.length) {
      for (let i = 0; i < dbItemsArr.length; i++) {
        if (JSON.stringify(prevData[i]) !== JSON.stringify(dbItemsArr[i])) {
          const type = dbItemsArr[i].type || "__no_type__";
          affectedTypes.add(type);
        }
      }
    }

    // Detecta items sin campo "type" (sabores u otros genericos).
    const hasNoTypeItems = dbItemsArr.some((item) => !item.type);
    const prevHadNoTypeItems = prevData.some((item) => !item.type);
    if (hasNoTypeItems || prevHadNoTypeItems) {
      affectedTypes.add("__no_type__");
    }

    prevDataRef.current = dbItemsArr;

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

    // Ejecuta la subida solo de los menus filtrados.
    uploadMenus(idsToUpload);

  }, [dbItemsArr]);
  // Solo se re-ejecuta cuando dbItemsArr cambia (nuevos datos del fetch).

  return (
    // Renderiza el contenedor de menus con tantas instancias de MenuUploadSection como paginas tenga.
    // Con chunkSize activo, cada pagina recibe un slice diferente de datos y un menuId unico.
    <div className="menu-container">
      {pages.map((page, index) => {
        // Con chunkSize usa los grupos pre-empaquetados; sin chunkSize pasa todo.
        const chunk = chunkSize ? (groupPages ? groupPages[index] : []) : filtered;

        return (
          <MenuUploadSection
            key={page}
            productsList={dbItemsArr}
            flavoursList={dbItemsArr}
            discountsList={discountsList}
            onManualMenuUpload={handleManualMenuUpload}
            isUploadingMenu={isUploadingMenu}
          >
            <MenuComponent
              data={chunk}
              page={page}
              menuId={resolvedMenuIds[index]}
              columns={columns}
              templateImg={templateImg}
              discounts={discountsList}
            />
          </MenuUploadSection>
        );
      })}
    </div>
  );
}

export default function MenuSection({ h1, route, schemaRoute, menuIds, MenuComponent, menuPages = [1], chunkSize, columns: defaultColumns, templateImg, discountsList }) {
  // MenuSection es un wrapper que delega todo el fetch/tabla a Section y solo agrega la capa de menu.
  // menuIds: IDs de los elementos del DOM que se capturan como imagen (ej. "ice-cream-menu").
  // MenuComponent: componente React que se pasa como prop desde Home.jsx y se reenvia a MenuContent.
  //   MenuContent lo renderiza como <MenuComponent data={...} page={...} menuId={...} columns={...} templateImg={...} />.
  //   Puede ser KioskMenu, FrozenTreatsMenu, IceCreamMenu, FlavoursMenu, etc. — cualquier componente que acepte esas props.
  // menuPages: por defecto [1], para Sabores se pasa [1, 2] porque genera dos menus distintos.
  // chunkSize: opcional, divide el menu en varias hojas cuando hay mas items que este limite.
  // columns: opcional, cuantas columnas de grid (solo KioskMenu).
  // templateImg: opcional, ruta de la imagen de fondo (solo KioskMenu y FrozenTreatsMenu).
  const columns = defaultColumns ?? 3;

  return (
    <Section h1={h1} route={route} schemaRoute={schemaRoute}>
      {/* Section se encarga del fetch, la tabla, la paginacion y expone dbItemsArr via context.
          MenuContent se renderiza como child, por lo que puede leer dbItemsArr del contexto. */}
      <MenuContent
        menuIds={menuIds}
        MenuComponent={MenuComponent}
        menuPages={menuPages}
        chunkSize={chunkSize}
        columns={columns}
        templateImg={templateImg}
        discountsList={discountsList}
      />
    </Section>
  );
}
