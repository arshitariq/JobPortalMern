import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";

import TiptapToolbar from "./TiptapToolbar";
import TiptapBubbleMenu from "./TiptapBubbleMenu";
import TiptapFloatingMenu from "./TiptapFloatingMenu";

export default function TiptapEditor({ content = "", onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, Highlight.configure({ multicolor: true })],
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-base focus:outline-none max-w-none",
      },
    },
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  return (
    <div className="bg-background relative rounded-lg border shadow-sm">
      {editor && (
        <>
          <TiptapToolbar editor={editor} />
          <TiptapBubbleMenu editor={editor} />
          <TiptapFloatingMenu editor={editor} />
        </>
      )}

      <EditorContent editor={editor} className="min-h-[300px] px-4 py-3" />
    </div>
  );
}
