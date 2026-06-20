import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

const requiredCloudinaryEnv = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

export const isCloudinaryConfigured = () => (
  requiredCloudinaryEnv.every((key) => Boolean(process.env[key]))
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;