import uploadFile from "../config/cloudinary.js";
import User from "../models/user.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("[current-user]", error.message);
    return res.status(500).json({ message: "could not load the user" });
  }
};

export const editProfile = async (req, res) => {
  try {
    const update = {};

    if (typeof req.body.name === "string") {
      update.name = req.body.name.trim();
    }

    if (req.file) {
      update.image = await uploadFile(req.file.path);
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "nothing to update" });
    }

    const user = await User.findByIdAndUpdate(req.userId, update, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("[edit-profile]", error.message);
    return res.status(500).json({ message: "could not update the profile" });
  }
};

export const getOtherUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select("-password")
      .sort({ name: 1, userName: 1 });

    return res.status(200).json(users);
  } catch (error) {
    console.error("[other-users]", error.message);
    return res.status(500).json({ message: "could not load users" });
  }
};

export const search = async (req, res) => {
  try {
    const query = (req.query.query || "").trim();

    if (!query) {
      return res.status(400).json({ message: "query is required" });
    }

    const regex = new RegExp(escapeRegex(query), "i");
    const users = await User.find({
      _id: { $ne: req.userId },
      $or: [{ name: regex }, { userName: regex }, { email: regex }],
    })
      .select("-password")
      .limit(20);

    return res.status(200).json(users);
  } catch (error) {
    console.error("[search]", error.message);
    return res.status(500).json({ message: "could not search users" });
  }
};
