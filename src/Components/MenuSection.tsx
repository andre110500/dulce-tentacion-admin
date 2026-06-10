/*
  MenuSection: wrapper para secciones que tienen un menú visual (vista previa + subida automática).
  Reemplaza el uso directo de <Section Menu={...}> separando la lógica de menú en su propio componente.
  Recibe un MenuComponent (KioskMenu, FrozenTreatsMenu, IceCreamMenu, FlavoursMenu) y lo renderiza dentro de
  MenuUploadSection con soporte para captura de pantalla y subida automática cuando los datos cambian.
*/

import { useLayoutEffect, useRef, useState, useContext, useMemo } from "react";
// useLayoutEffect: dispara la subida automatica apenas el DOM se actualiza con nuevos datos.
// useRef: changeCount persistente entre renders para saltear las primeras ejecuciones del efecto.
// useState: estado local de subida (isUploadingMenu) y columnas editables.
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
function MenuContent({ menuIds, MenuComponent, menuPages, chunkSize, columns, templateImg }) {
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

  const changeCount = useRef(0);
  // Contador de ejecuciones del useLayoutEffect. Sirve para evitar la subida automatica en los
  // primeros renders (React Strict Mode monta/desmonta dos veces y duplicaria la subida).

  const [isUploadingMenu, setIsUploadingMenu] = useState(false);
  // Estado que deshabilita el boton "SUBIR MENU" mientras se esta subiendo para evitar doble click.

  const uploadMenus = async () => {
    // Itera sobre cada menuId (resuelto) y genera+sube cada menu llamando a generateAndUploadMenu.
    // Con chunkSize activo, esto sube tantas imagenes como hojas tenga el menu.
    for (const id of resolvedMenuIds) {
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
    // Esto asegura que el menu se actualice en el storage cada vez que los productos cambian.
    changeCount.current += 1;

    // Saltea los primeros 2 disparos para evitar la doble ejecucion de Strict Mode.
    if (changeCount.current <= 2) {
      return;
    }

    // Si aun no hay datos (fetch pendiente) no hace nada.
    if (!dbItemsArr) {
      return;
    }

    // Ejecuta la subida de todos los menus definidos en resolvedMenuIds.
    uploadMenus();

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
            // productsList y flavoursList: MenuUploadSection los necesita para detectar cambios y
            // regenerar la captura automaticamente (via html2canvas). Siempre pasa dbItemsArr
            // completo (no el chunk) para que cualquier cambio dispare la regeneracion.
            productsList={dbItemsArr}
            flavoursList={dbItemsArr}
            onManualMenuUpload={handleManualMenuUpload}
            isUploadingMenu={isUploadingMenu}
          >
            <MenuComponent
              // data: con chunkSize activo, solo los items de esta hoja; sin chunkSize, todos.
              data={chunk}
              // page: necesario para FlavoursMenu que tiene 2 paginas distintas. Los demas menus
              // simplemente ignoran esta prop asi que no afecta.
              page={page}
              // menuId: necesario para KioskMenu y FrozenTreatsMenu que usan un id dinamico.
              // Con chunkSize activo, los IDs son secuenciales ("...-1", "...-2").
              // Sin chunkSize, usa los menuIds originales del array (menuIds[index]).
              // IceCreamMenu y FlavoursMenu ignoran esta prop porque tienen su id harcodeado.
              menuId={resolvedMenuIds[index]}
              // columns: define cuantas columnas de grid usa KioskMenu.
              // IceCreamMenu, FrozenTreatsMenu y FlavoursMenu ignoran esta prop.
              columns={columns}
              // templateImg: imagen de fondo del menu (solo KioskMenu y FrozenTreatsMenu).
              templateImg={templateImg}
            />
          </MenuUploadSection>
        );
      })}
    </div>
  );
}

export default function MenuSection({ h1, route, schemaRoute, menuIds, MenuComponent, menuPages = [1], chunkSize, columns: defaultColumns, templateImg }) {
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
      />
    </Section>
  );
}
