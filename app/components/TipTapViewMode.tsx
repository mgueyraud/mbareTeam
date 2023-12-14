import { useEditor, EditorContent } from "@tiptap/react";
import { useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

const TipTapViewMode = ({ html }: { html?: string }) => {
  const [editorState] = useState(
    html ||
      `<p>Hello World!</p>
  <img src="https://source.unsplash.com/8xznAGy4HcY/800x400" />`
  );

  const editor = useEditor({
    autofocus: true,
    extensions: [StarterKit, Image],
    content: editorState,
    editable: false,
  });

  return (
    <div className="p-4 shadow-md">
      <div className="mt-5 prose">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TipTapViewMode;
