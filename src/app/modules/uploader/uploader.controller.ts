import catchAsync from "../../utils/catchAsync"
import { UploadServices } from "./uploader.service"


const uploadImages = catchAsync(async (req: any, res: any) => {
  const imageUrls = await UploadServices.uploadImages(req)

  res.status(200).json({
    success: true,
    message: "Images uploaded successfully",
    data: imageUrls,
  })
})

export const UploadControllers = {
  uploadImages,
}