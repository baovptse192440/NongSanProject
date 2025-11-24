const fs = require('fs');
const path = require('path');

// Đường dẫn nguồn và đích
const sourceDir = path.join(__dirname, '../node_modules/tinymce');
const destDir = path.join(__dirname, '../public/tinymce');

// Hàm copy thư mục
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory does not exist: ${src}`);
    return;
  }

  // Tạo thư mục đích nếu chưa tồn tại
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Đọc các files và folders trong src
  const entries = fs.readdirSync(src, { withFileTypes: true });

  entries.forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Bỏ qua thư mục tests, demos, docs để giảm kích thước
      if (['tests', 'demos', 'docs', 'spec', '.github'].includes(entry.name)) {
        return;
      }
      copyDir(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Copy TinyMCE
console.log('Copying TinyMCE to public folder...');
copyDir(sourceDir, destDir);
console.log('TinyMCE copied successfully!');

