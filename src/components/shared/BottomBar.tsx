import { bottombarLinks } from "@/constants";
import { INavLink } from "@/types";
import { NavLink } from "react-router-dom";

const BottomBar = () => {
  return (
    <section className="bottom-bar">
      {bottombarLinks.map((link: INavLink) => (
        <NavLink
          key={link.label}
          to={link.route}
          className={({ isActive }) =>
            `flex-center flex-col gap-1 p-2 transition rounded-[10px] ${
              isActive ? "bg-primary-500" : ""
            }`
          }
        >
          {({ isActive }) => (
            <>
              <img
                className={`group-hover:invert-white ${isActive ? "invert-white" : ""}`}
                width={16}
                height={16}
                src={link.imgURL}
                alt={link.label}
              />
              <p className="tiny-medium">{link.label}</p>
            </>
          )}
        </NavLink>
      ))}
    </section>
  );
};

export default BottomBar;
