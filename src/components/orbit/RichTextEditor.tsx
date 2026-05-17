import { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Strikethrough, Code, Heading2, Heading3,
  List, ListOrdered, Quote, Link as LinkIcon, Smile, Undo2, Redo2,
} from "lucide-react";
import { useState, useRef } from "react";
import { sanitizeHtml } from "@/lib/sanitize";

const EMOJIS = ["😀","😂","😍","🤔","😎","🙌","🔥","✨","🎉","💯","👍","👏","❤️","💡","🚀","🦄","🐙","🐺","🦊","🦉","🧠","🎨","📚","🌍","☕","🍕","🌙","⭐","⚡","💎","🪐","🌈"];

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export function RichTextEditor({ value, onChange, placeholder, minHeight = 160 }: Props) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiRef = useRef<HTMLDivElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank", class: "text-primary underline" } }),
      Placeholder.configure({ placeholder: placeholder ?? "Write something…" }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-editor focus:outline-none w-full",
        style: `min-height:${minHeight}px;`,
      },
    },
  });

  // Sync external value changes (e.g. when opening edit mode)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    if (!emojiOpen) return;
    const onDown = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setEmojiOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [emojiOpen]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `h-8 w-8 grid place-items-center rounded-lg text-sm transition ${active ? "bg-primary/15 text-primary" : "hover:bg-secondary text-foreground"}`;

  return (
    <div className="rounded-xl bg-secondary/50 border border-border">
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-border">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} aria-label="Bold"><Bold className="h-4 w-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} aria-label="Italic"><Italic className="h-4 w-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive("strike"))} aria-label="Strikethrough"><Strikethrough className="h-4 w-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={btn(editor.isActive("code"))} aria-label="Code"><Code className="h-4 w-4" /></button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} aria-label="Heading 2"><Heading2 className="h-4 w-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))} aria-label="Heading 3"><Heading3 className="h-4 w-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} aria-label="Bullet list"><List className="h-4 w-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} aria-label="Ordered list"><ListOrdered className="h-4 w-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))} aria-label="Quote"><Quote className="h-4 w-4" /></button>
        <span className="mx-1 h-5 w-px bg-border" />
        <button type="button" onClick={addLink} className={btn(editor.isActive("link"))} aria-label="Link"><LinkIcon className="h-4 w-4" /></button>
        <div className="relative" ref={emojiRef}>
          <button type="button" onClick={() => setEmojiOpen((v) => !v)} className={btn(emojiOpen)} aria-label="Emoji"><Smile className="h-4 w-4" /></button>
          {emojiOpen && (
            <div className="absolute z-50 mt-2 left-0 glass rounded-xl p-2 shadow-xl grid grid-cols-8 gap-1 w-64">
              {EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => { editor.chain().focus().insertContent(e).run(); setEmojiOpen(false); }}
                  className="h-8 w-8 grid place-items-center rounded-md hover:bg-secondary text-lg">{e}</button>
              ))}
            </div>
          )}
        </div>
        <span className="ml-auto" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn(false)} aria-label="Undo"><Undo2 className="h-4 w-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn(false)} aria-label="Redo"><Redo2 className="h-4 w-4" /></button>
      </div>
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export function RichContent({ html, className = "" }: { html: string; className?: string }) {
  if (!html) return null;
  return (
    <div className={`prose-content ${className}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
  );
}
