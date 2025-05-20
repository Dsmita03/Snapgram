import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";
import { ID, Query } from "appwrite";

// -------------------- AUTH --------------------

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(ID.unique(), user.email, user.password, user.name);
    if (!newAccount) throw new Error("Account creation failed.");

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.log("createUserAccount error:", error);
    return error;
  }
}

export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );
    return newUser;
  } catch (error) {
    console.log("saveUserToDB error:", error);
  }
}

export async function signInAccount(user: { email: string; password: string }) {
  try {
    return await account.createEmailSession(user.email, user.password);
  } catch (error) {
    console.log("signInAccount error:", error);
    return error;
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("No current account found.");

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.total === 0) throw new Error("No user document found.");
    return currentUser.documents[0];
  } catch (error) {
    console.log("getCurrentUser error:", error);
  }
}

export async function signOutAccount() {
  try {
    return await account.deleteSession("current");
  } catch (error) {
    console.log("signOutAccount error:", error);
  }
}

// -------------------- POST --------------------

export async function createPost(post: INewPost) {
  try {
    const uploadedFile = await uploadFile(post.file[0]);
    if (!uploadedFile) throw new Error("File upload failed.");

    const fileUrl = await getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw new Error("File preview failed.");
    }

    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw new Error("Post creation failed.");
    }

    return newPost;
  } catch (error) {
    console.log("createPost error:", error);
  }
}

export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );
    if (!posts) throw new Error("Fetching posts failed.");
    return posts;
  } catch (error) {
    console.log("getRecentPosts error:", error);
  }
}

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      { likes: likesArray }
    );
    return updatedPost;
  } catch (error) {
    console.log("likePost error:", error);
  }
}

export async function savePost(postId: string, userId: string) {
  try {
    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      { user: userId, post: postId }
    );
  } catch (error) {
    console.log("savePost error:", error);
  }
}

export async function deleteSavedPost(savedRecordId: string) {
  try {
    await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.savesCollectionId, savedRecordId);

    const { documents: savedCollection } = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId
    );

    for (const doc of savedCollection) {
      if (!doc.user || !doc.post) {
        await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.savesCollectionId, doc.$id);
      }
    }

    return { status: "ok" };
  } catch (error) {
    console.log("deleteSavedPost error:", error);
  }
}

export async function getPostById(postId?: string) {
  if (!postId) throw new Error("No post ID provided.");
  try {
    return await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.postCollectionId, postId);
  } catch (error) {
    console.log("getPostById error:", error);
  }
}

export async function updatePost(post: IUpdatePost) {
  try {
    const hasFileToUpdate = post.file && post.file.length > 0;

    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw new Error("New file upload failed.");

      const fileUrl = await getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw new Error("Preview generation failed.");
      }

      image = { imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags,
      }
    );

    if (!updatedPost) {
      if (hasFileToUpdate) await deleteFile(image.imageId);
      throw new Error("Post update failed.");
    }

    if (post.imageId && hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.log("updatePost error:", error);
  }
}

export async function deletePost(postId: string, imageId: string) {
  try {
    await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.postCollectionId, postId);
    await deleteFile(imageId);
    return { status: "ok" };
  } catch (error) {
    console.log("deletePost error:", error);
  }
}

export async function getInfinitePosts({ pageParam }: any) {
  try {
    const queries = [Query.orderDesc("$updatedAt"), Query.limit(3)];
    if (pageParam) queries.push(Query.cursorAfter(pageParam.toString()));

    const posts = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.postCollectionId, queries);
    return posts;
  } catch (error) {
    console.log("getInfinitePosts error:", error);
  }
}

export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );
    return posts;
  } catch (error) {
    console.log("searchPosts error:", error);
  }
}

// -------------------- FILE --------------------

export async function uploadFile(file: File) {
  try {
    return await storage.createFile(appwriteConfig.storageId, ID.unique(), file);
  } catch (error) {
    console.log("uploadFile error:", error);
  }
}

export async function getFilePreview(fileId: string) {
  try {
    return storage.getFilePreview(appwriteConfig.storageId, fileId, 2000, 2000, "top", 100);
  } catch (error) {
    console.log("getFilePreview error:", error);
  }
}

export async function deleteFile(fileId: string) {
  try {
    return await storage.deleteFile(appwriteConfig.storageId, fileId);
  } catch (error) {
    console.log("deleteFile error:", error);
  }
}

// -------------------- USER --------------------

export async function getUsers(limit?: number) {
  try {
    const queries: any[] = [Query.orderDesc("$createdAt")];
    if (limit) queries.push(Query.limit(limit));

    return await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.userCollectionId, queries);
  } catch (error) {
    console.log("getUsers error:", error);
  }
}

export async function getUserById(userId: string) {
  try {
    return await databases.getDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, userId);
  } catch (error) {
    console.log("getUserById error:", error);
  }
}

export async function updateUser(user: IUpdateUser) {
  try {
    const hasFileToUpdate = user.file && user.file.length > 0;

    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw new Error("Image upload failed.");

      const fileUrl = await getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw new Error("Image preview failed.");
      }

      image = { imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    if (!updatedUser) {
      if (hasFileToUpdate) await deleteFile(image.imageId);
      throw new Error("User update failed.");
    }

    if (user.imageId && hasFileToUpdate) await deleteFile(user.imageId);

    return updatedUser;
  } catch (error) {
    console.log("updateUser error:", error);
  }
}

export async function getUserPosts(userId?: string) {
  if (!userId) return;
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );
    return posts;
  } catch (error) {
    console.log("getUserPosts error:", error);
  }
}
