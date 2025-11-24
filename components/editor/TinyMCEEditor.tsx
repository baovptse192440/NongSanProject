"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
}

// Dynamic import để tránh lỗi khi package chưa được cài đặt
const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] border border-gray-200 rounded-md bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-2">Đang tải editor...</div>
          <div className="text-xs text-gray-400">
            Nếu lỗi vẫn tiếp tục, vui lòng chạy: npm install
          </div>
        </div>
      </div>
    )
  }
);

export default function TinyMCEEditor({
  value,
  onChange,
  height = 400,
  placeholder = "Nhập nội dung...",
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  // Normalize value - fix image URLs that might have /admin/ prefix
  const normalizeValue = (content: string): string => {
    if (!content) return content;
    // Replace /admin/uploads/editor/ with /uploads/editor/
    let normalized = content.replace(/\/admin\/uploads\/editor\//g, "/uploads/editor/");
    // Fix URLs in img src attributes (both single and double quotes)
    normalized = normalized.replace(/src=["']\/admin\/uploads\/editor\//g, 'src="/uploads/editor/');
    // Ensure relative URLs for editor images start with /
    normalized = normalized.replace(/src=["']uploads\/editor\//g, 'src="/uploads/editor/');
    return normalized;
  };

  const normalizedValue = normalizeValue(value);

  // Update editor content when value changes
  useEffect(() => {
    if (editorRef.current && normalizedValue !== editorRef.current.getContent()) {
      editorRef.current.setContent(normalizedValue);
    }
  }, [normalizedValue]);

  useEffect(() => {
    setMounted(true);
    // Load TinyMCE 5 và plugins từ node_modules (local)
    if (typeof window !== "undefined") {
      // Load theme (TinyMCE 5 sử dụng theme khác)
      import("tinymce/themes/silver").catch(() => {});
      
      // Load icons
      import("tinymce/icons/default").catch(() => {});
      
      // Load plugins cho TinyMCE 5
      Promise.all([
        import("tinymce/plugins/advlist").catch(() => {}),
        import("tinymce/plugins/autolink").catch(() => {}),
        import("tinymce/plugins/lists").catch(() => {}),
        import("tinymce/plugins/link").catch(() => {}),
        import("tinymce/plugins/image").catch(() => {}),
        import("tinymce/plugins/charmap").catch(() => {}),
        import("tinymce/plugins/preview").catch(() => {}),
        import("tinymce/plugins/anchor").catch(() => {}),
        import("tinymce/plugins/searchreplace").catch(() => {}),
        import("tinymce/plugins/visualblocks").catch(() => {}),
        import("tinymce/plugins/code").catch(() => {}),
        import("tinymce/plugins/fullscreen").catch(() => {}),
        import("tinymce/plugins/insertdatetime").catch(() => {}),
        import("tinymce/plugins/media").catch(() => {}),
        import("tinymce/plugins/table").catch(() => {}),
        import("tinymce/plugins/help").catch(() => {}),
        import("tinymce/plugins/wordcount").catch(() => {}),
      ]).catch(() => {});
    }
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] border border-gray-200 rounded-md bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="tinymce-wrapper">
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        onInit={(evt, editor) => {
          editorRef.current = editor;
          
          // Fix URLs in editor after initialization
          setTimeout(() => {
            const content = editor.getContent();
            // Check if content has wrong URLs
            if (content && content.includes('/admin/uploads/editor/')) {
              const fixedContent = normalizeValue(content);
              if (fixedContent !== content) {
                editor.setContent(fixedContent, { format: 'raw' });
              }
            }
            
            // Also set initial normalized value
            if (normalizedValue && normalizedValue !== content) {
              editor.setContent(normalizedValue, { format: 'raw' });
            }
          }, 300);
          
          // Listen for content changes and fix URLs
          editor.on("SetContent", () => {
            setTimeout(() => {
              const content = editor.getContent();
              if (content && content.includes('/admin/uploads/editor/')) {
                const fixedContent = normalizeValue(content);
                if (fixedContent !== content) {
                  editor.setContent(fixedContent, { format: 'raw' });
                }
              }
            }, 50);
          });
        }}
        value={normalizedValue}
        onEditorChange={(content) => {
          // Normalize content before calling onChange
          const normalized = normalizeValue(content);
          onChange(normalized);
        }}
        init={{
          height: height,
          menubar: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help | link image",
          content_style:
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; }",
          placeholder: placeholder,
          branding: false,
          resize: true,
          skin: "oxide",
          // Image upload settings
          automatic_uploads: false, // Tắt để dùng file_picker_callback
          file_picker_types: "image",
          image_advtab: true,
          image_caption: true,
          image_title: true,
          image_dimensions: true,
          // URL handling - giữ nguyên relative URLs, không tự động thêm prefix
          relative_urls: true, // Cho phép relative URLs
          remove_script_host: true, // Bỏ host, chỉ giữ path
          convert_urls: true, // Bật convert nhưng với base_url là root
          // Set base URL là root để URLs không bị thêm /admin/ prefix
          document_base_url: typeof window !== "undefined" ? window.location.origin + "/" : "/",
          // File picker callback - handle image upload manually (không bị loading hoài)
          file_picker_callback: function(callback: any, value: string, meta: any) {
            if (meta.filetype === "image") {
              const input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", "image/*");
              
              input.onchange = function(e: any) {
                const file = e.target.files[0];
                if (!file) return;
                
                const formData = new FormData();
                formData.append("file", file);
                
                // Show loading
                console.log("Uploading file:", file.name);
                
                fetch("/api/editor/upload", {
                  method: "POST",
                  body: formData,
                })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error("Upload failed: " + response.status);
                  }
                  return response.json();
                })
                .then((data) => {
                  console.log("Upload response:", data);
                  if (data.location && typeof data.location === "string") {
                    // Call callback với URL string - TinyMCE sẽ insert image
                    callback(data.location, { alt: file.name });
                    console.log("Image inserted with URL:", data.location);
                  } else {
                    console.error("Invalid response:", data);
                    alert("Upload thất bại: Response không hợp lệ");
                  }
                })
                .catch((error) => {
                  console.error("Upload error:", error);
                  alert("Lỗi upload: " + error.message);
                });
              };
              
              input.click();
            }
          },
        }}
      />
      <style jsx global>{`
        .tinymce-wrapper .tox-tinymce {
          border: 1px solid #e5e7eb !important;
          border-radius: 0.375rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .tinymce-wrapper .tox-tinymce:focus-within {
          border-color: #0a923c !important;
          box-shadow: 0 0 0 3px rgba(10, 146, 60, 0.1) !important;
        }
        .tinymce-wrapper .tox .tox-edit-area__iframe {
          background-color: #fff;
        }
        .tinymce-wrapper .tox-toolbar {
          background-color: #fafafa;
          border-bottom: 1px solid #e5e7eb;
        }
        .tinymce-wrapper .tox-statusbar {
          border-top: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
}
