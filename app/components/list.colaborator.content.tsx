import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ClipboardEdit, Eraser, X, Check } from "lucide-react";

export default function ModifyColaborator(props: any) {
  const colaborador = props.colaborador;
  const funk = props.funk;
  const [editColaboratorVisibility,setEditColaboratorVisibility] = useState(true);
  
  const toggleDivs = () => {
    setEditColaboratorVisibility(!editColaboratorVisibility)
  };

  const handleEditSubmit = (e:any) => {
    e.preventDefault();
    console.log("handleEditSubmit");  
    toggleDivs();
  };
  
  return (
    <div>
      {editColaboratorVisibility && (
        <div>
          <Button
            className="mr-1"
            onSubmit={handleEditSubmit}
          >
            <ClipboardEdit />
          </Button>
          <Button
            variant="destructive"
            name="intention"
            value="deleteColaborator"
          >
            <Eraser />
          </Button>
        </div>
      )}
      {!editColaboratorVisibility && (
        <div>
          <Button variant="secondary" name="intention" value="editColaborator">
            <Check />
          </Button>
          <Button
            variant="destructive"
            name="intention"
            value="cancelEditColaborator"
          >
            <X />
          </Button>
        </div>
      )}
    </div>
  );
}
