import express from 'express';
import { 
  getUser, 
  getProfile, 
  updateProfile, 
  updatePassword, 
  deleteProfile, 
  updateProfilePicture 
} from '../controllers/userController.js';

import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// GET all or user basic
router.get("/", getUser);

// GET profile by ID
router.get("/:id", verifyToken, getProfile);

// UPDATE basic profile
router.put("/:id", verifyToken, updateProfile);

// UPDATE password
router.put("/:id/password", verifyToken, updatePassword);

// UPLOAD profile picture (Cloudinary)
router.put(
  "/profile/upload-image",
  verifyToken,
  upload.single("image"),
  updateProfilePicture
);

// DELETE account
router.delete("/:id", verifyToken, deleteProfile);

export default router;
