// utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ID,Permission, Role } from "appwrite";
import { appwriteConfig, storage, databases } from "./appwrite/config";

// Safely merge tailwind class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert file to preview URL (temporary)
export const convertFileToUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

// Get preview URL for fileId from Appwrite storage
export const getFilePreview = (fileId: string): string => {
  return storage.getFilePreview(appwriteConfig.storageId, fileId).href;
};


// Save a post (store userId & postId in saves collection)
export const savePost = async (userId: string, postId: string) => {
  try {
    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        userId,
        postId,
      }
    );
    console.log("✅ Post saved to savesCollectionId:", response);
    return response;
  } catch (error) {
    console.error("❌ Error saving post:", error);
    throw error;
  }
};

export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file,
      [Permission.read(Role.any())] // make public
    );
    return uploadedFile.$id;
  } catch (error) {
    console.error("Image upload error:", error);
    return null;
  }
};

// Format: May 20, 2025 at 4:32 PM
export function formatDateString(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-US", options);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formattedDate} at ${time}`;
}

// Relative time formatting: "Just now", "2 hours ago", etc.
export const multiFormatDateString = (timestamp: string = ""): string => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "Invalid date";

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffInSeconds = diff / 1000;
  const diffInMinutes = diffInSeconds / 60;
  const diffInHours = diffInMinutes / 60;
  const diffInDays = diffInHours / 24;

  if (diffInDays >= 30) return formatDateString(timestamp);
  if (Math.floor(diffInDays) === 1) return "1 day ago";
  if (Math.floor(diffInDays) > 1) return `${Math.floor(diffInDays)} days ago`;
  if (Math.floor(diffInHours) >= 1) return `${Math.floor(diffInHours)} hours ago`;
  if (Math.floor(diffInMinutes) >= 1) return `${Math.floor(diffInMinutes)} minutes ago`;
  return "Just now";
};

// Check if user has liked (or saved) a post
export const checkIsLiked = (likeList: string[], userId: string): boolean => {
  return likeList.includes(userId);
};
