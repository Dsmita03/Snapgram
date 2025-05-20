import { Models } from "appwrite";
import { Loader } from "lucide-react";
import GridPostList from "./GridPostList";

type SearchResultsProps = {
  searchedPosts: Models.DocumentList<Models.Document>;
  isSearchFetching: boolean;
};

const SearchNewResults = ({
  searchedPosts,
  isSearchFetching,
}: SearchResultsProps): JSX.Element => {
  if (isSearchFetching) {
    return (
      <div
        className="w-full flex justify-center mt-5"
        aria-busy="true"
        aria-live="polite"
      >
        <Loader />
      </div>
    );
  }

  if (searchedPosts?.documents?.length > 0) {
    return <GridPostList posts={searchedPosts.documents} />;
  }

  return (
    <p className="text-light-4 mt-10 text-center w-full" role="alert">
      No results found
    </p>
  );
};

export default SearchNewResults;
