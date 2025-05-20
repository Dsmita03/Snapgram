import { useParams } from "react-router-dom";
import PostForm from "@/components/forms/PostForm";
import Loader from "@/components/shared/Loader";
import { useGetPostById } from "@/lib/react-queries/queriesAndMutations";
import { useToast } from "@/components/ui/use-toast";

const EditPost = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const {
    data: post,
    isPending,
    isError,
  } = useGetPostById(id || "");

  if (isPending) return <Loader />;

  if (isError || !post) {
    toast({ title: "Failed to fetch post data. Please try again later." });
    return (
      <div className="text-center text-destructive mt-10 font-medium">
        Unable to load post details.
      </div>
    );
  }

  return (
    <section className="flex flex-1">
      <div className="common-container">
        <header className="max-w-5xl flex flex-col sm:flex-row items-start gap-3 w-full">
          <img
            src="/assets/icons/add-post.svg"
            width={36}
            height={36}
            alt="Edit post icon"
            className="mt-1"
          />
          <h2 className="h3-bold md:h2-bold text-left">Edit Post</h2>
        </header>

        <PostForm action="Update" post={post} />
      </div>
    </section>
  );
};

export default EditPost;
