import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import {
  useDeletePost,
  useGetPostById,
  useGetUserPosts,
} from "@/lib/react-queries/queriesAndMutations";
import { multiFormatDateString } from "@/lib/utils";
import { Link, useNavigate, useParams } from "react-router-dom";

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const { data: post, isPending: isPostLoading, isError: isPostError } = useGetPostById(id || "");
  const {
    data: userPosts,
    isPending: isRelatedPostsLoading,
    isError: isRelatedPostsError,
  } = useGetUserPosts(post?.creator.$id || "");

  const { mutateAsync: deletePost } = useDeletePost();

  const relatedPosts = userPosts?.documents.filter((p) => p.$id !== id);

  const handleDeletePost = async () => {
    if (post?.$id && id) {
      await deletePost({ postId: id, imageId: post?.imageId });
      navigate(-1);
    }
  };

  if (isPostLoading) {
    // Show loader while post is loading
    return (
      <div className="flex-center w-full h-full min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (isPostError || !post) {
    return (
      <div className="flex-center w-full h-full min-h-[60vh]">
        <p className="body-medium text-light-1">Post not found or failed to load.</p>
      </div>
    );
  }

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full mb-6">
        <Button variant="ghost" className="shad-button_ghost" onClick={() => navigate(-1)}>
          <img src="/assets/icons/back.svg" width={24} height={24} alt="Back icon" />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      <div className="post_details-card">
        <img className="post_details-img" src={post.imageUrl} alt="Post image" />
        <div className="post_details-info">
          <div className="flex-between w-full">
            <Link className="flex items-center gap-3" to={`/profile/${post.creator.$id}`}>
              <img
                className="rounded-full w-8 h-8 lg:w-12 lg:h-12"
                src={post.creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
                width={42}
                height={42}
                alt="Creator image"
              />
              <div className="flex flex-col">
                <p className="base-medium lg:body-bold text-light-1">{post.creator.name}</p>
                <div className="flex-center gap-2 text-light-3">
                  <p className="subtle-semibold lg:small-regular">
                    {multiFormatDateString(post.$createdAt)}
                  </p>
                  <span>-</span>
                  <p className="subtle-semibold lg:small-regular">{post.location}</p>
                </div>
              </div>
            </Link>

            <div className="flex-center flex-wrap gap-3">
              {user?.id === post.creator.$id && (
                <>
                  <Link to={`/update-post/${post.$id}`} className="shrink-0">
                    <img src="/assets/icons/edit.svg" width={24} height={24} alt="Edit post icon" />
                  </Link>

                  <Button
                    className="ghost_details-delete_btn shrink-0"
                    variant="ghost"
                    onClick={handleDeletePost}
                    aria-label="Delete post"
                  >
                    <img
                      src="/assets/icons/delete.svg"
                      width={24}
                      height={24}
                      alt="Delete post icon"
                    />
                  </Button>
                </>
              )}
            </div>
          </div>

          <hr className="w-full border border-dark-4/80 my-4" />

          <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
            <h4>{post.caption}</h4>
            <ul className="flex gap-1 mt-2 flex-wrap">
              {post.tags?.map((tag: string, index: number) => (
                <li key={`${tag}-${index}`} className="text-light-3">
                  #{tag}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full mt-4">
            <PostStats post={post} userId={user?.id || ""} />
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl mt-12">
        <span className="block border w-full border-dark-4/80"></span>

        <h3 className="body-bold md:h3-bold w-full my-10">More Related Posts</h3>

        {isRelatedPostsLoading ? (
          <Loader />
        ) : isRelatedPostsError || !relatedPosts || relatedPosts.length === 0 ? (
          <p className="text-light-4">No related posts found.</p>
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;
