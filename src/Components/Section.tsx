import { useEffect, useState, useContext } from "react";
import ItemsContext from "../Contexts/ItemsContext";

import spinner from "../assets/spinner.svg";

import { Dialog } from "./Dialog";
import ShareMenuSection from "./ShareMenuSection";
import get_AndDo_ from "../functions/get_AndDo_";

import gear from "../assets/gear.svg";
export default function Section({ h1, route, schemaRoute, Menu }) {
  const [dbItemsArr, setDbItemsArr] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [itemSchema, setItemSchema] = useState();
  const [itemKeys, setPItemKeys] = useState();

  //////////////////////////////

  useEffect(() => {
    function handleProductsResponse_(response) {
      setDbItemsArr(response.data);
    }
    function handleProductsSchemaResponse_(response) {
      setItemSchema(response.data);
    }
    get_AndDo_(route, handleProductsResponse_);
    get_AndDo_(schemaRoute, handleProductsSchemaResponse_);
  }, []);

  useEffect(() => {
    if (itemSchema && dbItemsArr) {
      setIsLoading(false);
      if (itemSchema) {
        // Ensure itemSchema is an array and map to extract keys
        const keys = itemSchema.map((keySchema) => keySchema.key);
        setPItemKeys(keys);
      }
    }
  }, [itemSchema, dbItemsArr]);

  // Define what to render in different states
  const loadingMessage = "Loading";
  const menuContent = Menu ? <Menu data={dbItemsArr} /> : null;

  // Only create shareMenuSection if menuContent is not null
  const shareMenuSection = menuContent ? (
    <ShareMenuSection productsList={dbItemsArr}>{menuContent}</ShareMenuSection>
  ) : null;

  // Decide what to render based on isLoading
  const content = isLoading ? loadingMessage : shareMenuSection;
  return (
    <ItemsContext.Provider
      value={{
        route,
        itemKeys: itemKeys,
        get_AndDo_,
        itemSchema: itemSchema,
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
            <div className="table-container">
              <Table keys={itemKeys} data={dbItemsArr} />
            </div>
            <Dialog />
          </>
        )}
      </section>
      {Menu && content}
    </ItemsContext.Provider>
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
  const { itemKeys } = useContext(ItemsContext);
  return (
    <>
      <tr id={product._id}>
        {itemKeys.map((key) => (
          //return a cell per key
          <td
            data-cell={key}
            key={`product-cell-${product._id}-${key}`}
          >{`${product[key]}`}</td>
        ))}

        <td data-cell="edit">
          <Dialog product={product} />
        </td>
      </tr>
    </>
  );
}
