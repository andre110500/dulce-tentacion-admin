import "./App.css";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Home, {
  DrinksAndCigarettesPage,
  FlavoursPage,
  FrozenTreatsPage,
  IceCreamPage,
  DiscountsPage,
} from "./Components/Home";
import CartelesPage from "./Components/CartelesPage";
import ConfigurarCartelesPage from "./Components/ConfigurarCartelesPage";
import { useState, useEffect } from "react";
import UserContext from "./Contexts/UserContext";
import BuildStatus from "./Components/BuildStatus";

const pages = [
  { path: "/", label: "Helados", Component: IceCreamPage },
  { path: "/bebidas", label: "Bebidas", Component: DrinksAndCigarettesPage },
  { path: "/postres", label: "Postres", Component: FrozenTreatsPage },
  { path: "/sabores", label: "Sabores", Component: FlavoursPage },
  { path: "/otros", label: "Otros", Component: Home },
  { path: "/descuentos", label: "Descuentos", Component: DiscountsPage },
  { path: "/carteles", label: "Carteles", Component: ConfigurarCartelesPage },
];

const fullscreenPages = ["/carteles/carousel"];

function getCurrentPath() {
  const hashPath = window.location.hash.replace(/^#/, "");
  if (hashPath === "/carteles/carousel") return "/carteles/carousel";
  return pages.some((page) => page.path === hashPath) ? hashPath : "/";
}

function App() {
  const [isUserOnline, setIsUserOnline] = useState(false);
  const [currentPath, setCurrentPath] = useState(getCurrentPath);

  async function checkTokenValidityAndSetUserOnlineStatus(token) {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`, // Add the JWT to the Authorization header
      },
    };
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/users/auth`, requestOptions);
      if (!response.ok) {
        setIsUserOnline(false);
        console.log(response.status);

        throw new Error("Request failed");
      }
      console.log("auth succeded, setting user state to online!");
      setIsUserOnline(true);

      // Process the data or perform other operations
    } catch (error) {
      console.error("Error:", error.message);
      setIsUserOnline(false);
    }
  }

  //at page load
  //if token at localStorage
  ////////use server to check it
  ////////if valid
  //////////////set isUserOnline to true
  useEffect(() => {
    const token = localStorage.getItem("jwtToken")
      ? JSON.parse(localStorage.getItem("jwtToken"))?.token
      : undefined;

    if (token) {
      // check if token is valid

      checkTokenValidityAndSetUserOnlineStatus(token);
    } else {
      setIsUserOnline(false);
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(getCurrentPath());
      window.scrollTo(0, 0);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const isFullscreen = fullscreenPages.includes(currentPath);

  return (
    <>
      <UserContext.Provider
        value={{
          isUserOnline,
          setIsUserOnline,
        }}
      >
        {!isFullscreen && <Header pages={pages} currentPath={currentPath} />}
        <Main currentPath={currentPath} />
        {!isFullscreen && <Footer />}
        {!isFullscreen && <BuildStatus />}
      </UserContext.Provider>
    </>
  );
}

function Main({ currentPath }) {
  if (currentPath === "/carteles/carousel") {
    return <CartelesPage />;
  }

  const activePage = pages.find((page) => page.path === currentPath) || pages[0];
  const ActivePage = activePage.Component;

  return (
    <main>
      <ActivePage />
    </main>
  );
}

export default App;
