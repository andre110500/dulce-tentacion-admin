import { useEffect, useState, useContext } from "react";
import TableContext from "../Contexts/ProductsContext";
import ProductsMenu from "./ProductsMenu";
import spinner from "../assets/spinner.svg";

import { ProductDialog } from "./ProductDialog";
import ShareMenuSection from "./ShareMenuSection";
import get_AndDo_ from "../functions/get_AndDo_";

import gear from "../assets/gear.svg";
export default function ProductsTable() {
  const [dbProductsArr, setDbProductsArr] = useState();
  const [isLoading, setIsLoading] = useState(true);

  //////////////////////////////

  useEffect(() => {
    function handleResponse_(response) {
      setDbProductsArr(response.data);
      setIsLoading(false);
    }
    get_AndDo_("products", handleResponse_);
  }, []);

  const productKeys = [
    "name",
    "price",
    "imgUrl",
    "outOfStock",
    "flavours",
    "description",
  ];

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
        get_AndDo_,

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
        <ShareMenuSection productsList={dbProductsArr}>
          <ProductsMenu productsList={dbProductsArr} />
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
