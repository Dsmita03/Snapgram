import Loader from "@/components/shared/Loader";
import UserCard from "@/components/shared/UserCard";
import { useToast } from "@/components/ui/use-toast";
import { useGetUsers } from "@/lib/react-queries/queriesAndMutations";

import { useEffect } from "react";

const AllUsers = () => {
  const { toast } = useToast();
  const {
    data: creators,
    isLoading,
    isError,
  } = useGetUsers();

  useEffect(() => {
    if (isError) {
      toast({ title: "Something went wrong while fetching users." });
    }
  }, [isError, toast]);

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>

        {isLoading ? (
          <Loader />
        ) : isError ? (
          <p className="text-destructive text-center mt-4">
            Failed to load users.
          </p>
        ) : creators?.documents.length === 0 ? (
          <p className="text-muted-foreground mt-4">No users found.</p>
        ) : (
          <ul className="user-grid">
            {creators?.documents.map((creator) => (
              <li key={creator.$id} className="flex-1 min-w-[200px] w-full">
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
