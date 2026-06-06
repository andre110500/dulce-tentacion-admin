import {
  show_ErrorAlert,
  showNotLoggedAlert,
  showSuccessAlert,
  showUnknownErrorAlert,
} from "../alerts";
import client from "../client";
import runBuild from "./runBuild";



interface Settings {
  route: string;
  id?: string;
  method: "POST" | "PUT" | "DELETE"; // Restrict method to CRUD operations
  body?: string;
  callback: () => Promise<void>; // 🔥 ahora async
}

interface ValidationError {
  // Nombre del campo que fallo en la validacion del backend, por ejemplo "price" o "name".
  field?: string;
  // Mensaje concreto que envia express-validator para ese campo.
  message?: string;
  // Valor recibido por la API; sirve para mostrar que dato causo el error.
  value?: unknown;
}

interface RequestError {
  // Mensaje general del error de Axios o del error manual que lanzamos.
  message?: string;
  // Existe cuando la request salio pero el servidor no respondio.
  request?: unknown;
  // Existe cuando el servidor respondio con un status fuera del rango 2xx.
  response?: {
    // Cuerpo de error que devuelve la API.
    data?: {
      // Titulo general del error, por ejemplo "Body validation failed".
      error?: string;
      // Lista de errores por campo que devuelve express-validator.
      errors?: ValidationError[];
    };
    // Codigo HTTP de la respuesta, por si necesitamos mostrarlo o debuguearlo.
    status?: number;
  };
}

// Convierte el error de la API en un texto listo para mostrar en SweetAlert.
const formatServerError = (data: {
  // Mensaje principal enviado por la API.
  error?: string;
  // Detalles opcionales enviados por la API cuando falla la validacion del body.
  errors?: ValidationError[];
} = {}) => {
  // Usa el error principal de la API; si no existe, deja un mensaje generico.
  const mainMessage = data?.error || "Server error occurred";

  // Si no hay un array de errores, mostramos solo el mensaje principal.
  if (!Array.isArray(data?.errors) || data.errors.length === 0) {
    return mainMessage;
  }

  // Transforma cada error de validacion en una linea legible para el usuario.
  const validationMessages = data.errors.map((error) => {
    // Agrega el nombre del campo al inicio cuando la API lo manda.
    const field = error.field ? `${error.field}: ` : "";
    // Solo muestra el valor recibido si existe; asi evitamos ruido cuando viene undefined o null.
    const value =
      error.value === undefined || error.value === null
        ? ""
        : ` (valor: ${String(error.value)})`;

    // Une campo, mensaje y valor en una sola linea de error.
    return `${field}${error.message || "Valor invalido"}${value}`;
  });

  // Une el titulo y los detalles con saltos de linea para que la alerta los muestre separados.
  return [mainMessage, ...validationMessages].join("\n");
};

export default async function tryToModifyDbWithAuth(settings: Settings) {
  const { route, id, method, body, callback } = settings;

  try {
    const jwtToken = localStorage.getItem("jwtToken");
    console.log(jwtToken);
    if (!jwtToken || jwtToken === "null") {
      console.log("if");
      throw new Error("Cannot read properties of null (reading 'token')");
    }
    const token = JSON.parse(jwtToken).token;
    if (!token) {
      throw new Error("Token not found in JWT data");
    }
    //axios
    const response = await client({
      method: method,
      url: `${route.split("?")[0]}${id ? `/${id}` : ""}`,
      data: body,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 403) {
      showNotLoggedAlert();
    } else if (response.status !== 200) {
      showUnknownErrorAlert(response.status);
    } else {
      showSuccessAlert();



      //ALWAYS RUNBUILD BECAUSE OF NEW FORM IMPLEMENTATION IN GATSBY APP
      await callback();
      runBuild();
    }

    return response.data;
  } catch (error: unknown) {
    // Convertimos el error desconocido a la forma que esperamos de Axios para poder leer response/request.
    const requestError = error as RequestError;

    console.log("Error details:", {
      error,
      type: typeof error,
      message: requestError?.message,
      response: requestError?.response,
      data: requestError?.response?.data,
    });

    // Check if it's an Axios error
    if (requestError?.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      // Incluye el error principal y tambien los detalles del array "errors" si el backend los envio.
      const errorMessage = formatServerError(requestError.response.data);
      console.log("Server response error:", errorMessage);
      // Muestra el mensaje ya formateado en el front.
      show_ErrorAlert(errorMessage);
    } else if (requestError?.request) {
      // The request was made but no response was received
      console.log("No response received from server");
      show_ErrorAlert("No response from server");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Request setup error:", requestError?.message);
      if (
        requestError?.message === "Cannot read properties of null (reading 'token')"
      ) {
        showNotLoggedAlert();
      } else if (requestError?.message?.includes("JSON.parse")) {
        show_ErrorAlert("Invalid server response format");
      } else {
        show_ErrorAlert(requestError?.message || "An error occurred");
      }
    }
  }

}
