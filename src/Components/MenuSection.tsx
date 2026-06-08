/*
  MenuSection: wrapper para secciones que tienen un menú visual (vista previa + subida automática).
  Reemplaza el uso directo de <Section Menu={...}> separando la lógica de menú en su propio componente.
  Recibe un MenuComponent (IceCreamMenu, ProductsMenu, FlavoursMenu) y lo renderiza dentro de
  MenuUploadSection con soporte para captura de pantalla y subida automática cuando los datos cambian.
*/

import { useLayoutEffect, useRef, useState, useContext } from "react";
// useLayoutEffect: dispara la subida automatica apenas el DOM se actualiza con nuevos datos.
// useRef: changeCount persistente entre renders para saltear las primeras ejecuciones del efecto.
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
function MenuContent({ menuIds, MenuComponent, menuPages }) {
  // menuIds: ej. ["ice-cream-menu"], determina que IDs de menu se generan/suben.
  // MenuComponent: el componente de menu concreto (IceCreamMenu, ProductsMenu, FlavoursMenu, etc.).
  // menuPages: array de paginas a renderizar, ej. [1] para 1 menu, [1,2] para Sabores.

  const { dbItemsArr } = useContext(ItemsContext);
  // Lee el arreglo de productos desde el contexto que Section expone a sus hijos.
  // Cuando Section termina el fetch, dbItemsArr cambia y esto re-renderiza MenuContent.

  const changeCount = useRef(0);
  // Contador de ejecuciones del useLayoutEffect. Sirve para evitar la subida automatica en los
  // primeros renders (React Strict Mode monta/desmonta dos veces y duplicaria la subida).

  const [isUploadingMenu, setIsUploadingMenu] = useState(false);
  // Estado que deshabilita el boton "SUBIR MENU" mientras se esta subiendo para evitar doble click.

  const uploadMenus = async () => {
    // Itera sobre cada menuId y genera+sube cada menu llamando a generateAndUploadMenu.
    // Esta funcion se usa tanto en la subida automatica (useLayoutEffect) como en la manual.
    for (const id of menuIds) {
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

    // Ejecuta la subida de todos los menus definidos en menuIds.
    uploadMenus();

  }, [dbItemsArr]);
  // Solo se re-ejecuta cuando dbItemsArr cambia (nuevos datos del fetch).

  return (
    // Renderiza el contenedor de menus con tantas instancias de MenuUploadSection como paginas tenga.
    // Para la mayoria de los menus menuPages es [1] (una sola pagina). Para Sabores es [1, 2].
    <div className="menu-container">
      {menuPages.map((page, index) => (
        <MenuUploadSection
          key={page}
          // productsList y flavoursList: MenuUploadSection los necesita para detectar cambios y
          // regenerar la captura automaticamente (via html2canvas).
          productsList={dbItemsArr}
          flavoursList={dbItemsArr}
          onManualMenuUpload={handleManualMenuUpload}
          isUploadingMenu={isUploadingMenu}
        >
          <MenuComponent
            // Filtra los productos agotados (outOfStock) para no mostrarlos en el menu.
            data={dbItemsArr?.filter((product) => !product.outOfStock)}
            // page: necesario para FlavoursMenu que tiene 2 paginas distintas. Los demas menus
            // simplemente ignoran esta prop asi que no afecta.
            page={page}
            // menuId: necesario para ProductsMenu que usa un id dinamico para el div del menu.
            // Se toma del array menuIds segun el indice, asi cada pagina tiene su propio id.
            // IceCreamMenu y FlavoursMenu ignoran esta prop porque ya tienen su id harcodeado.
            menuId={menuIds[index]}
          />
        </MenuUploadSection>
      ))}
    </div>
  );
}

export default function MenuSection({ h1, route, schemaRoute, menuIds, MenuComponent, menuPages = [1] }) {
  // MenuSection es un wrapper que delega todo el fetch/tabla a Section y solo agrega la capa de menu.
  // menuIds: IDs de los elementos del DOM que se capturan como imagen (ej. "ice-cream-menu").
  // MenuComponent: componente React que renderiza el diseno del menu.
  // menuPages: por defecto [1], para Sabores se pasa [1, 2] porque genera dos menus distintos.
  return (
    <Section h1={h1} route={route} schemaRoute={schemaRoute}>
      {/* Section se encarga del fetch, la tabla, la paginacion y expone dbItemsArr via context.
          MenuContent se renderiza como child, por lo que puede leer dbItemsArr del contexto. */}
      <MenuContent
        menuIds={menuIds}
        MenuComponent={MenuComponent}
        menuPages={menuPages}
      />
    </Section>
  );
}
