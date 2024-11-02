import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";

const NavBar = ({ setToken }) => {
  return (
    <div className="flex items-center justify-between py-2 px-[4%] font-medium">
      <Link to="/">
        <img src={assets.logo} className="w-[max(10%,100px)]" alt="" />
      </Link>

      <div className="flex items-center gap-6">
        <button
          onClick={() => setToken("")}
          className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default NavBar;
