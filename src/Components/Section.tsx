import { useEffect, useLayoutEffect, useRef, useState, useContext } from "react";
import ItemsContext from "../Contexts/ItemsContext";
import Swal from "sweetalert2";
import { generateAndUploadMenu } from "../functions/generateAndUploadMenu";
import spinner from "../assets/spinner.svg";

import { Dialog } from "./Dialog";
import MenuUploadSection from "./MenuUploadSection";
import get_AndDo_ from "../functions/get_AndDo_";

import gear from "../assets/gear.svg";

const ITEMS_PER_PAGE = 10;

// Normaliza la respuesta del schema para que el resto del componente siempre trabaje con un array de campos.
const getSchemaFields = (schemaResponse) => {
  // Si la API devuelve el formato viejo, ya es un array y lo podemos usar directamente.
  if (Array.isArray(schemaResponse)) {
    return schemaResponse;
  }

  // Si la API devuelve el formato nuevo, los campos vienen dentro de "fields".
  if (Array.isArray(schemaResponse?.fields)) {
    return schemaResponse.fields;
  }

  // Si llega algo inesperado, devolvemos un array vacio para evitar que falle el .map del render.
  return [];
};

// Extrae el mapa de subtipos del formato nuevo del schema para saber que subTypes permite cada type.
const getSchemaSubTypesByType = (schemaResponse) => {
  // Si la API todavia devuelve el formato viejo, no existe subTypesByType y usamos un objeto vacio.
  if (!schemaResponse?.subTypesByType) {
    return {};
  }

  // Devuelve el mapa nuevo, por ejemplo { drink: ["can"], "frozen-treat": ["tub"] }.
  return schemaResponse.subTypesByType;
};

export default function Section({
  h1,
  route,
  schemaRoute,
  Menu,

}) {
  const [dbItemsArr, setDbItemsArr] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [itemSchemaProperties, setItemSchemaProperties] = useState([]);
  const [subTypesByType, setSubTypesByType] = useState({});
  const [itemKeys, setItemKeys] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadingMenu, setIsUploadingMenu] = useState(false);
  const tableContainerRef = useRef(null);

  //////////////////////////////
  const changeCount = useRef(0);
  const getMenuIds = () => {
    if (route === "generic/flavour") {
      return ["flavours-menu-1", "flavours-menu-2"];
    }

    if (route === "products?type=ice-cream&type=add-on") {
      return ["ice-cream-menu"];
    }

    if (route === "products?type=frozen-treat") {
      return ["frozen-treats-menu"];
    }

    return [];
  };

  const uploadMenus = async () => {
    const menuIds = getMenuIds();

    if (!menuIds.length) {
      return;
    }

    for (const id of menuIds) {
      await generateAndUploadMenu(id);
    }
  };

  const handleManualMenuUpload = async () => {
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
    console.log("🔁 useLayoutEffect triggered");
    console.log("Current route:", route);
    console.log("dbItemsArr exists?", !!dbItemsArr);
    console.log("dbItemsArr length:", dbItemsArr?.length);
    console.log("changeCount BEFORE:", changeCount.current);

    changeCount.current += 1;

    console.log("changeCount AFTER:", changeCount.current);

    if (changeCount.current <= 2) {
      console.log("⛔ Skipping because changeCount <= 2");
      return;
    }

    if (
      route !== "products?type=ice-cream&type=add-on" &&
      route !== "generic/flavour" &&
      route !== "products?type=frozen-treat"
    ) {
      console.log("⛔ Route not allowed:", route);
      return;
    }

    if (!dbItemsArr) {
      console.log("⛔ dbItemsArr is null/undefined");
      return;
    }

    const menuIds = getMenuIds();

    console.log("🎯 Final menuIds:", menuIds);

    const run = async () => {
      console.log("🖼 Generating and uploading menus...");
      await uploadMenus();
      console.log("✅ Image generation finished");
    };

    run();

  }, [dbItemsArr]);

  useEffect(() => {


    const fetchData = async () => {
      try {
        console.log("📡 Fetching fresh data from DB... fetchdata1");
        const response = await get_AndDo_(route)
        console.log("📥 get_AndDo_ response:", response);
        if (!response) {
          console.error("❌ get_AndDo_ returned undefined!");
          return;
        }
        console.log("📊 Response data:", response.data);
        setDbItemsArr(response.data);
        console.log("✅ State updated");


      } catch (err) {
        console.error(err);
      }
    };

    const fetchData2 = async () => {
      try {
        console.log("📡 Fetching fresh data from DB...fetchdata2");
        const response = await get_AndDo_(schemaRoute)
        console.log("📥 get_AndDo_ response:", response);
        if (!response) {
          console.error("❌ get_AndDo_ returned undefined!");
          return;
        }
        console.log("📊 Response data:", response.data);
        // Guarda solo el array de campos, aunque la API nueva mande mas informacion como subTypesByType.
        setItemSchemaProperties(getSchemaFields(response.data));
        // Guarda los subtypes posibles por type para poder mostrarlos en la tabla.
        setSubTypesByType(getSchemaSubTypesByType(response.data));
        console.log("✅ State updated");


      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    fetchData2();


  }, []);

  useEffect(() => {
    if (itemSchemaProperties && dbItemsArr) {

      setIsLoading(false);

      // Ensure itemSchema is an array and map to extract keys
      const keys = itemSchemaProperties.map(
        (itemSchemaProperty) => itemSchemaProperty.key
      );
      setItemKeys(keys);
    }
  }, [itemSchemaProperties, dbItemsArr]);



  // Calculate pagination
  const totalPages = dbItemsArr
    ? Math.ceil(dbItemsArr.length / ITEMS_PER_PAGE)
    : 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = dbItemsArr ? dbItemsArr.slice(startIndex, endIndex) : [];

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to the table container with offset for sticky header
    const headerHeight = document.querySelector("#header")?.offsetHeight || 0;
    const tableTop =
      tableContainerRef.current?.getBoundingClientRect().top || 0;
    const scrollPosition = window.scrollY + tableTop - headerHeight;

    window.scrollTo({
      top: scrollPosition,
      behavior: "smooth",
    });
  };

  return (
    <ItemsContext.Provider
      value={{
        route,
        itemKeys: itemKeys,
        get_AndDo_,
        itemSchema: itemSchemaProperties,
        subTypesByType: subTypesByType,
        dbItemsArr: dbItemsArr,
        setDbItemsArr: setDbItemsArr,
      }}
    >
      <section>
        <h1>{h1}</h1>
        {isLoading ? (
          <img className="spinner" src={spinner} alt="" />
        ) : (
          <>
            <div className="table-container" ref={tableContainerRef}>
              <Table
                keys={itemKeys}
                data={currentItems}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />

            </div>

            <div className="menu-container">
              {Menu && (
                route === "generic/flavour" ? (
                  <>
                    <MenuUploadSection
                      productsList={dbItemsArr}
                      flavoursList={dbItemsArr}
                      onManualMenuUpload={handleManualMenuUpload}
                      isUploadingMenu={isUploadingMenu}
                    >
                      <Menu
                        data={dbItemsArr?.filter((product) => !product.outOfStock)}
                        page={1}
                      />
                    </MenuUploadSection>
                    <MenuUploadSection
                      productsList={dbItemsArr}
                      flavoursList={dbItemsArr}
                      onManualMenuUpload={handleManualMenuUpload}
                      isUploadingMenu={isUploadingMenu}
                    >
                      <Menu
                        data={dbItemsArr?.filter((product) => !product.outOfStock)}
                        page={2}
                      />
                    </MenuUploadSection>
                  </>
                ) : (
                  <MenuUploadSection
                    productsList={dbItemsArr}
                    flavoursList={dbItemsArr}
                    onManualMenuUpload={handleManualMenuUpload}
                    isUploadingMenu={isUploadingMenu}
                  >
                    <Menu
                      data={dbItemsArr?.filter((product) => !product.outOfStock)}
                    />
                  </MenuUploadSection>
                )
              )}

            </div>
          </>
        )}
      </section>
    </ItemsContext.Provider>
  );
}

function Table({ keys, data, currentPage, totalPages, onPageChange }) {
  return (
    <>
      <table>
        <thead>
          <tr>
            {keys.map((key) => (
              <th key={`product-hcell-${key}`}>{key}</th>
            ))}
            <th>
              <img src={gear} alt="" />
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((product) => (
            <TableRow key={`product-row-${product._id}`} product={product} />
          ))}
        </tbody>
      </table>
      <Dialog />
      {totalPages > 1 && (
        <div className="pagination">
          {/* Generate page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={`page-${page}`}
              className={`page-number ${currentPage === page ? "active" : ""}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function TableRow({ product }) {
  const { itemKeys } = useContext(ItemsContext);
  const dialogRef = useRef(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  // Limpia la URL antes de usarla para que espacios o valores falsos no creen una miniatura rota.
  const rawProductImageUrl = typeof product.imgUrl === "string" ? product.imgUrl.trim() : "";
  // Considera valida la imagen solo si hay una URL real; evita tratar "undefined" o "null" como imagen.
  const productImageUrl =
    rawProductImageUrl &&
      rawProductImageUrl !== "undefined" &&
      rawProductImageUrl !== "null"
      ? rawProductImageUrl
      : "";

  return (
    <>
      <dialog className="preview" ref={dialogRef}>
        <img className="image-preview" src={previewImageUrl} />
        <button onClick={() => dialogRef.current.close()}>X</button>
      </dialog>

      <tr id={product._id}>
        {itemKeys.map((key) => {
          //return a cell per key
          if (key === "imgUrl") {
            return (
              <td
                data-cell={key}
                className={productImageUrl ? "activable image-cell" : "image-cell"}
                onClick={() => {
                  if (!productImageUrl) {
                    return;
                  }

                  dialogRef.current.showModal();
                  setPreviewImageUrl(productImageUrl);
                }}
                key={`product-cell-${product._id}-${key}`}
              >
                <span className="thumbnail-wrap">
                  {productImageUrl && (
                    <img
                      src={productImageUrl}
                      alt={product.name || "Imagen del producto"}
                      className="table-thumbnail"
                    />
                  )}
                </span>
              </td>
            );
          } else
            return (
              <OverflowCell
                key={`product-cell-${product._id}-${key}`}
                content={product[key]}
                dataCell={key}
              />
            );
        })}

        <td data-cell="edit">
          <Dialog product={product} />
        </td>
      </tr>
    </>
  );
}

// Usa unknown porque la celda puede recibir strings, numeros, booleanos u otros valores del producto.
const OverflowCell = ({ content, dataCell }: { content: unknown; dataCell: string }) => {
  const cellRef = useRef<HTMLTableCellElement>(null);
  // Muestra la celda vacia cuando el backend no mando valor, para evitar ver "undefined" en la tabla.
  const displayContent = content === undefined || content === null ? "" : String(content);

  const checkOverflow = () => {
    const el = cellRef.current;
    if (!el) return;

    // Check the span inside the td because on mobile the td is a grid and the span has the truncation
    const target = el.querySelector("span") || el;
    const isOverflowing = target.scrollWidth > target.clientWidth;

    if (isOverflowing) {
      // Convierte el valor a texto porque el atributo title del HTML solo acepta strings.
      el.setAttribute("title", displayContent);
    } else {
      el.removeAttribute("title");
    }
  };

  const handleClick = () => {
    // Only allow click on devices that DO NOT support hover (touch devices)
    // If the device supports hover, we assume the user can simple hover to see the tooltip
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (canHover) return;

    const el = cellRef.current;
    if (!el) return;

    const target = el.querySelector("span") || el;
    const isOverflowing = target.scrollWidth > target.clientWidth;

    if (isOverflowing) {
      Swal.fire({
        // Convierte el valor a texto porque SweetAlert espera mostrar un string.
        text: displayContent,
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#e8547e",
      });
    }
  };

  return (
    <td
      data-cell={dataCell}
      ref={cellRef}
      onMouseEnter={checkOverflow}
      onClick={handleClick}
    >
      <span>{displayContent}</span>
    </td>
  );
};
