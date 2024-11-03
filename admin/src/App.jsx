import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import { useEffect, useState } from "react";
import Login from "./components/Login";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "$";

const App = () => {
  const [atoken, setAToken] = useState(
    localStorage.getItem("atoken") ? localStorage.getItem("atoken") : ""
  );

  useEffect(() => {
    localStorage.setItem("atoken", atoken);
  }, [atoken]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {atoken === "" ? (
        <Login setToken={setAToken} />
      ) : (
        <>
          <NavBar setToken={setAToken} />
          <hr />
          <div className="flex w-full">
            <SideBar />
            <div className="w-[70%] mx-auto ml-[max(5vw, 25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/add" element={<Add atoken={atoken} />} />
                <Route path="/list" element={<List atoken={atoken} />} />
                <Route path="/orders" element={<Orders atoken={atoken} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
