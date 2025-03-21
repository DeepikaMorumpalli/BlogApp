const cloudinary = require('./cloudinaryConfig.js');
const fs =  require('fs');
const path = require('path');

const uploadsFolder = path.join(__dirname, "uploads");

const uploadFile = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "blog", 
    });
    console.log("Uploaded:", result.secure_url);
    return result.secure_url; 
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

const uploadAllFiles = async () => {
  try {
    const files = fs.readdirSync(uploadsFolder);
    if (files.length === 0) {
      console.log("No files found in uploads folder.");
      return;
    }
    console.log(`Uploading ${files.length} files to Cloudinary...`);
    for (const file of files) {
      const filePath = path.join(uploadsFolder, file);
      await uploadFile(filePath);
    }
    console.log("All files uploaded successfully!");
  } catch (error) {
    console.error("Error reading uploads folder:", error);
  }
};

uploadAllFiles();
