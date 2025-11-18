import { Router } from "express";
import { verifyToken } from "../controllers/authController.js";
import { getSignedUploadUrl } from "../services/uploadService.js";

const router = Router();

router.use(verifyToken);

router.post("/get-signed-url", async (req, res) => {
  const { fileName, fileType, folder } = req.body || {};
  if (!fileName || !fileType) return res.status(400).json({ message: "fileName and fileType are required" });
  try {
    const result = await getSignedUploadUrl({ fileName, fileType, folder });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to get signed URL" });
  }
});

export default router;
