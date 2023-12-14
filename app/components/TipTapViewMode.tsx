import { useEditor, EditorContent } from "@tiptap/react";
import TipTapMenuBar from "./TipTapMenuBar";
import { useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useSubmit } from "@remix-run/react";

const TipTapViewMode = ({ html }: { html?: string }) => {
  const [editorState, setEditorState] = useState(
    html ||
      `<p>Hello World!</p>
  <img src="https://source.unsplash.com/8xznAGy4HcY/800x400" />`
  );
  const submit = useSubmit();
  const editor = useEditor({
    autofocus: true,
    extensions: [StarterKit, Image],
    content: editorState,
    editable: false,
  });

  const updateContent = () => {
    submit(
      {
        html: editorState,
        intention: "updateHtml",
      },
      { method: "POST" }
    );
  };

  return (
    <div className="p-4 shadow-md">
      <div className="mt-5 prose">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TipTapViewMode;
