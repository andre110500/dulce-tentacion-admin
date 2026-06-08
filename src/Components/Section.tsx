import { useEffect, useRef, useState, useContext } from "react";
import ItemsContext from "../Contexts/ItemsContext";
import Swal from "sweetalert2";
import spinner from "../assets/spinner.svg";

import { Dialog } from "./Dialog";
import get_AndDo_ from "../functions/get_AndDo_";

import gear from "../assets/gear.svg";

const ITEMS_PER_PAGE = 10;

const getSchemaFields = (schemaResponse) => {
  if (Array.isArray(schemaResponse)) {
    return schemaResponse;
  }

  if (Array.isArray(schemaResponse?.fields)) {
    return schemaResponse.fields;
  }

  return [];
};

const getSchemaSubTypesByType = (schemaResponse) => {
  if (!schemaResponse?.subTypesByType) {
    return {};
  }

  return schemaResponse.subTypesByType;
};

export default function Section({ h1, route, schemaRoute, children }) {
  // children: contenido opcional que se renderiza dentro de .menu-container debajo de la tabla.
  // Antes recibia Menu (componente de menu) y decidiia que renderizar segun route con ternarios.
  // Ahora Section es generica: solo tabla + fetch. MenuSection se encarga de pasar el menu como child.
  const [dbItemsArr, setDbItemsArr] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [itemSchemaProperties, setItemSchemaProperties] = useState([]);
  const [subTypesByType, setSubTypesByType] = useState({});
  const [itemKeys, setItemKeys] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get_AndDo_(route)
        if (!response) {
          return;
        }
        setDbItemsArr(response.data);

      } catch (err) {
        console.error(err);
      }
    };

    const fetchData2 = async () => {
      try {
        const response = await get_AndDo_(schemaRoute)
        if (!response) {
          return;
        }
        setItemSchemaProperties(getSchemaFields(response.data));
        setSubTypesByType(getSchemaSubTypesByType(response.data));

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

      const keys = itemSchemaProperties.map(
        (itemSchemaProperty) => itemSchemaProperty.key
      );
      setItemKeys(keys);
    }
  }, [itemSchemaProperties, dbItemsArr]);

  const totalPages = dbItemsArr
    ? Math.ceil(dbItemsArr.length / ITEMS_PER_PAGE)
    : 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = dbItemsArr ? dbItemsArr.slice(startIndex, endIndex) : [];

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
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

            {children && (
              // Si hay children (ej. el menu que pasa MenuSection), los renderiza dentro del
              // contenedor .menu-container. Antes habia un ternario enorme con route === "generic/flavour"
              // para decidir cuantas instancias de MenuUploadSection crear. Ahora eso lo decide
              // MenuSection, que pasa el contenido ya armado como children de Section.
              <div className="menu-container">
                {children}
              </div>
            )}
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
  const rawProductImageUrl = typeof product.imgUrl === "string" ? product.imgUrl.trim() : "";
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

const OverflowCell = ({ content, dataCell }: { content: unknown; dataCell: string }) => {
  const cellRef = useRef<HTMLTableCellElement>(null);
  const displayContent = content === undefined || content === null ? "" : String(content);

  const checkOverflow = () => {
    const el = cellRef.current;
    if (!el) return;

    const target = el.querySelector("span") || el;
    const isOverflowing = target.scrollWidth > target.clientWidth;

    if (isOverflowing) {
      el.setAttribute("title", displayContent);
    } else {
      el.removeAttribute("title");
    }
  };

  const handleClick = () => {
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (canHover) return;

    const el = cellRef.current;
    if (!el) return;

    const target = el.querySelector("span") || el;
    const isOverflowing = target.scrollWidth > target.clientWidth;

    if (isOverflowing) {
      Swal.fire({
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
