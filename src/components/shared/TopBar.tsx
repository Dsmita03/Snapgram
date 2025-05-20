import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useSignOutAccount } from "@/lib/react-queries/queriesAndMutations";
import { useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";

const TopBar = () => {
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const { user } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess) {
      // Reload the page after logout instead of navigate(0)
      window.location.reload();
    }
  }, [isSuccess, navigate]);

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link to="/" className="flex gap-3 items-center">
          <img src="/assets/images/logo.svg" width={130} height={325} alt="Site Logo" />
        </Link>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            className="shad-button_ghost"
            onClick={() => signOut()}
            aria-label="Logout"
          >
            <img src="/assets/icons/logout.svg" alt="Logout icon" />
          </Button>
          <Link
            className="flex-center gap-3"
            to={`/profile/${user?.id ?? ""}`}
            aria-label="User profile"
          >
            <img
              className="h-8 w-8 rounded-full"
              src={user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="User profile image"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopBar;
