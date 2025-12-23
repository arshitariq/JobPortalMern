import React from "react";

import { TiptapEditor } from "@/shared/editor/tiptap";

export function RichTextEditor({ value = "", onChange, className, ...props }) {
  return (
    <div className={className} {...props}>
      <TiptapEditor content={value} onChange={onChange} />
    </div>
  );
}
