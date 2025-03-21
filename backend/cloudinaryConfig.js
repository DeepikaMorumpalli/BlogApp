const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog", 
    format: async (req, file) => "png", 
    public_id: (req, file) => file.originalname.split(".")[0], 
  },
});

const upload = multer({ storage });

module.exports = { upload, cloudinary };
