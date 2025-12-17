import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import { request } from "http";

dotenv.config();

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req) => {
    const requestUser = (req as any).user;

    const targetUserId = req.params?.userId || requestUser?.id;

    if (!targetUserId) {
      throw new Error("Missing target user id");
    }

    return {
      folder: "student-project-management/avatars",
      public_id: `user_avatar_${targetUserId}`,
      overwrite: true,
      allowed_formats: ["jpg", "png", "jpeg"],
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    };
  },
});

const upload = multer({ storage: storage });

export { cloudinary, upload };
