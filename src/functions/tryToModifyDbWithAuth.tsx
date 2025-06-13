import {
  show_ErrorAlert,
  showNotLoggedAlert,
  showSuccessAlert,
  showUnknownErrorAlert,
} from "../alerts";
import client from "../client";
import runBuild from "./runBuild";

function shouldRunBuild(route: string): boolean {
  if (process.env.NODE_ENV !== "production") {
    console.log(`return false`);
    return false;
  }

  const rebuildRoutes = process.env.REBUILD_ROUTES?.split(",") || [];

  return rebuildRoutes.includes(route);
}

interface Settings {
  route: string;
  id?: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; // Restrict method to CRUD operations
  body?: string;
  callback: () => void;
}

export default async function tryToModifyDbWithAuth(settings: Settings) {
  const { route, id, method, body, callback } = settings;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Cannot read properties of null (reading 'token')");
    }

    const response = await client({
      method: method,
      url: `${route}${id ? `/${id}` : ""}`,
      data: body,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 403) {
      showNotLoggedAlert();
    } else if (response.status !== 200) {
      showUnknownErrorAlert(response.status);
    } else {
      showSuccessAlert();

      // Run build only in production and when the route is in REBUILD_ROUTES
      console.log(`-------------------------------------`);
      console.log(shouldRunBuild(route));
      console.log(`-------------------------------------`);

      /*  if (shouldRunBuild(route)) {
        runBuild();
      } */

      //ALWAYS RUNBUILD BECAUSE OF NEW FORM IMPLEMENTATION IN GATSBY APP
      runBuild();
      callback();
    }

    return response.data;
  } catch (error: any) {
    console.log("Error details:", {
      error,
      type: typeof error,
      message: error?.message,
      response: error?.response,
      data: error?.response?.data,
    });

    // Check if it's an Axios error
    if (error?.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage =
        error.response.data?.error || "Server error occurred";
      console.log("Server response error:", errorMessage);
      show_ErrorAlert(errorMessage);
    } else if (error?.request) {
      // The request was made but no response was received
      console.log("No response received from server");
      show_ErrorAlert("No response from server");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Request setup error:", error?.message);
      if (
        error?.message === "Cannot read properties of null (reading 'token')"
      ) {
        showNotLoggedAlert();
      } else if (error?.message?.includes("JSON.parse")) {
        show_ErrorAlert("Invalid server response format");
      } else {
        show_ErrorAlert(error?.message || "An error occurred");
      }
    }
  }
  callback();
}
