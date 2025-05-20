// config.ts
import { Client, Account, Databases, Storage, Avatars } from "appwrite";

export const appwriteConfig = {
  url: "https://cloud.appwrite.io/v1",
  projectId: "669e60cf002526c4879b",
  databaseId: "669e649d00180eea8b85",
  storageId: "669e644b002d2d6dd1cf",
  userCollectionId: "669e651a00215848d7b7",
  postCollectionId: "669e64d300258cbb2fd2",
  savesCollectionId: "669e65580011b5d57c6c",
};

export const client = new Client();

client.setEndpoint(appwriteConfig.url);
client.setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
