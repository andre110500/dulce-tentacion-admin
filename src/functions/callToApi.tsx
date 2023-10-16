import React from "react";
import {
  showSuccessAlert,
  showNotLoggedAlert,
  showUnknownErrorAlert,
} from "../alerts";
async function callToApi(settings) {
  const { route, id, method, body, callback } = settings;
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = JSON.parse(localStorage.getItem("jwtToken")).token;
    const requestOptions = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`, // Add the JWT to the Authorization header
      },
      body: body,
    };
    const response = await fetch(`${apiUrl}/${route}/${id}`, requestOptions);
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

    if (error.message == "Cannot read properties of null (reading 'token')") {
      showNotLoggedAlert();
    }
  }
  callback();
}

export default callToApi;
