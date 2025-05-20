import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useSignOutAccount } from "@/lib/react-queries/queriesAndMutations";
import { useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";
import { sideBarLinks } from "@/constants";
import { INavLink } from "@/types";
import Loader from "./Loader";

const LeftSidebar = () => {
  const { pathname } = useLocation();

  const { mutate: signOut, isSuccess } = useSignOutAccount();

  const { user, isLoading } = useUserContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess) {
      navigate("/login");
    }
  }, [isSuccess, navigate]);

  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11">
        <Link to="/" className="flex gap-3 items-center">
          <img src="/assets/images/logo.svg" width={170} height={36} alt="logo" />
        </Link>
        {isLoading || !user?.email ? (
          <div className="h-14">
            <Loader />
          </div>
        ) : (
          <Link className="flex gap-3 items-center" to={`/profile/${user.id}`}>
            <img
              className="h-14 w-14 rounded-full"
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="Profile image"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/icons/profile-placeholder.svg";
              }}
            />
            <div className="flex flex-col">
              <p className="body-bold">{user.name}</p>
              <p className="small-regular text-light-3">@{user.username}</p>
            </div>
          </Link>
        )}
        <ul className="flex flex-col gap-6">
          {sideBarLinks.map((link: INavLink) => (
            <li key={link.label} className="leftsidebar-link group">
              <NavLink
                to={link.route}
                className={({ isActive }) =>
                  `flex gap-4 items-center p-4 transition rounded-md
                  ${isActive ? "bg-primary-500 text-white" : "group-hover:bg-primary-200"}
                  focus:outline-none`
                }
              >
                <img
                  className="group-hover:invert-white"
                  src={link.imgURL}
                  alt={link.label}
                />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <Button
        variant={"ghost"}
        className="shad-button_ghost"
        onClick={() => signOut()}
        aria-label="Logout"
      >
        <img src="/assets/icons/logout.svg" alt="logout icon" />
        <p className="small-medium">Logout</p>
      </Button>
    </nav>
  );
};

export default LeftSidebar;
