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

}
