import { useEditor, EditorContent } from "@tiptap/react";
import TipTapMenuBar from "./TipTapMenuBar";
import { useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useSubmit } from "@remix-run/react";

const Tiptap = ({ html }: { html?: string }) => {
  const [editorState, setEditorState] = useState(
    html ||
      `<p>Hello World!</p>
  <img src="https://source.unsplash.com/8xznAGy4HcY/800x400" />`
  );
  const submit = useSubmit();

  //https://www.codemzy.com/blog/tiptap-drag-drop-image

  const editor = useEditor({
    autofocus: true,
    extensions: [StarterKit, Image],
    content: editorState,
    editorProps: {
      handleDrop: function (view, event, slice, moved) {
        if (
          !moved &&
          event.dataTransfer &&
          event.dataTransfer.files &&
          event.dataTransfer.files[0]
        ) {
          // if dropping external files
          let file = event.dataTransfer.files[0]; // the dropped file
          let fileSize = Number((file.size / 1024 / 1024).toFixed(4)); // get the filesize in MB
          if (
            (file.type === "image/jpeg" || file.type === "image/png") &&
            fileSize < 10
          ) {
            // check valid image type under 10MB
            // check the dimensions
            let _URL = window.URL || window.webkitURL;
            console.log(_URL);
            let img = document.createElement("img") as HTMLImageElement;
            img.src = _URL.createObjectURL(file);
            console.log({ img, file });
            img.onload = function () {
              if (img.width > 5000 || img.height > 5000) {
                window.alert(
                  "Your images need to be less than 5000 pixels in height and width."
                ); // display alert
              } else {
                // valid image so upload to server
                // uploadImage will be your function to upload the image to the server or s3 bucket somewhere
                // uploadImage(file)
                //   .then(function (response) {
                //     // response is the image url for where it has been saved
                //     // do something with the response
                //   })
                //   .catch(function (error) {
                //     if (error) {
                //       window.alert(
                //         "There was a problem uploading your image, please try again."
                //       );
                //     }
                //   });

                const { schema } = view.state;
                const coordinates = view.posAtCoords({
                  left: event.clientX,
                  top: event.clientY,
                }) as { pos: number; inside: number };
                const node = schema.nodes.image.create({
                  src: _URL.createObjectURL(file),
                }); // creates the image element
                const transaction = view.state.tr.insert(coordinates.pos, node); // places it in the correct position
                return view.dispatch(transaction);
              }
            };
          } else {
            window.alert(
              "Images need to be in jpg or png format and less than 10mb in size."
            );
          }
          return true; // handled
        }
        return false; // not handled use default behaviour
      },
    },
    onUpdate: ({ editor }) => {
      setEditorState(editor.getHTML());
    },
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
      {editor && (
        <TipTapMenuBar editor={editor} updateContent={updateContent} />
      )}
      <div className="mt-5 prose">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Tiptap;
