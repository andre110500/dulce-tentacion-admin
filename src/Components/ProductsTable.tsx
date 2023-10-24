import { useEffect, useState, useContext, useRef } from "react";
import TableContext from "../Contexts/ProductsContext";
import ProductsMenu from "./ProductsMenu";
import spinner from "../assets/spinner.svg";
import html2canvas from "html2canvas";
import { ProductDialog } from "./ProductDialog";

const apiUrl = import.meta.env.VITE_API_URL;

function ProductsTable() {
  const [virtualProductsArr, setVirtualProductsArr] = useState();
  const [dbProductsArr, setDbProductsArr] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const targetElementRef = useRef(null);

  const [url, setUrl] = useState("");

  const captureElement = () => {
    if (targetElementRef.current) {
      const scale = 4; // Increase the scale for higher resolution (e.g., 2 for double resolution)

      html2canvas(targetElementRef.current, { scale }).then((canvas) => {
        // Convert canvas to data URL as a JPG image
        const imgData = canvas.toDataURL("image/jpeg");
        setUrl(imgData);
      });
    }
  };

  async function fetchProductsAndSetState() {
    const requestOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const response = await fetch(`${apiUrl}/products`, requestOptions);
      if (!response.ok) {
        throw new Error("Request failed");
      }

      const products = await response.json();

      setDbProductsArr(products);

      // Process the data or perform other operations
    } catch (error) {
      console.error("Error:", error);
    }
  }

  useEffect(() => {
    if (dbProductsArr) {
      setVirtualProductsArr(dbProductsArr);
      setIsLoading(false);
    }
  }, [dbProductsArr]);

  useEffect(() => {
    fetchProductsAndSetState();
  }, []);

  const productKeys = ["name", "price", "imgUrl", "outOfStock", "flavours"];

  const table = (
    <table>
      <thead>
        <tr>
          {productKeys.map((key) => (
            <th key={`hcell-${key}`}>{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {virtualProductsArr?.map((virtualProduct) => (
          //return a row per product

          <TableRow virtualProduct={virtualProduct} />
        ))}
      </tbody>
    </table>
  );
  return (
    <>
      <section id="products">
        <h1>Productos</h1>
        {isLoading ? (
          <img className="spinner" src={spinner} alt="" />
        ) : (
          <TableContext.Provider
            value={{
              productKeys,
              fetchProductsAndSetState,
              virtualProductsArr,
              setVirtualProductsArr,
              dbProductsArr,
              setDbProductsArr,
            }}
          >
            <div className="table-container">{table}</div>
            <ProductDialog virtualProduct={undefined} />
          </TableContext.Provider>
        )}
      </section>
      {isLoading ? (
        "Loading"
      ) : (
        <section className="as">
          <ProductsMenu refe={targetElementRef} productsList={dbProductsArr}>
            <img
              src={url}
              style={{ display: url ? "block" : "none" }}
              className="downloadable"
              alt="Captured Image"
            />
          </ProductsMenu>
          <button
            onClick={() => {
              captureElement();
            }}
          >
            Compartir
          </button>
        </section>
      )}
    </>
  );
}

export default ProductsTable;

function TableRow({ virtualProduct }) {
  const { productKeys } = useContext(TableContext);
  return (
    <>
      <tr id={virtualProduct._id}>
        {productKeys.map((key) => (
          //return a cell per key
          <td key={`cell-${key}`}>{`${virtualProduct[key]}`}</td>
        ))}

        <td>
          <ProductDialog virtualProduct={virtualProduct} />
        </td>
      </tr>
    </>
  );
}
