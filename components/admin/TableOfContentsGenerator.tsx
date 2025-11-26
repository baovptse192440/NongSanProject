"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { List, RefreshCw, Eye, Edit2, Check, X, ChevronRight, Sparkles, BookOpen } from "lucide-react";

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsGeneratorProps {
  content: string;
  value: string;
  onChange: (toc: string) => void;
}

export default function TableOfContentsGenerator({
  content,
  value,
  onChange,
}: TableOfContentsGeneratorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [manualToc, setManualToc] = useState(value || "");
  const prevValueRef = useRef(value);

  // Extract headings from content
  const headings = useMemo(() => {
    if (!content) return [];

    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    const foundHeadings: Heading[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      const text = match[2].replace(/<[^>]*>/g, "").trim();
      if (text) {
        const id = text
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        foundHeadings.push({ level, text, id });
      }
    }

    return foundHeadings;
  }, [content]);

  // Generate TOC HTML from headings
  const generateTocHtml = (headingsList: Heading[]): string => {
    if (headingsList.length === 0) return "";

    let tocHtml = '<div class="table-of-contents"><h3>Mục lục</h3><ul>';
    let currentLevel = 0;

    headingsList.forEach((heading) => {
      // Close previous list items if going to a higher level
      if (heading.level > currentLevel) {
        for (let i = currentLevel; i < heading.level; i++) {
          tocHtml += "<ul>";
        }
      }
      // Close list items if going to a lower level
      else if (heading.level < currentLevel) {
        for (let i = heading.level; i < currentLevel; i++) {
          tocHtml += "</ul></li>";
        }
      } else if (currentLevel > 0) {
        tocHtml += "</li>";
      }

      tocHtml += `<li><a href="#${heading.id}">${heading.text}</a>`;
      currentLevel = heading.level;
    });

    // Close remaining list items
    for (let i = 0; i < currentLevel; i++) {
      tocHtml += "</li></ul>";
    }

    tocHtml += "</ul></div>";
    return tocHtml;
  };

  // Auto-generate TOC when content changes
  useEffect(() => {
    if (headings.length > 0 && !value) {
      const generated = generateTocHtml(headings);
      onChange(generated);
    }
  }, [headings, value, onChange]);

  // Calculate current TOC value
  const currentToc = useMemo(() => {
    return value || (headings.length > 0 ? generateTocHtml(headings) : "");
  }, [value, headings]);

  // Sync manualToc with value when value changes externally (not from user edit)
  // This is a valid pattern for syncing local state with props
  useEffect(() => {
    // Only update if value changed externally (not from our onChange)
    if (prevValueRef.current !== value && isPreviewMode) {
      // eslint-disable-next-line react-compiler/react-compiler
      setManualToc(currentToc);
      prevValueRef.current = value;
    }
  }, [value, currentToc, isPreviewMode]);

  const handleRegenerate = () => {
    const generated = generateTocHtml(headings);
    onChange(generated);
    setManualToc(generated);
  };

  const handleManualEdit = () => {
    setIsPreviewMode(false);
  };

  const handleSaveManual = () => {
    onChange(manualToc);
    setIsPreviewMode(true);
  };

  const handleCancelManual = () => {
    setManualToc(value);
    setIsPreviewMode(true);
  };

  if (headings.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <List className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900 mb-1">
              Chưa có tiêu đề trong nội dung
            </p>
            <p className="text-xs text-amber-700">
              Thêm các thẻ heading (H1-H6) vào nội dung để tự động tạo mục lục
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <BookOpen className="h-5 w-5 text-[#0a923c]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              Mục lục
              <Sparkles className="h-4 w-4 text-amber-500" />
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Tự động tạo từ các tiêu đề trong nội dung
            </p>
          </div>
          <span className="ml-2 px-3 py-1 bg-white text-green-700 text-xs font-semibold rounded-full border border-green-200 shadow-sm">
            {headings.length} mục
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isPreviewMode ? (
            <>
              <button
                type="button"
                onClick={handleRegenerate}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#0a923c] bg-white hover:bg-green-50 border border-green-200 rounded-lg transition-all shadow-sm hover:shadow-md"
                title="Tạo lại mục lục từ nội dung"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Tạo lại
              </button>
              <button
                type="button"
                onClick={handleManualEdit}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all shadow-sm hover:shadow-md"
                title="Chỉnh sửa HTML mục lục"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Chỉnh sửa
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSaveManual}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-[#0a923c] hover:bg-[#0d7a33] rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                <Check className="h-3.5 w-3.5" />
                Lưu
              </button>
              <button
                type="button"
                onClick={handleCancelManual}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                <X className="h-3.5 w-3.5" />
                Hủy
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview Mode */}
      {isPreviewMode ? (
        <div className="bg-gradient-to-br from-white to-gray-50/50 border-2 border-gray-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Eye className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Xem trước mục lục</span>
          </div>
          
          {/* TOC Preview */}
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-100 shadow-inner">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: value || generateTocHtml(headings) }}
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            />
          </div>

          {/* Headings List - Visual Tree */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <List className="h-4 w-4 text-gray-500" />
              <p className="text-sm font-semibold text-gray-700">Cấu trúc tiêu đề ({headings.length} mục):</p>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {headings.map((heading, index) => {
                const indentLevel = heading.level - 1;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 text-sm text-gray-700 hover:bg-green-50/50 p-2.5 rounded-lg transition-all group border border-transparent hover:border-green-100"
                    style={{ paddingLeft: `${1 + indentLevel * 1.5}rem` }}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                        heading.level === 1
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                          : heading.level === 2
                          ? "bg-gradient-to-br from-green-500 to-green-600 text-white"
                          : heading.level === 3
                          ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white"
                          : heading.level === 4
                          ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                          : "bg-gradient-to-br from-gray-500 to-gray-600 text-white"
                      }`}
                    >
                      H{heading.level}
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0 group-hover:text-green-600 transition-colors" />
                    <span className="flex-1 font-medium group-hover:text-green-700 transition-colors">
                      {heading.text}
                    </span>
                    <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                      #{heading.id}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Chỉnh sửa HTML mục lục
          </label>
          <textarea
            value={manualToc}
            onChange={(e) => setManualToc(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] transition-all font-mono resize-none"
            placeholder="Nhập HTML cho mục lục..."
          />
          <p className="text-xs text-gray-500">
            Bạn có thể chỉnh sửa HTML trực tiếp. Đảm bảo các liên kết anchor khớp với ID trong nội dung.
          </p>
        </div>
      )}

      {/* Styles for TOC preview */}
      <style jsx>{`
        :global(.table-of-contents) {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        :global(.table-of-contents h3) {
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
          letter-spacing: -0.01em;
        }
        :global(.table-of-contents ul) {
          list-style: none;
          padding-left: 0;
          margin: 0;
        }
        :global(.table-of-contents ul ul) {
          padding-left: 1.5rem;
          margin-top: 0.5rem;
        }
        :global(.table-of-contents li) {
          margin-bottom: 0.625rem;
          position: relative;
        }
        :global(.table-of-contents a) {
          color: #0a923c;
          text-decoration: none;
          font-size: 0.875rem;
          line-height: 1.7;
          transition: all 0.2s ease;
          display: block;
          padding: 0.375rem 0.5rem;
          border-radius: 0.375rem;
          margin-left: -0.5rem;
        }
        :global(.table-of-contents a:hover) {
          color: #0d7a33;
          background-color: #f0fdf4;
          text-decoration: none;
          transform: translateX(4px);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

