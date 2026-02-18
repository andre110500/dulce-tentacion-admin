import { useEffect, useLayoutEffect, useRef, useState, useContext } from "react";
import ItemsContext from "../Contexts/ItemsContext";
import Swal from "sweetalert2";
import { generateAndUploadMenu } from "../functions/generateAndUploadMenu";
import spinner from "../assets/spinner.svg";

import { Dialog } from "./Dialog";
import ShareMenuSection from "./ShareMenuSection";
import get_AndDo_ from "../functions/get_AndDo_";

import gear from "../assets/gear.svg";

const ITEMS_PER_PAGE = 10;

export default function Section({
  h1,
  route,
  schemaRoute,
  Menu,

}) {
  const [dbItemsArr, setDbItemsArr] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [itemSchemaProperties, setItemSchemaProperties] = useState([]);
  const [itemKeys, setItemKeys] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const tableContainerRef = useRef(null);

  //////////////////////////////
  const changeCount = useRef(0);
  useLayoutEffect(() => {
    changeCount.current += 1;
    if (changeCount.current <= 2) return;
    if (route !== "products" && route !== "generic/flavour") return;
    if (!dbItemsArr) return;

    var menuId = ""
    if (route === "generic/flavour") {
      menuId = "flavours-menu"
      return
    } else {
      menuId = "products-menu"
    }
    const run = async () => {
      console.log("🖼 Generating and uploading menu...");
      await generateAndUploadMenu(menuId);
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
        setItemSchemaProperties(response.data);
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
                <ShareMenuSection productsList={dbItemsArr}>
                  <Menu
                    data={dbItemsArr?.filter((product) => !product.outOfStock)}
                  />
                </ShareMenuSection>
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
                className="activable"
                onClick={() => {
                  dialogRef.current.showModal();
                  setPreviewImageUrl(product.imgUrl);
                }}
                key={`product-cell-${product._id}-${key}`}
              >
                <span>{`${product[key]}`}</span>
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

const OverflowCell = ({ content, dataCell }: { content: any; dataCell: string }) => {
  const cellRef = useRef<HTMLTableCellElement>(null);

  const checkOverflow = () => {
    const el = cellRef.current;
    if (!el) return;

    // Check the span inside the td because on mobile the td is a grid and the span has the truncation
    const target = el.querySelector("span") || el;
    const isOverflowing = target.scrollWidth > target.clientWidth;

    if (isOverflowing) {
      el.setAttribute("title", content);
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
        text: content,
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
      <span>{`${content}`}</span>
    </td>
  );
};
