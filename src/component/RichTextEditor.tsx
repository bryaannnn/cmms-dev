import "../index.css";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Link from "@tiptap/extension-link";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import React, { useState } from "react";

// Import ikon Lucide React
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  RemoveFormatting,
  Trash2,
  Link as LinkIcon,
  Palette,
  Type,
  PaintBucket,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

// Di file TiptapEditor.tsx, update extensions configuration
const extensions = [
  TextStyleKit,
  StarterKit.configure({
    // Nonaktifkan sanitization untuk mempertahankan semua styling
    bold: {
      HTMLAttributes: {
        class: "font-bold",
      },
    },
    italic: {
      HTMLAttributes: {
        class: "italic",
      },
    },
    strike: {
      HTMLAttributes: {
        class: "line-through",
      },
    },
    underline: {
      HTMLAttributes: {
        class: "underline",
      },
    },
  }),
  Color.configure({
    types: ["textStyle"],
  }),
  Highlight.configure({
    multicolor: true,
  }),
  FontFamily.configure({
    types: ["textStyle"],
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-blue-500 underline hover:text-blue-700 cursor-pointer",
    },
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right", "justify"],
  }),
];

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface LinkModalProps {
  editor: Editor;
  onClose: () => void;
}

const LinkModal: React.FC<LinkModalProps> = ({ editor, onClose }) => {
  const [url, setUrl] = useState(() => {
    const previousUrl = editor.getAttributes("link").href;
    return previousUrl || "";
  });

  // PERBAIKAN: Simpan selection saat modal terbuka
  const [selection, setSelection] = useState(() => {
    return { from: editor.state.selection.from, to: editor.state.selection.to };
  });

  // PERBAIKAN: Dapatkan selected text dengan lebih reliable
  const [text, setText] = useState(() => {
    try {
      const { from, to } = editor.state.selection;
      if (from === to) {
        // Tidak ada teks yang dipilih, return empty string
        return "";
      }
      const selectedText = editor.state.doc.textBetween(from, to);
      return selectedText || "";
    } catch {
      return "";
    }
  });

  const saveLink = () => {
    // PERBAIKAN: Restore selection terlebih dahulu
    editor.chain().focus().setTextSelection(selection).run();

    if (url) {
      // Jika ada teks yang dipilih, gunakan teks tersebut
      if (text) {
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      } else {
        // Jika tidak ada teks yang dipilih, insert link dengan teks dari input
        editor
          .chain()
          .focus()
          .insertContent({
            type: "text",
            text: text || url, // Gunakan teks dari input atau URL sebagai fallback
            marks: [
              {
                type: "link",
                attrs: { href: url },
              },
            ],
          })
          .run();
      }
    } else {
      editor.chain().focus().unsetLink().run();
    }
    onClose();
  };

  const removeLink = () => {
    // PERBAIKAN: Restore selection sebelum remove
    editor.chain().focus().setTextSelection(selection).run();
    editor.chain().focus().unsetLink().run();
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Add/Edit Link</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus // PERBAIKAN: Auto focus ke input URL
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text {!text && <span className="text-orange-500">(required if no text selected)</span>}</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={text || "Enter link text"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {!text && <p className="text-xs text-gray-500 mt-1">No text selected. Enter text above or select text first.</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
            Cancel
          </button>
          {editor.getAttributes("link").href && (
            <button onClick={removeLink} className="px-4 py-2 text-sm text-red-600 hover:text-red-800 transition-colors">
              Remove Link
            </button>
          )}
          <button
            onClick={saveLink}
            disabled={!url} // PERBAIKAN: Disable jika URL kosong
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Link
          </button>
        </div>
      </div>
    </div>
  );
};

interface ColorPickerProps {
  editor: Editor;
  type: "color" | "backgroundColor";
  onClose: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ editor, type, onClose }) => {
  const colors = ["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#008000", "#800000", "#008080", "#000080", "#808080", "#FFE4E1", "#F0FFF0", "#F0F8FF", "#FFF8DC", "#F5F5F5"];

  // PERBAIKAN: Ambil current color berdasarkan type
  const currentColor = type === "color" ? editor.getAttributes("textStyle").color : editor.getAttributes("highlight").color;

  const setColor = (color: string) => {
    if (type === "color") {
      // Untuk text color
      editor.chain().focus().setColor(color).run();
    } else {
      // Untuk background color menggunakan highlight
      editor.chain().focus().setHighlight({ color }).run();
    }
    onClose();
  };

  const removeColor = () => {
    if (type === "color") {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().unsetHighlight().run();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80">
        <h3 className="text-lg font-semibold mb-4">{type === "color" ? "Text Color" : "Background Color"}</h3>

        <div className="grid grid-cols-5 gap-2 mb-4">
          {colors.map((color) => (
            <button key={color} onClick={() => setColor(color)} className={`w-8 h-8 rounded border border-gray-300 ${currentColor === color ? "ring-2 ring-blue-500" : ""}`} style={{ backgroundColor: color }} title={color} />
          ))}
        </div>

        <div className="flex justify-between">
          <button onClick={removeColor} className="px-4 py-2 text-sm text-red-600 hover:text-red-800 transition-colors">
            Remove Color
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function MenuBar({ editor }: { editor: Editor | null }) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<"color" | "backgroundColor" | null>(null);
  const [showFontPicker, setShowFontPicker] = useState(false);

  if (!editor) {
    return null;
  }

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive("bold") ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive("italic") ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive("strike") ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isCode: ctx.editor.isActive("code") ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
        isLink: ctx.editor.isActive("link") ?? false,
        currentColor: ctx.editor.getAttributes("textStyle").color,
        currentBackgroundColor: ctx.editor.getAttributes("highlight").color,
        currentFontFamily: ctx.editor.getAttributes("textStyle").fontFamily,
        // Tambahkan state untuk alignment
        isAlignLeft: ctx.editor.isActive({ textAlign: "left" }) ?? false,
        isAlignCenter: ctx.editor.isActive({ textAlign: "center" }) ?? false,
        isAlignRight: ctx.editor.isActive({ textAlign: "right" }) ?? false,
        isAlignJustify: ctx.editor.isActive({ textAlign: "justify" }) ?? false,
        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
        isParagraph: ctx.editor.isActive("paragraph") ?? false,
        isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
        isBulletList: ctx.editor.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor.isActive("orderedList") ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      };
    },
  });

  const fonts = ["Arial, sans-serif", "Georgia, serif", "Times New Roman, serif", "Helvetica, sans-serif", "Courier New, monospace", "Verdana, sans-serif", "Trebuchet MS, sans-serif", "Comic Sans MS, cursive"];

  return (
    <>
      <div className="border-b border-gray-200 bg-gray-50 p-2 sm:p-3">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 sm:gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editorState.canBold}
              className={`p-2 text-sm rounded border transition-colors flex items-center justify-center ${editorState.isBold ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              title="Bold"
            >
              <Bold size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editorState.canItalic}
              className={`p-2 text-sm rounded border transition-colors flex items-center justify-center ${editorState.isItalic ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              title="Italic"
            >
              <Italic size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editorState.canStrike}
              className={`p-2 text-sm rounded border transition-colors flex items-center justify-center ${editorState.isStrike ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              title="Strikethrough"
            >
              <Strikethrough size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={!editorState.canCode}
              className={`p-2 text-sm rounded border transition-colors flex items-center justify-center ${editorState.isCode ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              title="Code"
            >
              <Code size={18} />
            </button>
          </div>
          {/* Separator */}
          <div className="w-px bg-gray-300 mx-1"></div>
          {/* Text Alignment - TAMBAHKAN BAGIAN INI */}
          <div className="flex items-center gap-1 sm:gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`p-2 text-sm rounded border transition-colors flex items-center justify-center ${editorState.isAlignLeft ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              title="Align Left"
            >
              <AlignLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`p-2 text-sm rounded border transition-colors flex items-center justify-center ${editorState.isAlignCenter ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              title="Align Center"
            >
              <AlignCenter size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`p-2 text-sm rounded border transition-colors flex items-center justify-center ${editorState.isAlignRight ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              title="Align Right"
            >
              <AlignRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              className={`p-2 text-sm rounded border transition-colors flex items-center justify-center ${editorState.isAlignJustify ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              title="Justify"
            >
              <AlignJustify size={18} />
            </button>
          </div>
          {/* Separator */}
          <div className="w-px bg-gray-300 mx-1"></div>
          {/* Colors */}
          <div className="flex items-center gap-1 sm:gap-1">
            <button
              type="button"
              onClick={() => setShowColorPicker("color")}
              className="p-2 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center relative"
              title="Text Color"
            >
              <Palette size={18} />
              {editorState.currentColor && <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white" style={{ backgroundColor: editorState.currentColor }} />}
            </button>
            <button
              type="button"
              onClick={() => setShowColorPicker("backgroundColor")}
              className="p-2 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center relative"
              title="Background Color"
            >
              <PaintBucket size={18} />
              {editorState.currentBackgroundColor && <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white" style={{ backgroundColor: editorState.currentBackgroundColor }} />}
            </button>
          </div>
          {/* Separator */}
          <div className="w-px bg-gray-300 mx-1"></div>
          {/* Font Family */}
          <div className="flex items-center gap-1 sm:gap-1 relative">
            <button
              type="button"
              onClick={() => setShowFontPicker(!showFontPicker)}
              className="p-2 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
              title="Font Family"
            >
              <Type size={18} />
            </button>

            {showFontPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 w-48">
                {fonts.map((font) => (
                  <button
                    key={font}
                    onClick={() => {
                      editor.chain().focus().setFontFamily(font).run();
                      setShowFontPicker(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                    style={{ fontFamily: font }}
                  >
                    {font.split(",")[0]}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetFontFamily().run();
                    setShowFontPicker(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-red-600"
                >
                  Reset Font
                </button>
              </div>
            )}
          </div>
          {/* Separator */}
          <div className="w-px bg-gray-300 mx-1"></div>
          {/* Link */}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              // Langsung buka modal tanpa pengecekan
              setShowLinkModal(true);
            }}
            className={`p-2 text-sm rounded border transition-colors flex items-center justify-center ${editorState.isLink ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
            title="Insert Link"
          >
            <LinkIcon size={18} />
          </button>
          {/* Separator */}
          <div className="w-px bg-gray-300 mx-1"></div>
          {/* Clear Formatting */}
          <div className="flex items-center gap-1 sm:gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
              className="p-2 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
              title="Clear formatting"
            >
              <RemoveFormatting size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().clearNodes().run()}
              className="p-2 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
              title="Clear nodes"
            >
              <Trash2 size={18} />
            </button>
          </div>
          {/* Separator */}
          <div className="w-px bg-gray-300 mx-1"></div>
          {/* Headings & Paragraph */}
          <div className="flex items-center gap-1 sm:gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`p-2 text-sm rounded border transition-colors flex items-center justify-center ${editorState.isParagraph ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              title="Paragraph"
            >
              <Pilcrow size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 text-sm rounded border transition-colors flex items-center justify-center ${editorState.isHeading1 ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              title="Heading 1"
            >
              <Heading1 size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 text-sm rounded border transition-colors flex items-center justify-center ${editorState.isHeading2 ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              title="Heading 2"
            >
              <Heading2 size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 text-sm rounded border transition-colors flex items-center justify-center ${editorState.isHeading3 ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              title="Heading 3"
            >
              <Heading3 size={18} />
            </button>
          </div>
          {/* Separator */}
          <div className="w-px bg-gray-300 mx-1"></div>
          {/* Lists */}
          <div className="flex items-center gap-1 sm:gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 text-sm rounded border transition-colors flex items-center justify-center ${editorState.isBulletList ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              title="Bullet List"
            >
              <List size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 text-sm rounded border transition-colors flex items-center justify-center ${editorState.isOrderedList ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              title="Ordered List"
            >
              <ListOrdered size={18} />
            </button>
          </div>
          {/* Separator */}
          <div className="w-px bg-gray-300 mx-1"></div>
          {/* History */}
          <div className="flex items-center gap-1 sm:gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editorState.canUndo}
              className="p-2 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              title="Undo"
            >
              <Undo2 size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editorState.canRedo}
              className="p-2 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              title="Redo"
            >
              <Redo2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showLinkModal && <LinkModal editor={editor} onClose={() => setShowLinkModal(false)} />}

      {showColorPicker && <ColorPicker editor={editor} type={showColorPicker} onClose={() => setShowColorPicker(null)} />}
    </>
  );
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ value, onChange }) => {
  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // HTML akan tetap utuh dengan semua styling
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor min-h-[120px] p-4 prose max-w-none focus:outline-none",
      },
      // Tambahkan transformPastedHTML untuk mempertahankan styling dari copy-paste
      transformPastedHTML(html) {
        return html;
      },
    },
    // Nonaktifkan transform yang tidak diinginkan
    parseOptions: {
      preserveWhitespace: "full",
    },
  });

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 min-h-[120px] bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white transition-all duration-200">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="min-h-[120px]" />
    </div>
  );
};

export default TiptapEditor;
