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

import type { Role } from "@prisma/client";


export default function ComboBoxRoles(props:any) {
    const roles = props.roles;
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
            ? roles.find((rol:any) => rol.id === value)?.name
            : "Seleccionar un rol..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
        <Command>
            <CommandInput placeholder="Buscar rol..." />
            <CommandEmpty>No encontrado.</CommandEmpty>
            <CommandGroup>
            {roles.map((rol:Role) => (
                <CommandItem
                key={rol.id}
                value={rol.id}
                onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    onCheckBoxChange(currentValue);
                    console.log("valor cambiado");
                    setOpen(false)
                }}
                >
                <Check
                    className={cn(
                    "mr-2 h-4 w-4",
                    value === rol.name ? "opacity-100" : "opacity-0"
                    )}
                />
                {rol.name}
                </CommandItem>
            ))}
            </CommandGroup>
        </Command>
        </PopoverContent>
    </Popover>
    )
}