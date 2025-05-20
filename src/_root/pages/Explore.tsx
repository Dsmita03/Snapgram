import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import SearchNewResults from "@/components/shared/SearchNewResults";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import {
  useGetPosts,
  useSearchPosts,
} from "@/lib/react-queries/queriesAndMutations";

const Explore = () => {
  const { ref, inView } = useInView();

  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts();

  const [searchValue, setSearchValue] = useState("");
  const debouncedValue = useDebounce(searchValue, 500);

  const {
    data: searchedPosts,
    isFetching: isSearchFetching,
  } = useSearchPosts(debouncedValue);

  useEffect(() => {
    if (inView && !searchValue) {
      fetchNextPage();
    }
  }, [inView, searchValue, fetchNextPage]);

  const isSearchActive = searchValue.trim() !== "";
  const noPostsAvailable =
    !isSearchActive && posts?.pages.every((page) => page.documents.length === 0);

  if (!posts) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  return (
    <section className="explore-container">
      {/* Search Bar */}
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold">Search Posts</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img
            src="/assets/icons/search.svg"
            width={24}
            height={24}
            alt="Search icon"
          />
          <Input
            className="explore-search"
            type="text"
            placeholder="Search ..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      {/* Filter header */}
      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold w-full">Popular Today</h3>

        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <p className="small-medium md:base-medium text-light-2">All</p>
          <img
            src="/assets/icons/filter.svg"
            width={20}
            height={20}
            alt="Filter icon"
          />
        </div>
      </div>

      {/* Posts */}
      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {isSearchActive && searchedPosts ? (
          <SearchNewResults
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts}
          />
        ) : noPostsAvailable ? (
          <p className="text-light-4 mt-10 text-center w-full">
            End of posts
          </p>
        ) : (
          posts.pages.map((page, index) => (
            <GridPostList key={`page-${index}`} posts={page.documents} />
          ))
        )}
      </div>

      {/* Infinite scroll loader */}
      {hasNextPage && !isSearchActive && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}
    </section>
  );
};

export default Explore;
