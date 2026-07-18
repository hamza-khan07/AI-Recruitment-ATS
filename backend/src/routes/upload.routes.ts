import { Router } from "express";
import { uploadMiddleware } from "../middlewares/upload.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const uploadRouter = Router();

uploadRouter.use(authMiddleware.authenticate);

uploadRouter.post("/", uploadMiddleware.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  
  const fileUrl = `/uploads/${req.file.filename}`;
  
  return res.status(200).json({
    success: true,
    data: {
      url: fileUrl,
      filename: req.file.filename,
    },
  });
});

export { uploadRouter };
