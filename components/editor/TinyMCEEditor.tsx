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
      
      // Load plugins cho TinyMCE 5 - Full features
      Promise.all([
        import("tinymce/plugins/advlist").catch(() => {}),
        import("tinymce/plugins/anchor").catch(() => {}),
        import("tinymce/plugins/autolink").catch(() => {}),
        import("tinymce/plugins/autoresize").catch(() => {}),
        import("tinymce/plugins/charmap").catch(() => {}),
        import("tinymce/plugins/code").catch(() => {}),
        import("tinymce/plugins/codesample").catch(() => {}),
        import("tinymce/plugins/directionality").catch(() => {}),
        import("tinymce/plugins/emoticons").catch(() => {}),
        import("tinymce/plugins/fullscreen").catch(() => {}),
        import("tinymce/plugins/help").catch(() => {}),
        import("tinymce/plugins/image").catch(() => {}),
        import("tinymce/plugins/importcss").catch(() => {}),
        import("tinymce/plugins/insertdatetime").catch(() => {}),
        import("tinymce/plugins/link").catch(() => {}),
        import("tinymce/plugins/lists").catch(() => {}),
        import("tinymce/plugins/media").catch(() => {}),
        import("tinymce/plugins/nonbreaking").catch(() => {}),
        import("tinymce/plugins/pagebreak").catch(() => {}),
        import("tinymce/plugins/preview").catch(() => {}),
        import("tinymce/plugins/quickbars").catch(() => {}),
        import("tinymce/plugins/save").catch(() => {}),
        import("tinymce/plugins/searchreplace").catch(() => {}),
        import("tinymce/plugins/table").catch(() => {}),
        import("tinymce/plugins/template").catch(() => {}),
        import("tinymce/plugins/visualblocks").catch(() => {}),
        import("tinymce/plugins/visualchars").catch(() => {}),
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
          menubar: "file edit view insert format tools table help",
          plugins: [
            "advlist",
            "anchor",
            "autolink",
            "autoresize",
            "charmap",
            "code",
            "codesample",
            "directionality",
            "emoticons",
            "fullscreen",
            "help",
            "image",
            "importcss",
            "insertdatetime",
            "link",
            "lists",
            "media",
            "nonbreaking",
            "pagebreak",
            "preview",
            "quickbars",
            "save",
            "searchreplace",
            "table",
            "template",
            "visualblocks",
            "visualchars",
            "wordcount",
          ],
          toolbar: [
            "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent | link image media table codesample | charmap emoticons | code fullscreen preview | save print | help"
          ],
          toolbar_mode: "sliding",
          content_style:
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; }",
          placeholder: placeholder,
          branding: false,
          resize: true,
          skin: "oxide",
          // Font options
          font_family_formats: "Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats",
          font_size_formats: "8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt",
          // Block formats
          block_formats: "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre",
          // Color options
          color_map: [
            "000000", "Black",
            "993300", "Burnt orange",
            "333300", "Dark olive",
            "003300", "Dark green",
            "003366", "Dark azure",
            "000080", "Navy Blue",
            "333399", "Indigo",
            "333333", "Very dark gray",
            "800000", "Maroon",
            "FF6600", "Orange",
            "808000", "Olive",
            "008000", "Green",
            "008080", "Teal",
            "0000FF", "Blue",
            "666699", "Gray-blue",
            "808080", "Gray",
            "FF0000", "Red",
            "FF9900", "Amber",
            "99CC00", "Yellow green",
            "339966", "Sea green",
            "33CCCC", "Turquoise",
            "3366FF", "Royal blue",
            "800080", "Purple",
            "999999", "Medium gray",
            "FF00FF", "Magenta",
            "FFCC00", "Gold",
            "FFFF00", "Yellow",
            "00FF00", "Lime",
            "00FFFF", "Aqua",
            "00CCFF", "Sky blue",
            "993366", "Red violet",
            "FFFFFF", "White",
            "FF99CC", "Pink",
            "FFCC99", "Peach",
            "FFFF99", "Light yellow",
            "CCFFCC", "Light green",
            "CCFFFF", "Light cyan",
            "99CCFF", "Light blue",
            "CC99FF", "Plum"
          ],
          // Table options
          table_toolbar: "tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol",
          table_resize_bars: true,
          table_default_attributes: {
            border: "1"
          },
          table_default_styles: {
            "border-collapse": "collapse",
            "width": "100%"
          },
          // Image options
          image_advtab: true,
          image_caption: true,
          image_title: true,
          image_dimensions: true,
          image_class_list: [
            { title: "None", value: "" },
            { title: "Responsive", value: "img-responsive" },
            { title: "Rounded", value: "img-rounded" },
            { title: "Circle", value: "img-circle" }
          ],
          // Link options
          link_assume_external_targets: true,
          link_context_toolbar: true,
          link_title: true,
          // Code sample
          codesample_languages: [
            { text: "HTML/XML", value: "markup" },
            { text: "JavaScript", value: "javascript" },
            { text: "CSS", value: "css" },
            { text: "PHP", value: "php" },
            { text: "Ruby", value: "ruby" },
            { text: "Python", value: "python" },
            { text: "Java", value: "java" },
            { text: "C", value: "c" },
            { text: "C#", value: "csharp" },
            { text: "C++", value: "cpp" }
          ],
          // Template
          templates: [
            {
              title: "Two Column Layout",
              description: "A two column layout with header and footer",
              content: '<div class="row"><div class="col-6"><p>Column 1</p></div><div class="col-6"><p>Column 2</p></div></div>'
            },
            {
              title: "Article Template",
              description: "A simple article template",
              content: '<article><h1>Article Title</h1><p>Article content goes here...</p></article>'
            }
          ],
          // Quickbars
          quickbars_selection_toolbar: "bold italic | quicklink quickimage quicktable",
          quickbars_insert_toolbar: "quickimage quicktable",
          // Autoresize
          autoresize_bottom_margin: 50,
          autoresize_max_height: 800,
          autoresize_min_height: 200,
          // Visual blocks
          visualblocks_default_state: false,
          visualchars_default_state: false,
          // Word count
          wordcount_countregex: /[\w\u2019\'-]+/g,
          // Save
          save_onsavecallback: function() {
            console.log("Save triggered");
          },
          // Print
          print: {
            stylesheets: ["/css/print.css"]
          },
          // Image upload settings
          automatic_uploads: false, // Tắt để dùng file_picker_callback
          file_picker_types: "image",
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
