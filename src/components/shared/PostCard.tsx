import { useEffect, useState } from "react";
import { getFilePreview } from "@/lib/utils"; // async version
import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import PostStats from "./PostStats";
import { multiFormatDateString } from "@/lib/utils";

type PostCardProps = {
  post: Models.Document & { imageId?: string };
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const [postImageUrl, setPostImageUrl] = useState("/assets/icons/profile-placeholder.svg");

  useEffect(() => {
    const fetchPostImage = async () => {
      if (post.imageId) {
        try {
          const url = await getFilePreview(post.imageId);
          setPostImageUrl(url);
        } catch (err) {
          console.error("Error fetching image preview:", err);
        }
      }
    };

    fetchPostImage();
  }, [post.imageId]);
  
  if (!post.creator) return null;

  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.creator.$id}`}>
            <img
              className="rounded-full w-12 h-12"
              src={post.creator.imageUrl || "/assets/icons/profile-placeholder.svg"}
              width={48}
              height={48}
              alt={`${post.creator.name}'s profile picture`}
            />
          </Link>
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
        </div>

        {user?.id === post.creator.$id && (
          <Link to={`/update-post/${post.$id}`}>
            <img src="/assets/icons/edit.svg" width={20} height={20} alt="Edit post" />
          </Link>
        )}
      </div>

      <Link to={`/post/${post.$id}`}>
        <div className="small-medium lg:base-medium py-5">
          <h4>{post.caption}</h4>
          <ul className="flex gap-1 mt-2">
            {post.tags?.map((tag: string, index: number) => (
              <li key={`${tag}-${index}`} className="text-light-3">
                #{tag}
              </li>
            ))}
          </ul>
        </div>
        <img
          src={postImageUrl}
          className="post-card_img"
          alt={`Post image for: ${post.caption}`}
          loading="lazy"
        />
      </Link>

      <PostStats post={post} userId={user?.id || ""} />
    </div>
  );
};

export default PostCard;
