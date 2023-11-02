import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import type { User } from "@prisma/client";


export default function ComboboxDemo(props:any) {
    const usuarios = props.usuarios;
    const onCheckBoxChange = props.onCheckBoxChange;
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")


    return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
        <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
        >
            {value
            ? usuarios.find((usuario:any) => usuario.googleId === value)?.username
            : "Seleccionar usuario..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
        <Command>
            <CommandInput placeholder="Buscar usuario..." />
            <CommandEmpty>No encontrado.</CommandEmpty>
            <CommandGroup>
            {usuarios.map((usuario:User) => (
                <CommandItem
                key={usuario.googleId}
                value={usuario.googleId}
                onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    onCheckBoxChange(value);
                    onCheckBoxChange(currentValue);
                    console.log("valor cambiado");
                    setOpen(false)
                }}
                >
                <Check
                    className={cn(
                    "mr-2 h-4 w-4",
                    value === usuario.username ? "opacity-100" : "opacity-0"
                    )}
                />
                {usuario.username}
                </CommandItem>
            ))}
            </CommandGroup>
        </Command>
        </PopoverContent>
    </Popover>
    )
}