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
  const [productSchema, setProductSchema] = useState();
  const [productKeys, setProductKeys] = useState();

  //////////////////////////////

  useEffect(() => {
    function handleProductsResponse_(response) {
      setDbProductsArr(response.data);
    }
    function handleProductsSchemaResponse_(response) {
      setProductSchema(response.data);
    }
    get_AndDo_("products", handleProductsResponse_);
    get_AndDo_("products/schema", handleProductsSchemaResponse_);
  }, []);

  useEffect(() => {
    if (productSchema && dbProductsArr) {
      setIsLoading(false);
      if (productSchema) {
        // Ensure productSchema is an array and map to extract keys
        const keys = productSchema.map((keySchema) => keySchema.key);
        setProductKeys(keys);
      }
    }
  }, [productSchema, dbProductsArr]);

  return (
    <TableContext.Provider
      value={{
        productKeys,
        get_AndDo_,
        productSchema,
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
            <div className="table-container">
              <Table keys={productKeys} data={dbProductsArr} />
            </div>
            <ProductDialog productSchema={productSchema} />
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

function Table({ keys, data }) {
  return (
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
          //return a row per product

          <TableRow key={`product-row-${product._id}`} product={product} />
        ))}
      </tbody>
    </table>
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
