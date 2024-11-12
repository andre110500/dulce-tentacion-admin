import { useEffect, useRef, useState, useContext } from "react";
import ItemsContext from "../Contexts/ItemsContext";

import spinner from "../assets/spinner.svg";

import { Dialog } from "./Dialog";
import ShareMenuSection from "./ShareMenuSection";
import get_AndDo_ from "../functions/get_AndDo_";

import gear from "../assets/gear.svg";
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
            <div className="table-container">
              <Table keys={itemKeys} data={dbItemsArr} />
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

function Table({ keys, data }) {
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
            //return a row per product
            <TableRow key={`product-row-${product._id}`} product={product} />
          ))}
        </tbody>
      </table>
    </>
  );
}

function TableRow({ product }) {
  const { itemKeys } = useContext(ItemsContext);
  const dialogRef = useRef(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  return (
    <>
      <dialog ref={dialogRef}>
        <img className="image-preview" src={previewImageUrl} />
      </dialog>

      <tr id={product._id}>
        {itemKeys.map((key) => {
          //return a cell per key
          return (
            <td
              data-cell={key}
              onClick={
                key === "imgUrl"
                  ? () => {
                      dialogRef.current.showModal();
                      setPreviewImageUrl(product.imgUrl);
                    }
                  : undefined
              }
              key={`product-cell-${product._id}-${key}`}
            >
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
