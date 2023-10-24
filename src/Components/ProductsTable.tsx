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
      <section id="products">
        <h1>Productos</h1>
        {isLoading ? (
          <img className="spinner" src={spinner} alt="" />
        ) : (
          <>
            <div className="table-container">{table}</div>
            <ProductDialog virtualProduct={undefined} />
          </>
        )}
      </section>
      {isLoading ? "Loading" : <SectionAs />}
    </TableContext.Provider>
  );
}

function SectionAs() {
  const targetElementRef = useRef(null);
  const { dbProductsArr } = useContext(TableContext);
  const [shareData, setShareData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function getDataToShare() {
    setIsLoading(true);
    const canvas = await html2canvas(targetElementRef.current);
    canvas.toBlob(async (blob) => {
      const files = [new File([blob], "image.png", { type: blob.type })];
      const shareData = {
        text: "Some text",
        title: "Some title",
        files,
      };
      setShareData(shareData);
      setIsLoading(false);
    });
  }

  async function sendShare() {
    try {
      await navigator.share(shareData);
      console.log("File was shared successfully");
      setShareData(null);
    } catch (err) {
      console.error(err.name, err.message);
    }
  }
  return (
    <section className="as">
      <ProductsMenu refe={targetElementRef} productsList={dbProductsArr} />
      {!shareData && (
        <button onClick={getDataToShare} disabled={isLoading}>
          {isLoading ? "CARGANDO" : "GENERAR IMAGEN"}
        </button>
      )}
      {shareData && <button onClick={sendShare}>COMPARTIR IMAGEN</button>}
    </section>
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
