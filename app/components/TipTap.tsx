import { useEditor, EditorContent } from "@tiptap/react";
import TipTapMenuBar from "./TipTapMenuBar";
import { useRef, useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useSubmit } from "@remix-run/react";
import Youtube from "@tiptap/extension-youtube";

const Tiptap = ({ html }: { html?: string }) => {
  const submit = useSubmit();
  const [isChanging, setIsChanging] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  //https://www.codemzy.com/blog/tiptap-drag-drop-image

  const editor = useEditor({
    autofocus: true,
    extensions: [
      StarterKit,
      Image.extend({
        addNodeView() {
          return ({ node, editor, getPos }) => {
            // You can use a React component here if you prefer
            const dom = document.createElement("div");
            dom.className = "relative";

            const img = document.createElement("img");
            img.setAttribute("src", node.attrs.src);
            img.setAttribute("alt", node.attrs.alt || "");

            // Add any additional elements (like a delete button) here
            const deleteButton = document.createElement("button");
            deleteButton.className =
              "absolute top-2 right-2 h-9	w-9 rounded-full bg-red-700 text-white";
            deleteButton.textContent = "x";
            deleteButton.onclick = () => {
              if (typeof getPos !== "function") return;

              fetch("/api/delete-image", {
                method: "DELETE",
                body: JSON.stringify({ image: node.attrs.src }),
              }).then((res) => {
                if (res.status === 200) {
                  const transaction = editor.state.tr.delete(
                    getPos(),
                    getPos() + node.nodeSize
                  );
                  editor.view.dispatch(transaction);
                }
              });
            };

            dom.appendChild(img);
            dom.appendChild(deleteButton);

            return {
              dom,
              contentDOM: img,
            };
          };
        },
      }),
      Youtube.configure({
        controls: false,
      }),
    ],
    content: html,
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
          // let fileSize = Number((file.size / 1024 / 1024).toFixed(4)); // get the filesize in MB
          if (
            file.type === "image/jpeg" ||
            file.type === "image/png" ||
            file.type === "video/mp4"
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

                const formData = new FormData();

                formData.append("file", file);

                fetch("/api/upload-image", {
                  method: "POST",
                  body: formData,
                })
                  .then((response) => response.json())
                  .then((data) => {
                    const { schema } = view.state;
                    const coordinates = view.posAtCoords({
                      left: event.clientX,
                      top: event.clientY,
                    }) as { pos: number; inside: number };
                    const node = schema.nodes.image.create({
                      src: data.url,
                    }); // creates the image element

                    const transaction = view.state.tr.insert(
                      coordinates.pos,
                      node
                    ); // places it in the correct position
                    return view.dispatch(transaction);
                  });
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
      setIsChanging(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        submit(
          {
            html: editor.getHTML(),
            intention: "updateHtml",
          },
          { method: "POST" }
        );
        setIsChanging(false);
      }, 600);
    },
  });

  return (
    <div className="border border-gray-600 relative">
      {editor && <TipTapMenuBar editor={editor} isChanging={isChanging} />}
      <div className="mt-5 prose p-5">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Tiptap;
