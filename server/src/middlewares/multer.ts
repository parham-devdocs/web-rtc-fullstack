import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure base uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'others';
    
    // Determine folder based on file type
    if (file.mimetype.startsWith('image/')) {
      folder = 'images';
    } else if (file.mimetype.startsWith('audio/')) {
      folder = 'voices';  // or 'audio'
    } else if (file.mimetype === 'application/pdf') {
      folder = 'documents';
    } else if (file.mimetype.includes('word') || file.mimetype.includes('document')) {
      folder = 'documents';
    }
    
    const targetPath = path.join(uploadDir, folder);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
      console.log(`📁 Created folder: ${targetPath}`);
    }
    
    console.log(`Saving ${file.mimetype} to: ${folder}`);
    cb(null, targetPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix+ext);
  }
});

const upload = multer({ storage: storage });

export default upload;