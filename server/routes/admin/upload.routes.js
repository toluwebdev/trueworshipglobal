import { Readable } from "node:stream";
import { Router } from "express";
import multer from "multer";
import cloudinary, {
  configureCloudinary,
  isCloudinaryConfigured,
} from "../../config/cloudinary.js";

const router = Router();

const FOLDERS = {
  blogs: "trueworshipglobal/blogs",
  events: "trueworshipglobal/events",
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpe?g|png|webp|gif)$/i.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
    }
  },
});

function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      },
    );
    Readable.from(buffer).pipe(stream);
  });
}

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!isCloudinaryConfigured() || !configureCloudinary()) {
      return res.status(503).json({ error: "Cloudinary is not configured on the server" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const type = req.body.type === "events" ? "events" : "blogs";
    const folder = FOLDERS[type];

    const result = await uploadBuffer(req.file.buffer, folder);

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Image must be 5 MB or smaller" });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

export default router;
