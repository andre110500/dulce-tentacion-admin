import Swal from "sweetalert2";
const showSuccessAlert = () => {
  return Swal.fire({
    title: "Todo bien",
    text: "Los cambios se realizaron con éxito",
    icon: "success",
    confirmButtonText: "OK",
  });
};

const showNotLoggedAlert = () => {
  return Swal.fire({
    title: "Error!",
    text: "Debes estar logeado para realizar cambios.",
    icon: "warning", // Displays a warning icon
    confirmButtonText: "OK",
  });
};

const showUnknownErrorAlert = () => {
  return Swal.fire({
    title: `Error ${response.status}`,
    text: "Contacta con un administrador",
    icon: "warning", // Displays a warning icon
    confirmButtonText: "OK",
  });
};

export { showSuccessAlert, showNotLoggedAlert, showUnknownErrorAlert };
