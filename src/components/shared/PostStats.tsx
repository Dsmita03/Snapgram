import {
  useDeleteSavedPost,
  useGetCurrentUser,
  useLikePost,
  useSavePost,
} from "@/lib/react-queries/queriesAndMutations";
import { checkIsLiked } from "@/lib/utils";
import { Models } from "appwrite";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import { useLocation } from "react-router-dom";

type PostStatsProps = {
  post: Models.Document;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const location = useLocation();

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost, isPending: isSavingPost } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeletingPost } = useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentUser();

  const [likes, setLikes] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const newLikes = post?.likes?.map((user: Models.Document) => user.$id) ?? [];
    setLikes(newLikes);
  }, [post]);

  useEffect(() => {
    const saved = !!currentUser?.save?.find((record: Models.Document) => record.post?.$id === post?.$id);
    setIsSaved(saved);
  }, [currentUser, post]);

  const savedPostRecord = currentUser?.save?.find(
    (record: Models.Document) => record.post?.$id === post?.$id
  );

  const handleLikePost = (evt: React.MouseEvent<HTMLImageElement>) => {
    evt.stopPropagation();
    if (isSavingPost || isDeletingPost) return;

    let newLikes = [...likes];
    if (newLikes.includes(userId)) {
      newLikes = newLikes.filter((id) => id !== userId);
    } else {
      newLikes.push(userId);
    }

    setLikes(newLikes);

    likePost({
      postId: post?.$id,
      likesArray: newLikes,
    });
  };

  const handleSavePost = (evt: React.MouseEvent<HTMLImageElement>) => {
    evt.stopPropagation();
    if (isSavingPost || isDeletingPost) return;

    if (savedPostRecord) {
      setIsSaved(false);
      deleteSavedPost(savedPostRecord.$id);
    } else {
      savePost({ postId: post.$id, userId });
      setIsSaved(true);
    }
  };

  const likedByUser = checkIsLiked(likes, userId);

  return (
    <div
      className={`flex justify-between items-center z-20 ${
        location.pathname.startsWith("/profile") ? "w-full" : ""
      }`}
    >
      <div className="flex gap-2 mr-5">
        <img
          className={`cursor-pointer ${isSavingPost || isDeletingPost ? "opacity-50 pointer-events-none" : ""}`}
          src={likedByUser ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
          width={20}
          height={20}
          onClick={handleLikePost}
          alt={likedByUser ? "Unlike post" : "Like post"}
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>
      <div className="flex gap-2">
        {isSavingPost || isDeletingPost ? (
          <Loader />
        ) : (
          <img
            className={`cursor-pointer ${isSavingPost || isDeletingPost ? "opacity-50 pointer-events-none" : ""}`}
            src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            width={20}
            height={20}
            onClick={handleSavePost}
            alt={isSaved ? "Unsave post" : "Save post"}
          />
        )}
      </div>
    </div>
  );
};

export default PostStats;
