import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectTrigger = ({ className, children, ...props }: SelectPrimitive.SelectTriggerProps) => (
  <SelectPrimitive.Trigger
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 text-slate-400" />
  </SelectPrimitive.Trigger>
);

export const SelectContent = ({ className, ...props }: SelectPrimitive.SelectContentProps) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn("rounded-lg border border-slate-200 bg-white p-1 shadow-lg", className)}
      {...props}
    />
  </SelectPrimitive.Portal>
);

export const SelectItem = ({ className, ...props }: SelectPrimitive.SelectItemProps) => (
  <SelectPrimitive.Item
    className={cn(
      "cursor-pointer select-none rounded-md px-3 py-2 text-sm text-slate-700 focus:bg-slate-100",
      className
    )}
    {...props}
  />
);
