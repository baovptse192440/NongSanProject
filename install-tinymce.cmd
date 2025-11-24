@echo off
echo Installing TinyMCE packages...
npm install @tinymce/tinymce-react tinymce --save
echo.
echo Copying TinyMCE to public folder...
node scripts/copy-tinymce.js
echo.
echo Installation complete!
pause

