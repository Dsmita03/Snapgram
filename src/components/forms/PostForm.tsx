import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import FileUploader from "../shared/FileUploader";
import { PostValidation } from "@/lib/validation";
import { Models } from "appwrite";
import { useToast } from "../ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import {
  useCreatePost,
  useUpdatePost,
} from "@/lib/react-queries/queriesAndMutations";
import Loader from "../shared/Loader";

type PostFormProps = {
  post?: Models.Document;
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();

  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost();

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post?.caption || "",
      file: [],
      location: post?.location || "",
      tags: post?.tags ? post.tags.join(", ") : "",
    },
  });

  const isSubmitting = isLoadingCreate || isLoadingUpdate;

  const onSubmit = async (values: z.infer<typeof PostValidation>) => {
    if (!user) {
      return toast({
        title: "Session expired",
        description: "Please log in again.",
        variant: "destructive",
      });
    }

    try {
      const formattedValues = {
        ...values,
        tags: values.tags.split(",").map(tag => tag.trim()),
      };

      if (post && action === "Update") {
        const updatedPost = await updatePost({
          ...formattedValues,
          postId: post.$id,
          imageId: post.imageId,
          imageUrl: post.imageUrl,
        });

        if (!updatedPost) {
          return toast({ title: "Failed to update post." });
        }

        navigate(`/post/${post.$id}`);
      } else {
        const newPost = await createPost({
          ...formattedValues,
          userId: user.id,
        });

        if (!newPost) {
          return toast({
            title: "Failed to create post.",
            variant: "destructive",
          });
        }

        navigate("/");
      }
    } catch (error) {
      console.error("PostForm error:", error);
      toast({
        title: "Something went wrong.",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl"
      >
        {/* Caption */}
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  placeholder="Write a caption..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* File Upload */}
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Photos</FormLabel>
              <FormControl>
                <FileUploader
                  mediaUrl={post?.imageUrl}
                  fieldChange={field.onChange}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Location</FormLabel>
              <FormControl>
                <Input
                  className="shad-input"
                  placeholder="New York, London..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Tags (separated by commas)
              </FormLabel>
              <FormControl>
                <Input
                  className="shad-input"
                  placeholder="Art, Nature, Travel..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            className="shad-button_dark_4 !h-auto"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader />
                {`${action} Post`}
              </>
            ) : (
              `${action} Post`
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
