import React, { useRef, useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Strikethrough, // Menambahkan Strikethrough untuk kelengkapan
  Link, // Menambahkan Link
  Palette, // Untuk Warna Teks
  PaintBucket, // Ikon untuk Warna Latar Belakang Teks
  ChevronDown,
  Check,
  X,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Warna yang diminta user: Merah, Kuning, Hijau
const CUSTOM_COLORS = [
  // Baris 1: Grayscale & Primary
  { name: "Hitam", code: "#000000" },
  { name: "Abu Gelap", code: "#4B5563" },
  { name: "Merah", code: "#EF4444" },
  { name: "Oranye", code: "#F97316" },

  // Baris 2: Warm Tones
  { name: "Kuning", code: "#FACC15" },
  { name: "Hijau", code: "#22C55E" },
  { name: "Teal", code: "#14B8A6" },
  { name: "Biru", code: "#3B82F6" },

  // Baris 3: Cool/Secondary Tones
  { name: "Indigo", code: "#6366F1" },
  { name: "Ungu", code: "#8B5CF6" },
  { name: "Pink", code: "#EC4899" },
  { name: "Coklat", code: "#A52A2A" },

  // Baris 4: Light Tones & Reset
  { name: "Abu Muda", code: "#E5E7EB" },
  { name: "Navy", code: "#000080" },
  { name: "Putih", code: "#FFFFFF", isLight: true }, // Hanya untuk preview
  { name: "Hapus", code: "transparent", isNormal: true }, // Opsi untuk menghapus warna
];

// Fungsi pembantu untuk memeriksa apakah perintah sedang aktif
const isCommandActive = (command: string): boolean => {
  try {
    return document.queryCommandState(command);
  } catch (e) {
    return false;
  }
};

interface LinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (url: string) => void;
  onRemove: () => void;
}

const LinkDialog: React.FC<LinkDialogProps> = ({ isOpen, onClose, onApply, onRemove }) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Default value saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setUrl("https://");
      setError("");
      // Fokus otomatis
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleApply = () => {
    if (!url || url.trim() === "https://" || url.trim() === "http://" || url.trim() === "") {
      setError("URL tidak boleh kosong. Masukkan tautan yang valid.");
      return;
    }
    onApply(url);
    onClose();
  };

  const handleRemove = () => {
    onRemove();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-30 z-30 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 
                            transform transition-all scale-100 ring-4 ring-white/5"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Tambahkan Tautan</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition" aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="link-url" className="block text-sm font-semibold text-gray-700 mb-2">
            Alamat Web (URL)
          </label>
          <input
            ref={inputRef}
            id="link-url"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Contoh: https://gemini.google.com"
            className={`w-full p-3 border ${error ? "border-red-500" : "border-gray-300"} 
                                    rounded-lg focus:ring-blue-500 focus:border-blue-500 
                                    transition duration-150 shadow-sm text-gray-800`}
          />

          {error && <p className="mt-2 text-sm text-red-700 font-medium bg-red-100 border border-red-300 p-2 rounded-lg transition-opacity duration-300">{error}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          {/* Tombol Hapus: Hanya muncul jika ada konten */}
          {url && url.length > 0 && url !== "https://" && (
            <button type="button" onClick={handleRemove} className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 bg-white rounded-lg hover:bg-red-50 transition-colors shadow-sm">
              Hapus Tautan
            </button>
          )}

          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg 
                                   hover:bg-blue-700 transition-colors shadow-md flex items-center"
          >
            <Check size={16} className="mr-1" /> Terapkan
          </button>
        </div>
      </div>
    </div>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const highlightDropdownRef = useRef<HTMLDivElement>(null); // Ref baru untuk dropdown highlight

  const selectionRef = useRef<Selection | null>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  // Gunakan state untuk melacak status aktif tombol (diperlukan untuk UI)
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isHighlightDropdownOpen, setIsHighlightDropdownOpen] = useState(false); // State baru

  // 1. Inisialisasi contentEditable dengan nilai awal (hanya sekali saat mount)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML === "") {
      // Atur nilai awal dari props
      editorRef.current.innerHTML = value;
    }
  }, []); // Hanya jalankan sekali saat mount

  // 2. Jika nilai props berubah dari luar, update editor (misalnya saat reset form)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Efek untuk menutup dropdown warna/highlight saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
        setIsColorDropdownOpen(false);
      }
      if (highlightDropdownRef.current && !highlightDropdownRef.current.contains(event.target as Node)) {
        setIsHighlightDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle input changes
  const handleInput = () => {
    if (editorRef.current) {
      // Panggil onChange untuk menyimpan HTML yang diubah
      onChange(editorRef.current.innerHTML);
      updateFormatState();
    }
  };

  // Menggunakan event keydown/up untuk memastikan undo/redo browser bawaan bekerja
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Memastikan onChange tetap dipanggil setelah input terjadi (opsional, handleInput sudah cukup)
  };

  // Menggunakan event onMouseUp/onKeyUp untuk memperbarui status aktif format setelah pengguna memilih teks
  const handleSelectionChange = () => {
    updateFormatState();
  };

  // Memperbarui state format yang aktif (diperlukan untuk toggle styling tombol)
  const updateFormatState = () => {
    const selection = window.getSelection();
    const parentNode = selection?.anchorNode?.parentElement;

    const formats = {
      bold: isCommandActive("bold"),
      italic: isCommandActive("italic"),
      underline: isCommandActive("underline"),
      strikethrough: isCommandActive("strikeThrough"),
      orderedlist: !!parentNode?.closest("ol"), // cek apakah dalam <ol>
      unorderedlist: !!parentNode?.closest("ul"), // cek apakah dalam <ul>
      alignleft: isCommandActive("justifyLeft"),
      aligncenter: isCommandActive("justifyCenter"),
      alignright: isCommandActive("justifyRight"),
    };
    setActiveFormats(formats);
  };

  // Fungsi utama untuk menjalankan perintah browser
  const executeCommand = (command: string, value: string = "") => {
    if (editorRef.current) {
      // Fokuskan editor sebelum menjalankan perintah
      editorRef.current.focus();

      // Menggunakan document.execCommand, yang secara otomatis mengelola Undo/Redo di browser
      document.execCommand(command, false, value);

      // Memperbarui UI toolbar dan state
      handleInput();
    }
  };

  // Handler kustom untuk Link
  const handleLink = () => {
    const url = prompt("Masukkan URL:", "http://");
    if (url && url !== "http://") {
      executeCommand("createLink", url);
    } else if (url === "") {
      executeCommand("unlink");
    }
  };

  // Handler kustom untuk Warna Teks (foreColor)
  const handleColorSelect = (colorCode: string) => {
    executeCommand("foreColor", colorCode);
    setIsColorDropdownOpen(false); // Tutup dropdown setelah memilih
  };

  // Handler kustom dari LinkDialog
  const handleApplyLink = (url: string) => {
    executeCommand("createLink", url);
  };

  // Handler kustom untuk Warna Latar Belakang Teks (hiliteColor)
  const handleHighlightSelect = (colorCode: string) => {
    // HiliteColor lebih andal untuk menyorot teks daripada backColor
    // Untuk menghapus highlight, gunakan 'white' atau 'transparent' pada beberapa browser
    executeCommand("hiliteColor", colorCode === "transparent" ? "white" : colorCode);
    setIsHighlightDropdownOpen(false);
  };

  // Handle paste untuk membersihkan format yang tidak diinginkan
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    // Simpan history setelah paste
    handleInput();
  };

  // Fungsi untuk mendapatkan style tombol aktif
  const getButtonClass = (format: keyof typeof activeFormats, command: string) => {
    const isActive = activeFormats[format] || document.queryCommandState(command);
    return `p-2 rounded transition-colors duration-100 ${
      isActive
        ? "bg-blue-500 text-white shadow-md" // Gaya aktif
        : "text-gray-600 hover:bg-gray-200" // Gaya tidak aktif
    }`;
  };

  const preventBlur = (e: React.MouseEvent) => e.preventDefault();
  const handleLinkClick = () => {
    // Simpan selection sebelum dialog dibuka
    selectionRef.current = window.getSelection();
    setIsLinkDialogOpen(true);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm font-sans relative">
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-10"
        onMouseDown={(e) => e.preventDefault()} // Mencegah toolbar kehilangan fokus editor
      >
        {/* Undo/Redo - Menggunakan execCommand bawaan browser */}
        <button
          type="button"
          onClick={() => {
            document.execCommand("undo");
            handleInput();
          }}
          className="p-2 rounded hover:bg-gray-200"
          title="Batal (Undo)"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            document.execCommand("redo");
            handleInput();
          }}
          className="p-2 rounded hover:bg-gray-200"
          title="Ulangi (Redo)"
        >
          <Redo size={16} />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        {/* Text Formatting */}
        <button type="button" onClick={() => executeCommand("bold")} className={getButtonClass("bold", "bold")} title="Tebal">
          <Bold size={16} />
        </button>
        <button type="button" onClick={() => executeCommand("italic")} className={getButtonClass("italic", "italic")} title="Miring">
          <Italic size={16} />
        </button>
        <button type="button" onClick={() => executeCommand("underline")} className={getButtonClass("underline", "underline")} title="Garis Bawah">
          <Underline size={16} />
        </button>
        <button type="button" onClick={() => executeCommand("strikeThrough")} className={getButtonClass("strikethrough", "strikeThrough")} title="Coret">
          <Strikethrough size={16} />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <div className="relative" ref={colorDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsColorDropdownOpen(!isColorDropdownOpen);
              setIsHighlightDropdownOpen(false); // Tutup yang lain
            }}
            className="p-2 rounded hover:bg-gray-200 flex items-center"
            title="Warna Teks"
          >
            <Palette size={16} />
            <ChevronDown size={14} className={`ml-1 transition-transform ${isColorDropdownOpen ? "rotate-180" : "rotate-0"}`} />
          </button>
          {isColorDropdownOpen && (
            <div
              className="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex flex-col z-20 w-40 max-h-48 overflow-y-auto" // DITAMBAHKAN: w-40, max-h-48, overflow-y-auto
            >
              {CUSTOM_COLORS.map((color) => (
                <button key={color.code + "fore"} type="button" onClick={() => handleColorSelect(color.code)} className="flex items-center p-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md w-full text-left">
                  <span className={`w-4 h-4 rounded-full mr-2 ${color.code !== "transparent" ? "border border-gray-200" : "border border-gray-400 border-dashed"}`} style={{ backgroundColor: color.code }}></span>
                  {color.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Warna Latar Belakang Teks (Highlight) */}
        <div className="relative" ref={highlightDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsHighlightDropdownOpen(!isHighlightDropdownOpen);
              setIsColorDropdownOpen(false); // Tutup yang lain
            }}
            className="p-2 rounded hover:bg-gray-200 flex items-center"
            title="Sorotan Teks (Highlight)"
          >
            <PaintBucket size={16} />
            <ChevronDown size={14} className={`ml-1 transition-transform ${isHighlightDropdownOpen ? "rotate-180" : "rotate-0"}`} />
          </button>
          {isHighlightDropdownOpen && (
            <div
              className="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex flex-col z-20 w-40 max-h-48 overflow-y-auto" // DITAMBAHKAN: w-40, max-h-48, overflow-y-auto
            >
              {CUSTOM_COLORS.map((color) => (
                <button key={color.code + "back"} type="button" onClick={() => handleHighlightSelect(color.code)} className="flex items-center p-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md w-full text-left">
                  <span className={`w-4 h-4 rounded-full mr-2 ${color.code !== "transparent" ? "border border-gray-200" : "border border-gray-400 border-dashed"}`} style={{ backgroundColor: color.code }}></span>
                  {color.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Tautan - Menggunakan handler modal baru */}
        <button type="button" onMouseDown={preventBlur} onClick={handleLinkClick} className={getButtonClass("link", "createLink")} title="Masukkan Tautan">
          <Link size={16} />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        {/* Lists */}
        <button type="button" onClick={() => executeCommand("insertUnorderedList")} className={getButtonClass("unorderedlist", "insertUnorderedList")} title="Daftar Poin">
          <List size={16} />
        </button>
        <button type="button" onClick={() => executeCommand("insertOrderedList")} className={getButtonClass("orderedlist", "insertOrderedList")} title="Daftar Nomor">
          <ListOrdered size={16} />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        {/* Alignment */}
        <button type="button" onClick={() => executeCommand("justifyLeft")} className={getButtonClass("alignleft", "justifyLeft")} title="Rata Kiri">
          <AlignLeft size={16} />
        </button>
        <button type="button" onClick={() => executeCommand("justifyCenter")} className={getButtonClass("aligncenter", "justifyCenter")} title="Rata Tengah">
          <AlignCenter size={16} />
        </button>
        <button type="button" onClick={() => executeCommand("justifyRight")} className={getButtonClass("alignright", "justifyRight")} title="Rata Kanan">
          <AlignRight size={16} />
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        onKeyDown={handleKeyDown}
        className="min-h-[120px] p-4 focus:outline-none text-gray-800"
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "16px",
          lineHeight: "1.6",
        }}
        // Inisialisasi konten dilakukan di useEffect
      />

      {/* Placeholder menggunakan CSS based, hanya terlihat jika innerHTML kosong */}
      {/* Menggunakan value state sebagai referensi untuk visibilitas placeholder */}
      {(!value || value === "<br>" || value.trim() === "") && (
        <div
          className="absolute top-0 left-0 right-0 p-4 text-gray-400 pointer-events-none"
          // Atur posisi placeholder relatif terhadap toolbar. Toolbar = 64px (4rem) + padding
        ></div>
      )}

      {/* Komponen Dialog Link Kustom */}
      <LinkDialog isOpen={isLinkDialogOpen} onClose={() => setIsLinkDialogOpen(false)} onApply={handleApplyLink} onRemove={() => executeCommand("unlink")} />
    </div>
  );
};

export default RichTextEditor;
