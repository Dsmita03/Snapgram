import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Models, Query } from "appwrite";
import {
  createPost,
  createUserAccount,
  deleteSavedPost,
  deletePost,
  getCurrentUser,
  getPostById,
  getRecentPosts,
  getUserById,
  getUserPosts,
  getUsers,
  likePost,
  savePost,
  searchPosts,
  signInAccount,
  signOutAccount,
  updatePost,
  updateUser,
} from "../appwrite/api";
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { QUERY_KEYS } from "./queryKeys";
import { appwriteConfig } from "../appwrite/config";
import { Databases } from "appwrite";

import { Client } from "appwrite";

const client = new Client();
client
  .setEndpoint(appwriteConfig.url)
  .setProject(appwriteConfig.projectId);

const database = new Databases(client);

type Document = Models.Document;
type DocumentList<T extends Models.Document> = Models.DocumentList<T>;

// ========== Mutations ==========

export const useCreateUserAccountMutation = () =>
  useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });

export const useSignInAccount = () =>
  useMutation({
    mutationFn: (user: { email: string; password: string }) => signInAccount(user),
  });

export const useSignOutAccount = () =>
  useMutation({
    mutationFn: signOutAccount,
  });

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_RECENT_POSTS] });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, likesArray }: { postId: string; likesArray: string[] }) =>
      likePost(postId, likesArray),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_RECENT_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CURRENT_USER] });
    },
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
      savePost(postId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_RECENT_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CURRENT_USER] });
    },
  });
};

export const getSavedPosts = async (userId: string) => {
  const response = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.savesCollectionId,
    [Query.equal("user", userId)],
  );

  // Extract posts (handling nulls just in case)
  const posts = response.documents
    .map((doc: any) => doc.post)
    .filter((post: any) => post && post.$id); // valid post

  return posts.reverse();
};
export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_RECENT_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_POSTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CURRENT_USER] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_RECENT_POSTS] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CURRENT_USER] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id] });
    },
  });
};

// ========== Queries ==========

export const useGetRecentPosts = () =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
    staleTime: 1000 * 60,
  });

export const useGetCurrentUser = () =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });

export const useGetPostById = (postId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });

export const useSearchPosts = (searchTerm: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  });

export const useGetUsers = (limit?: number) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getUsers(limit),
  });

export const useGetUserById = (userId: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });

export const useGetUserPosts = (userId?: string) =>
  useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });

// ========== Infinite Query ==========

export const getInfinitePosts = async (
  pageParam: string
): Promise<DocumentList<Document>> => {
  const response = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    [
      Query.limit(10),
      ...(pageParam ? [Query.cursorAfter(pageParam)] : []),
    ]
  );

  return response;
};

export const useGetPosts = () => {
  return useInfiniteQuery<
    DocumentList<Document>,
    Error,
    DocumentList<Document>,
    [typeof QUERY_KEYS.GET_INFINITE_POSTS],
    string
  >({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    initialPageParam: "",
    queryFn: ({ pageParam = "" }) => getInfinitePosts(pageParam),
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.documents.length === 0) return undefined;
      return lastPage.documents[lastPage.documents.length - 1].$id;
    },
  });
};
