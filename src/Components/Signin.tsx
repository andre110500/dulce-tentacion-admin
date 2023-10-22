import { useRef, useState } from "react";
import { showWelcomeAlert } from "../alerts";

export default function Signin({ setIsUserOnline }) {
  const dialogRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const [error, setError] = useState({ password: false, username: false });
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
      showWelcomeAlert();

      closeDialog();
    } else {
      if (response.status === 404) {
        console.log("usurario o contra incorrecta");
        setError({ username: true, password: false });
      }
      if (response.status === 401) {
        setError({ password: true, username: false });
      }
    }
  }

  return (
    <div id="signin">
      <button onClick={openDialog}>Login</button>

      <dialog ref={dialogRef}>
        <div className="content">
          <h2>Inicia sesión</h2>
          <form id="signin-form" onSubmit={handleSubmit}>
            <input ref={usernameRef} name="username" placeholder="username" />
            {error.username ? "Usuario incorrecto" : ""}
            <input ref={passwordRef} name="password" placeholder="password" />
            {error.password ? "Contrasenia incorrecta" : ""}
          </form>
          <div className="buttons-container">
            <button type="submit" form="signin-form">
              Accept
            </button>
            <button onClick={closeDialog}>Close</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
