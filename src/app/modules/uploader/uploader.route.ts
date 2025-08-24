import express from "express"

import { upload } from "../../utils/multer"
import { UploadControllers } from "./uploader.controller"

const router = express.Router()

router.post(
  "/multiple",
  upload.array("images", 50),
  UploadControllers.uploadImages
)

export const UploadRoutes = router