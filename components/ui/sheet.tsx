import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({ className, ...props }: DialogPrimitive.DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-slate-900/40" />
      <DialogPrimitive.Content
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl",
          className
        )}
        {...props}
      />
    </DialogPrimitive.Portal>
  );
}
