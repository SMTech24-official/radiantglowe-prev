// import AWS from "aws-sdk"
// import { v4 as uuidv4 } from "uuid"
// import config from "../config"


// // Configure AWS SDK
// const spacesEndpoint = new AWS.Endpoint(config.DO_SPACES_ENDPOINT as string) 
// const s3 = new AWS.S3({
//   endpoint: spacesEndpoint,
//   accessKeyId: config.DO_SPACES_ACCESS_KEY,
//   secretAccessKey: config.DO_SPACES_SECRET_KEY,
// })

// export const uploadImageToSpaces = async (
//   file: Express.Multer.File
// ): Promise<string> => {
//   const fileKey = `${uuidv4()}-${file.originalname}`;

//   const params = {
//     Bucket: config.DO_SPACES_BUCKET!,
//     Key: fileKey,
//     Body: file.buffer,
//     ACL: "public-read",
//     ContentType: file.mimetype,
//   };

//   // console.log("Uploading to Spaces with params:", {
//   //   Bucket: params.Bucket,
//   //   Key: params.Key,
//   //   ContentType: params.ContentType,
//   //   BufferSize: file.buffer.length,
//   // });

//   try {
//     const data = await s3.upload(params).promise();
//     // console.log("Upload successful:", data);
//     return data.Location;
//   } catch (error: any) {
//     console.error("Upload failed:", {
//       message: error.message,
//       code: error.code,
//       stack: error.stack,
//     });
//     throw new Error("Failed to upload image.");
//   }
// };


// export const removeFileFromSpaces = async (fileUrl: string): Promise<void> => {
//   // Extract the key (filename) from the file URL

//   const urlParts = fileUrl.split("/")

//   const fileKey = decodeURIComponent(urlParts[urlParts.length - 1])

//   if (!config.DO_SPACES_BUCKET) {
//     throw new Error(
      
//       "DigitalOcean Spaces bucket name is not configured."
//     )
//   }

//   const params = {
//     Bucket: config.DO_SPACES_BUCKET, // Name of your DigitalOcean Space
//     Key: fileKey, // File name in the Space
//   }

//   try {
//     await s3.deleteObject(params).promise()
//     // console.log(
//     //   `File ${fileKey} deleted successfully from DigitalOcean Spaces.`
//     // )
//   } catch (error) {
//     console.error("Error deleting file from DigitalOcean Spaces:", error)
//     throw new Error("Failed to delete file.")
//   }
// }