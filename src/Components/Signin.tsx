import { useRef, useState } from "react";
import { showWelcomeAlert, show_Alert } from "../alerts";

export default function Signin({ setIsUserOnline }) {
  const dialogRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const openDialog = () => {
    dialogRef.current.showModal();
  };

  const closeDialog = () => {
    dialogRef.current.close();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameRef.current.value,
        password: passwordRef.current.value,
      }),
    };
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/users/signin`, requestOptions);

    if (response.ok) {
      const token = await response.json();

      // Convert the JWT token to a string
      const tokenString = JSON.stringify(token);

      // Save the JWT token string to local storage
      localStorage.setItem("jwtToken", tokenString);
      setIsUserOnline(true);
      closeDialog();
      showWelcomeAlert();
    } else {
      if (response.status === 404) {
        closeDialog();
        show_Alert("Usuario no encontrado");
        // user not found
      }
      if (response.status === 401) {
        //user found but the password doesnt match
        closeDialog();
        show_Alert("Contrasenia incorrecta");
      }
    }
  }

  return (
    <>
      <button onClick={openDialog}>Inicia sesión</button>

      <dialog ref={dialogRef} className="user">
        <div className="content">
          <h2>Inicia sesión</h2>
          <form id="signin-form" onSubmit={handleSubmit}>
            <input
              ref={usernameRef}
              name="username"
              placeholder="username"
              required
            />

            <input
              ref={passwordRef}
              name="password"
              placeholder="password"
              required
            />
          </form>
          <div className="buttons-container">
            <button type="submit" form="signin-form">
              Ok
            </button>
            <button onClick={closeDialog}>Salir</button>
          </div>
        </div>
      </dialog>
    </>
  );
}
