import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Minus,
  Undo,
  Redo,
} from "lucide-react";

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Tulis deskripsi atau konten di sini...",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[200px] max-h-[400px] overflow-y-auto p-4 text-sm rounded-b-2xl border border-t-0 border-border bg-background transition-all focus-within:ring-2 focus-within:ring-primary/20",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // If it's just an empty paragraph, send empty string to avoid db pollution
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Keep TipTap content in sync with outer React value state
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Prevent cursor reset on double-updates
      const isSame = editor.getHTML() === value || (editor.getHTML() === "<p></p>" && value === "");
      if (!isSame) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    isActive = false,
    title,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-lg transition-all duration-150 ${
        isActive
          ? "bg-primary text-primary-foreground font-semibold shadow"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-border bg-card">
      {/* Rich Text Toolbar */}
      <div className="flex flex-wrap gap-1 items-center p-2 border-b border-border bg-muted/30">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2 (Judul Besar)"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3 (Sub-Judul)"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <div className="h-4 w-px bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Tebal (Bold)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Miring (Italic)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Coret (Strike)"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <div className="h-4 w-px bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Daftar Bulatan (Bullet List)"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Daftar Nomor (Ordered List)"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Kutipan (Blockquote)"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Garis Pembatas (Divider)"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <div className="h-4 w-px bg-border mx-1 flex-grow sm:flex-grow-0" />

        <div className="flex gap-1 ml-auto">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Batal (Undo)"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Ulangi (Redo)"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
