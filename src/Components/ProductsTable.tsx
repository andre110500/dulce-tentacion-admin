import { useEffect, useState, useContext, useRef } from "react";
import TableContext from "../Contexts/ProductsContext";
import ProductsMenu from "./ProductsMenu";
import spinner from "../assets/spinner.svg";

import { ProductDialog } from "./ProductDialog";
import ShareMenuSection from "./ShareMenuSection";
import fetch_And_ from "../functions/fetch_And_";

import gear from "../assets/gear.svg";
export default function ProductsTable() {
  const [dbProductsArr, setDbProductsArr] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const productMenuRef = useRef(null);

  //////////////////////////////

  useEffect(() => {
    function handleResponse_(response) {
      setDbProductsArr(response.data);
      setIsLoading(false);
    }
    fetch_And_("products", handleResponse_);
  }, []);

  const productKeys = ["name", "price", "imgUrl", "outOfStock", "flavours"];

  const table = (
    <table>
      <thead>
        <tr>
          {productKeys.map((key) => (
            <th key={`product-hcell-${key}`}>{key}</th>
          ))}
          <th>
            <img src={gear} alt="" />
          </th>
        </tr>
      </thead>
      <tbody>
        {dbProductsArr?.map((product) => (
          //return a row per product

          <TableRow key={`product-row-${product._id}`} product={product} />
        ))}
      </tbody>
    </table>
  );
  return (
    <TableContext.Provider
      value={{
        productKeys,
        fetch_And_,

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
            <ProductDialog />
          </>
        )}
      </section>
      {isLoading ? (
        "Loading"
      ) : (
        <ShareMenuSection targetElementRef={productMenuRef}>
          <ProductsMenu productsList={dbProductsArr} refe={productMenuRef} />
        </ShareMenuSection>
      )}
    </TableContext.Provider>
  );
}

function TableRow({ product }) {
  const { productKeys } = useContext(TableContext);
  return (
    <>
      <tr id={product._id}>
        {productKeys.map((key) => (
          //return a cell per key
          <td
            data-cell={key}
            key={`product-cell-${product._id}-${key}`}
          >{`${product[key]}`}</td>
        ))}

        <td data-cell="edit">
          <ProductDialog product={product} />
        </td>
      </tr>
    </>
  );
}
