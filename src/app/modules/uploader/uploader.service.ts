
import  httpStatus  from 'http-status';
import AppError from '../../error/appError';
import { uploadImageToSpaces } from '../../utils/uploadImage2';

const uploadImages = async (req: any) => {
  const files = req.files as Express.Multer.File[]

  if (!files || files.length === 0) {
    throw new AppError( httpStatus.NOT_FOUND,"No files uploaded")
  }

  const imageUrls = await Promise.all(
    files.map(async (file) => {
      const imageUrl = await uploadImageToSpaces(file)
      return imageUrl
    })
  )

  return imageUrls
}

export const UploadServices = {
  uploadImages,
}