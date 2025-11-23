import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

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
  params: async (req, file) => {
    const user = (req as any).user;
    const userId = req.body.userId || user?.id;
    const publicId = `user_avatar_${userId}`;

    return {
      folder: "student-project-management/avatars",
      allowed_formats: ["jpg", "png", "jpeg", "gif"],
      transformation: [{ width: 500, height: 500, crop: "limit" }],
      public_id: publicId,
    };
  },
});

const upload = multer({ storage: storage });

export { cloudinary, upload };
