import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import UserCard from "@/components/shared/UserCard";
import {
  useGetRecentPosts,
  useGetUsers,
} from "@/lib/react-queries/queriesAndMutations";
import { Models } from "appwrite";

const Home = () => {
  const {
    data: posts,
    isPending: isPostsLoading,
    isError: isPostsError,
  } = useGetRecentPosts();

  const {
    data: creators,
    isPending: isCreatorsLoading,
    isError: isCreatorsError,
  } = useGetUsers(10);

  if (isPostsError || isCreatorsError) {
    return (
      <div className="flex flex-col md:flex-row gap-8 p-6">
        <div className="flex-1">
          <p className="body-medium text-light-1">Something went wrong while fetching posts.</p>
        </div>
        <div className="w-full md:w-80">
          <p className="body-medium text-light-1">Something went wrong while fetching creators.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col md:flex-row flex-1 gap-10 max-w-7xl mx-auto px-4 py-6">
      {/* Home Feed */}
      <section className="flex-1 min-w-0">
        <h2 className="h3-bold md:h2-bold mb-6 text-left">Home Feed</h2>

        {isPostsLoading && !posts ? (
          <Loader />
        ) : posts?.documents.length === 0 ? (
          <p className="text-light-4 mt-4">No posts available.</p>
        ) : (
          <ul className="flex flex-col gap-9">
            {posts?.documents.map((post: Models.Document) => (
              <PostCard key={post.$id} post={post} />
            ))}
          </ul>
        )}
      </section>

      {/* Top Creators */}
      <aside className="w-full md:w-80 flex-shrink-0">
        <h3 className="h3-bold text-light-1 mb-6">Top Creators</h3>

        {isCreatorsLoading && !creators ? (
          <Loader />
        ) : creators?.documents.length === 0 ? (
          <p className="text-light-4 mt-4">No creators found.</p>
        ) : (
          <ul className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
            {creators?.documents.map((creator) => (
              <li key={creator.$id}>
                <UserCard user={creator} />
              </li>
            ))}
          </ul>
        )}
      </aside>
    </main>
  );
};

export default Home;
