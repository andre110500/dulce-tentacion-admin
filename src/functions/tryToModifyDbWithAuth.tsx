import React from "react";

import {
  show_ErrorAlert,
  showSuccessAlert,
  showNotLoggedAlert,
  showUnknownErrorAlert,
} from "../alerts";
import client from "../client";
import runBuild from "./runBuild";

interface Settings {
  route: string;
  id?: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; // Restrict method to CRUD operations
  body?: string;
  callback: () => void;
}

function shouldRunBuild(route: string): boolean {
  if (process.env.NODE_ENV !== "production") {
    console.log(`return false`);
    return false;
  }

  const rebuildRoutes = import.meta.env.VITE_REBUILD_ROUTES?.split(",") || [];

  return rebuildRoutes.includes(route);
}

async function tryToModifyDbWithAuth(settings: Settings) {
  const { route, id, method, body, callback } = settings;

  try {
    const token = JSON.parse(localStorage.getItem("jwtToken")).token;
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

      if (shouldRunBuild(route)) {
        runBuild();
      }
    }
  } catch (error) {
    console.log(`----------------------------------------------------------`);
    console.log(error.response.data.error);
    console.log(`----------------------------------------------------------`);
    show_ErrorAlert(error.response.data.error);
    if (error.message === "Cannot read properties of null (reading 'token')") {
      showNotLoggedAlert();
    }
  }

  callback();
}

export default tryToModifyDbWithAuth;
