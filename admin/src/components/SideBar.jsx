import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const SideBar = () => {
  return (
    <div className="w-[18%] min-h-screen border-r-2">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-2 px-3 border border-r-0 border-gray-300 rounded-l cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-gray-500" : ""
            }  `
          }
          to={"/add"}
        >
          <img className="w-5 h-5" src={assets.add_icon}></img>
          <p className="hidden md:block">Add Items</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-2 px-3 border border-r-0 border-gray-300 rounded-l cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-gray-500" : ""
            }  `
          }
          to={"/list"}
        >
          <img className="w-5 h-5" src={assets.order_icon}></img>
          <p className="hidden md:block">List Items</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-2 px-3 border border-r-0 border-gray-300 rounded-l cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-gray-500" : ""
            }  `
          }
          to={"/orders"}
        >
          <img className="w-5 h-5" src={assets.order_icon}></img>
          <p className="hidden md:block">Orders</p>
        </NavLink>
      </div>
    </div>
  );
};

export default SideBar;
