"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface CategoryComboboxProps {
    value: string
    onChange: (value: string) => void
}

export function CategoryCombobox({ value, onChange }: CategoryComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [categories, setCategories] = React.useState<string[]>([])
    const [inputValue, setInputValue] = React.useState("")

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/wiki/categories')
                if (res.ok) {
                    const data = await res.json()
                    setCategories(data)
                }
            } catch (error) {
                console.error('Failed to fetch categories', error)
            }
        }
        fetchCategories()
    }, [])

    const filteredCategories = categories.filter((category) =>
        category.toLowerCase().includes(inputValue.toLowerCase())
    )

    const showCreateOption = inputValue && !categories.some(c => c.toLowerCase() === inputValue.toLowerCase())

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? categories.find((category) => category === value) || value
                        : "Select category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Search category..."
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup heading="Suggestions">
                            {filteredCategories.map((category) => (
                                <CommandItem
                                    key={category}
                                    value={category}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === category ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {category}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {showCreateOption && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        value={inputValue}
                                        onSelect={() => {
                                            onChange(inputValue)
                                            setOpen(false)
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create "{inputValue}"
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
