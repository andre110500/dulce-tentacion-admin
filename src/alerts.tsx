import Swal from "sweetalert2";

// Recibe cualquier mensaje de error y lo convierte a texto para evitar fallos si llega null, undefined u otro tipo.
const formatAlertText = (message) =>
  // Fuerza el valor a string porque SweetAlert necesita texto renderizable.
  String(message)
    // Escapa "&" primero porque es parte de las entidades HTML y podria romper los siguientes escapes.
    .replace(/&/g, "&amp;")
    // Escapa "<" para que un mensaje del servidor no pueda abrir etiquetas HTML.
    .replace(/</g, "&lt;")
    // Escapa ">" para cerrar la proteccion contra etiquetas HTML inyectadas.
    .replace(/>/g, "&gt;")
    // Escapa comillas dobles por seguridad si el texto termina dentro de HTML.
    .replace(/"/g, "&quot;")
    // Escapa comillas simples por seguridad si el texto termina dentro de HTML.
    .replace(/'/g, "&#039;")
    // Convierte saltos de linea en <br /> para que SweetAlert muestre cada error en una linea separada.
    .replace(/\n/g, "<br />");

const showSuccessAlert = () => {
  return Swal.fire({
    title: "Todo bien",
    text: "Los cambios se realizaron con éxito",
    icon: "success",
    confirmButtonText: "OK",
  });
};

const showConfirmAlert = (callback, settings) => {
  return Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      callback(settings);
    }
  });
};

const showWelcomeAlert = () => {
  return Swal.fire({
    title: "Bienvenido",
    text: "Que tenga un buen dia",
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

const show_ErrorAlert = (string) => {
  return Swal.fire({
    title: "Error!",
    // Usa html porque SweetAlert no respeta saltos de linea dentro de text; formatAlertText escapa el contenido antes.
    html: formatAlertText(string),
    icon: "warning", // Displays a warning icon
    confirmButtonText: "OK",
  });
};

const showUnknownErrorAlert = (responseStatus) => {
  return Swal.fire({
    title: `Error ${responseStatus}`,
    text: "Contacta con un administrador",
    icon: "warning", // Displays a warning icon
    confirmButtonText: "OK",
  });
};

export {
  showSuccessAlert,
  showNotLoggedAlert,
  showUnknownErrorAlert,
  showWelcomeAlert,
  showConfirmAlert,
  show_ErrorAlert,
};
