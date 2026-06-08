import { useEffect, useRef, useState } from "react";
import ItemsContext from "../Contexts/ItemsContext";
import spinner from "../assets/spinner.svg";

import get_AndDo_ from "../functions/get_AndDo_";

import Table from "./Table";

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
              // Si hay children (ej. el menu que pasa MenuSection), los renderiza debajo de la tabla.
              // MenuSection ya envuelve en .menu-container, asi que no es necesario otro wrapper.
              children
            )}
          </>
        )}
      </section>
    </ItemsContext.Provider>
  );
}
