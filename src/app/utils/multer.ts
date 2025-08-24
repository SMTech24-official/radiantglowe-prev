import multer from "multer"

// Configure Multer to store files in memory
export const upload = multer({
  storage: multer.memoryStorage(), 
  limits: { fileSize: 50 * 1024 * 1024 }, 
})

export const uploadSingle = upload.single("image")

export const uploadMiddleware = upload.fields([
  { name: "invoice", maxCount: 1 }, 
  { name: "image", maxCount: 1 }, 
])

export const uploadVideo = upload.single("video")