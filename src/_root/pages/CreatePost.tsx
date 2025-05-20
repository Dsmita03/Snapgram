import PostForm from "@/components/forms/PostForm";

const CreatePost = () => {
  return (
    <section className="flex flex-1">
      <div className="common-container">
        <header className="max-w-5xl flex flex-col sm:flex-row items-start gap-3 w-full">
          <img
            src="/assets/icons/add-post.svg"
            width={36}
            height={36}
            alt="Add post icon"
            className="mt-1"
          />
          <h2 className="h3-bold md:h2-bold text-left">Create Post</h2>
        </header>

        <PostForm action="Create" />
      </div>
    </section>
  );
};

export default CreatePost;
