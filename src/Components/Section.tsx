import { useEffect, useRef, useState, useContext } from "react";
import ItemsContext from "../Contexts/ItemsContext";

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
  SecondaryMenu,
}) {
  const [dbItemsArr, setDbItemsArr] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [itemSchemaProperties, setItemSchemaProperties] = useState([]);
  const [itemKeys, setItemKeys] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const tableContainerRef = useRef(null);

  //////////////////////////////

  useEffect(() => {
    get_AndDo_(route, (response) => setDbItemsArr(response.data));

    get_AndDo_(schemaRoute, (response) =>
      setItemSchemaProperties(response.data)
    );
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
              <Dialog />
            </div>

            <div className="menu-container">
              {Menu && (
                <ShareMenuSection productsList={dbItemsArr}>
                  <Menu data={dbItemsArr} />
                </ShareMenuSection>
              )}
              {SecondaryMenu && (
                <ShareMenuSection productsList={dbItemsArr}>
                  <SecondaryMenu
                    data={dbItemsArr.filter((product) => !product.outOfStock)}
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

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
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
                {`${product[key]}`}
              </td>
            );
          } else
            return (
              <td data-cell={key} key={`product-cell-${product._id}-${key}`}>
                {`${product[key]}`}
              </td>
            );
        })}

        <td data-cell="edit">
          <Dialog product={product} />
        </td>
      </tr>
    </>
  );
}
