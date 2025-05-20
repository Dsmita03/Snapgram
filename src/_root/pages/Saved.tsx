import { useEffect, useState } from "react";
import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useGetCurrentUser } from "@/lib/react-queries/queriesAndMutations";
import { savePost } from "@/lib/appwrite/api"; // Adjust path as needed
import { Models } from "appwrite";

const Saved = () => {
  const { data: currentUser, isLoading: userLoading } = useGetCurrentUser();
  const [savedPosts, setSavedPosts] = useState<Models.Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (currentUser?.$id) {
        try {
          const posts = await savePost("postIdPlaceholder", currentUser.$id);
          setSavedPosts(Array.isArray(posts) ? posts : []);
        } catch (error) {
          console.error("Error fetching saved posts:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSavedPosts();
  }, [currentUser]);

  if (userLoading || loading) {
    return (
      <div className="saved-container w-full flex-center">
        <Loader />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="saved-container w-full flex-center">
        <p className="text-light-4">No user found. Please login.</p>
      </div>
    );
  }

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl mb-6">
        <img
          className="invert-white"
          src="/assets/icons/save.svg"
          width={56}
          height={56}
          alt="Save icon"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      </div>

      <div className="w-full flex justify-center max-w-5xl gap-9 min-h-[200px]">
        {savedPosts.length === 0 ? (
          <p className="text-light-4 self-center">No saved posts available</p>
        ) : (
          <GridPostList posts={savedPosts} showStats={false} />
        )}
      </div>
    </div>
  );
};

export default Saved;
