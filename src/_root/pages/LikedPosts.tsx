import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useGetCurrentUser } from "@/lib/react-queries/queriesAndMutations";

const LikedPosts = () => {
  const { data: currentUser, isPending, isError } = useGetCurrentUser();

  if (isPending) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return <p className="text-light-4">Failed to load liked posts.</p>;
  }

  if (!currentUser || currentUser.liked.length === 0) {
    return <p className="text-light-4">No liked posts</p>;
  }

  return <GridPostList posts={currentUser.liked} showStats={false} />;
};

export default LikedPosts;
