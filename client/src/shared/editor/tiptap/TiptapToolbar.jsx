import { useEditorState } from "@tiptap/react";
import {
  BoldIcon,
  CodeIcon,
  HighlighterIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  Quote,
  RedoIcon,
  StrikethroughIcon,
  UnderlineIcon,
  UndoIcon,
  UnlinkIcon,
} from "lucide-react";

import { Toggle } from "@/shared/ui/toggle";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import TiptapLinkPopover from "./TiptapLinkPopover";

export default function TiptapToolbar({ editor }) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold") ?? false,
      isItalic: ctx.editor.isActive("italic") ?? false,
      isUnderline: ctx.editor.isActive("underline") ?? false,
      isStrike: ctx.editor.isActive("strike") ?? false,
      isCode: ctx.editor.isActive("code") ?? false,
      isHighlight: ctx.editor.isActive("highlight") ?? false,
      isBulletList: ctx.editor.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor.isActive("orderedList") ?? false,
      isBlockquote: ctx.editor.isActive("blockquote") ?? false,
      isLink: ctx.editor.isActive("link") ?? false,
      canRedo: editor.can().redo(),
      canUndo: editor.can().undo(),
      isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
      isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
      isHeading4: ctx.editor.isActive("heading", { level: 4 }) ?? false,
      isHeading5: ctx.editor.isActive("heading", { level: 5 }) ?? false,
      isHeading6: ctx.editor.isActive("heading", { level: 6 }) ?? false,
    }),
  });

  const handleHeadingChange = (value) => {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
      return;
    }

    const level = Number.parseInt(value.replace("heading", ""), 10);
    editor.chain().focus().setHeading({ level }).run();
  };

  const headingValue = editorState.isHeading2
    ? "heading2"
    : editorState.isHeading3
    ? "heading3"
    : editorState.isHeading4
    ? "heading4"
    : editorState.isHeading5
    ? "heading5"
    : editorState.isHeading6
    ? "heading6"
    : "paragraph";

  return (
    <div className="bg-background sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b p-2">
      <Select onValueChange={handleHeadingChange} value={headingValue}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Paragraph" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Paragraph</SelectItem>
          <SelectItem value="heading2">Heading 1</SelectItem>
          <SelectItem value="heading3">Heading 2</SelectItem>
          <SelectItem value="heading4">Heading 3</SelectItem>
          <SelectItem value="heading5">Heading 4</SelectItem>
          <SelectItem value="heading6">Heading 5</SelectItem>
        </SelectContent>
      </Select>

      <Toggle size="sm" pressed={editorState.isBold} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
        <BoldIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={editorState.isItalic} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
        <ItalicIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={editorState.isUnderline} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={editorState.isStrike} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
        <StrikethroughIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editorState.isHighlight}
        onPressedChange={() => editor.chain().focus().toggleHighlight({ color: "#fdeb80" }).run()}
      >
        <HighlighterIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={editorState.isCode} onPressedChange={() => editor.chain().focus().toggleCode().run()}>
        <CodeIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={editorState.isBulletList} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
        <ListIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={editorState.isOrderedList} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrderedIcon className="h-4 w-4" />
      </Toggle>

      <Toggle size="sm" pressed={editorState.isBlockquote} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </Toggle>

      <div className="bg-border mx-1 h-6 w-px" />

      {editorState.isLink ? (
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

      <div className="bg-border mx-1 h-6 w-px" />

      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editorState.canUndo}
      >
        <UndoIcon className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editorState.canRedo}
      >
        <RedoIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
