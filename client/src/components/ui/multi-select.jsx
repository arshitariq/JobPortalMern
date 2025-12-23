import React, { useMemo, useState } from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

export function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options",
  className,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = useMemo(() => {
    const map = new Map(options.map((option) => [option.value, option]));
    return value.map((val) => map.get(val)).filter(Boolean);
  }, [value, options]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const term = search.toLowerCase();
    return options.filter(
      (option) =>
        option.label?.toLowerCase().includes(term) ||
        option.value?.toLowerCase().includes(term)
    );
  }, [options, search]);

  const toggleValue = (val) => {
    if (value.includes(val)) {
      onChange?.(value.filter((item) => item !== val));
    } else {
      onChange?.([...value, val]);
    }
  };

  const clearAll = () => {
    onChange?.([]);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left",
            !selected.length && "text-muted-foreground",
            className
          )}
        >
          <div className="flex flex-wrap items-center gap-1">
            {selected.length
              ? selected.map((item) => (
                  <Badge key={item.value} variant="secondary">
                    {item.label}
                  </Badge>
                ))
              : placeholder}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px] p-0">
        <div className="border-b p-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search..."
            className="h-8"
          />
        </div>

        <div className="max-h-60 overflow-y-auto">
          {filteredOptions.length ? (
            filteredOptions.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleValue(option.value)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between px-3 py-2 text-sm transition",
                    isSelected ? "bg-muted" : "hover:bg-muted/60"
                  )}
                >
                  {option.label}
                  {isSelected && <CheckIcon className="h-4 w-4" />}
                </button>
              );
            })
          ) : (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              No options found.
            </p>
          )}
        </div>

        {value.length > 0 && (
          <div className="border-t px-2 py-2 text-right">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={clearAll}
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
