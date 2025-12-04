import { getAllUsers, findUserById, updateUserById, updatePasswordById, updateProfilePictureById, deleteUserById } from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../config/cloudinary.js';

// GET all users
export async function getUser(req, res) {
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
}

//GET PROFILE
export async function getProfile(req, res, next) {
  try {
    const user = await findUserById(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

//UPDATE PROFILE BY ID
export async function updateProfile(req, res) {
  try {
    const { username, phone_number, email, domisili, status_mahasiswa, jenis_kelamin } = req.body;

    if (!username || !phone_number || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updatedUser = await updateUserById(req.user.id, {
      username,
      phone_number,
      email,
      domisili,
      status_mahasiswa,
      jenis_kelamin 
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error while updating profile" });
  }
}

//UPDATE PASSWORD BY ID
export async function updatePassword(req, res) {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ambil user saat ini
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cocokkan old password
    const isMatch = await bcrypt.compare(old_password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // Encrypt password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update password
    await updatePasswordById(req.user.id, hashedPassword);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating password" });
  }
}

// UPDATE PROFILE PICTURE
export async function updateProfilePicture(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload ke Cloudinary menggunakan upload_stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "profile_images" },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: "Cloudinary upload failed" });
        }

        // Simpan URL foto ke database
        const updatedUser = await updateProfilePictureById(req.user.id, result.secure_url);

        res.json({
          message: "Profile image updated successfully",
          imageUrl: result.secure_url,
          user: updatedUser
        });
      }
    );

    // Convert buffer ke stream
    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
}

//DELETE PROFILE
export async function deleteProfile(req, res) {
  try {
    const deletedUser = await deleteUserById(req.user.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Account deleted successfully",
      deleted_user: deletedUser, // tampilkan data kolom seperti delete transaksi
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting account" });
  }
}
