import fs from "fs";
import dotenv from "dotenv";
import { v2 as cloudinary, type UploadApiOptions } from "cloudinary";

dotenv.config();

type ResourceType = UploadApiOptions["resource_type"];
type Folder = "profileImage";

type UploadToCloudinary = (
  filePath: string,
  folder: Folder,
  resource_type?: ResourceType
) => Promise<string | null>;

type DeleteFromCloudinary = (
  url: string,
  folder: Folder,
  resource_type?: ResourceType
) => Promise<boolean>;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile: UploadToCloudinary = async (filePath, folder, resource_type = "auto") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type,
    });
    fs.unlinkSync(filePath);
    return result.secure_url;
  } catch (error) {
    fs.unlinkSync(filePath);
    console.log("CLOUDINARY_UPLOAD_ERROR", error);
    return null;
  }
};

export const deleteFile: DeleteFromCloudinary = async (url, folder, resource_type = "auto") => {
  try {
    const path = url.split("/").pop()?.split(".")[0];
    const publicId = `${folder}/${path}`;
    await cloudinary.uploader.destroy(publicId, {
      resource_type,
    });
    return true;
  } catch (error) {
    console.log("CLOUDINARY_DELETE_ERROR", error);
    return false;
  }
};
