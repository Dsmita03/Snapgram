import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

type UserCardProps = {
  user: Models.Document & {
    imageUrl?: string;
    name?: string;
    username?: string;
  };
};

const UserCard = ({ user }: UserCardProps) => {
  return (
    <Link to={`/profile/${user.$id}`} className="user-card">
      <img
        className="rounded-full w-14 h-14"
        src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
        alt={`Profile image of ${user.name || "user"}`}
      />

      <div className="flex-center flex-col gap-1">
        <p className="base-medium text-light-1 text-center line-clamp-1">
          {user.name || "Unknown"}
        </p>
        <p className="small-regular text-light-3 text-center line-clamp-1">
          @{user.username || "unknown"}
        </p>
      </div>

      <Button className="shad-button_primary px-5" type="button" size="sm">
        Follow
      </Button>
    </Link>
  );
};

export default UserCard;
