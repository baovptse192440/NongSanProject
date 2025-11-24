@echo off
echo Installing TinyMCE packages (latest versions)...
call npm install @tinymce/tinymce-react tinymce --save
echo.
echo Copying TinyMCE to public folder...
if exist node_modules\tinymce (
    call node scripts/copy-tinymce.js
    echo.
    echo Installation complete!
) else (
    echo.
    echo Error: TinyMCE packages not found. Please check npm installation.
)
pause
