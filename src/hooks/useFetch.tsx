import { useState, useEffect } from "react";
import {
  showSuccessAlert,
  showNotLoggedAlert,
  showUnknownErrorAlert,
} from "../alerts";

const useFetch = (method: string, id: string, route: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const token = JSON.parse(localStorage.getItem("jwtToken")).token;
        const requestOptions = {
          method: method,
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`, // Add the JWT to the Authorization header
          },
        };
        const response = await fetch(
          `${apiUrl}/${route}/${id}`,
          requestOptions
        );
        if (!response.ok) {
          if (response.status === 403) {
            showNotLoggedAlert();
          } else {
            showUnknownErrorAlert();
          }
        } else {
          showSuccessAlert();
        }
      } catch (error) {
        console.log(error.message);
        setError(error);
        if (
          error.message == "Cannot read properties of null (reading 'token')"
        ) {
          showNotLoggedAlert();
        }
      } finally {
        setLoading(false);
      }
      /* fetchFlavoursAndSetState(); */
    }

    fetchData();
  }, [id, method, route]);

  return { loading, error };
};

export default useFetch;
