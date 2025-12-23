import { useEditorState } from "@tiptap/react";
import { FloatingMenu as TiptapFloatingMenuCore } from "@tiptap/react/menus";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
  HighlighterIcon,
  ListIcon,
  ListOrderedIcon,
  Quote,
  LinkIcon,
  UnlinkIcon,
} from "lucide-react";

import { Toggle } from "@/shared/ui/toggle";
import TiptapLinkPopover from "./TiptapLinkPopover";

export default function TiptapFloatingMenu({ editor }) {
  const s = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold") ?? false,
      isItalic: ctx.editor.isActive("italic") ?? false,
      isUnderline: ctx.editor.isActive("underline") ?? false,
      isHighlight: ctx.editor.isActive("highlight") ?? false,
      isStrike: ctx.editor.isActive("strike") ?? false,
      isCode: ctx.editor.isActive("code") ?? false,
      isBulletList: ctx.editor.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor.isActive("orderedList") ?? false,
      isBlockquote: ctx.editor.isActive("blockquote") ?? false,
      isLink: ctx.editor.isActive("link") ?? false,
    }),
  });

  return (
    <TiptapFloatingMenuCore
      editor={editor}
      className="bg-background flex items-center rounded-md border shadow-md relative z-50"
    >
      <Toggle size="sm" pressed={s.isBold} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
        <BoldIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={s.isItalic} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
        <ItalicIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={s.isUnderline} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={s.isStrike} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
        <StrikethroughIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={s.isHighlight}
        onPressedChange={() => editor.chain().focus().toggleHighlight({ color: "#fdeb80" }).run()}
      >
        <HighlighterIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={s.isCode} onPressedChange={() => editor.chain().focus().toggleCode().run()}>
        <CodeIcon className="h-4 w-4" />
      </Toggle>

      <div className="bg-border mx-1 h-6 w-px" />

      <Toggle size="sm" pressed={s.isBulletList} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
        <ListIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={s.isOrderedList} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrderedIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={s.isBlockquote} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </Toggle>

      <div className="bg-border mx-1 h-6 w-px" />

      {s.isLink ? (
        <Toggle
          pressed
          onPressedChange={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
        >
          <UnlinkIcon className="h-4 w-4" />
        </Toggle>
      ) : (
        <TiptapLinkPopover editor={editor}>
          <Toggle size="sm">
            <LinkIcon className="h-4 w-4" />
          </Toggle>
        </TiptapLinkPopover>
      )}
    </TiptapFloatingMenuCore>
  );
}
