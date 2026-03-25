"use client"

import * as React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer"

// Detect mobile (touch) device
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches);
  }, []);
  return isMobile;
}

// Context to pass value/onChange down through mobile Select
const MobileSelectContext = React.createContext(null);

// ── Standard (desktop) primitives ──────────────────────────────────────────

const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}>
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn("p-1", position === "popper" &&
          "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props} />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}>
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props} />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

// ── Mobile bottom-sheet Select ──────────────────────────────────────────────

// A wrapper Select that on mobile renders a Drawer bottom sheet instead of a popover
function Select({ value, defaultValue, onValueChange, children, ...props }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');

  const controlled = value !== undefined;
  const currentValue = controlled ? value : internalValue;

  const handleChange = useCallback((val) => {
    if (!controlled) setInternalValue(val);
    onValueChange?.(val);
    setOpen(false);
  }, [controlled, onValueChange]);

  if (!isMobile) {
    // Desktop: use Radix Select as-is
    return (
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        {...props}
      >
        {children}
      </SelectPrimitive.Root>
    );
  }

  // Mobile: render a custom trigger that opens a Drawer bottom sheet
  // We need to find the trigger and replace content rendering
  // Extract trigger child and content child
  let triggerChild = null;
  React.Children.forEach(children, child => {
    if (React.isValidElement(child) && (child.type === SelectTrigger || (child.type?.displayName === 'SelectTrigger'))) {
      triggerChild = child;
    }
  });

  return (
    <MobileSelectContext.Provider value={{ value: currentValue, onValueChange: handleChange, open, setOpen }}>
      {/* Render a div that mimics SelectTrigger but opens our Drawer */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
          "focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          triggerChild?.props?.className
        )}
      >
        {/* Show selected label */}
        <MobileSelectValueDisplay value={currentValue} children={children} placeholder={triggerChild?.props?.children} />
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>
      <MobileSelectDrawer open={open} onOpenChange={setOpen} currentValue={currentValue} onSelect={handleChange}>
        {children}
      </MobileSelectDrawer>
    </MobileSelectContext.Provider>
  );
}

// Shows the label of the currently selected value
function MobileSelectValueDisplay({ value, children }) {
  const label = useMemo(() => {
    let found = null;
    function traverse(child) {
      if (!React.isValidElement(child)) return;
      if ((child.type === SelectItem || child.type?.displayName === 'SelectItem') && child.props.value === value) {
        found = child.props.children;
        return;
      }
      React.Children.forEach(child.props?.children, traverse);
    }
    React.Children.forEach(children, traverse);
    return found;
  }, [value, children]);

  if (!label) return <span className="text-muted-foreground text-sm">Select...</span>;
  return <span className="text-sm">{label}</span>;
}

function MobileSelectDrawer({ open, onOpenChange, currentValue, onSelect, children }) {

  // Collect all SelectItem children from inside SelectContent
  const items = useMemo(() => {
    const collected = [];
    function traverse(child) {
      if (!React.isValidElement(child)) return;
      if (child.type === SelectItem || (child.type && child.type.displayName === 'SelectItem')) {
        collected.push(child);
        return;
      }
      React.Children.forEach(child.props?.children, traverse);
    }
    React.Children.forEach(children, traverse);
    return collected;
  }, [children]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="pb-safe">
        <div className="px-4 pb-6 pt-2 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1">
            {items.map((item, idx) => {
              const val = item.props.value;
              const isSelected = val === currentValue;
              // Extract text from children
              const label = item.props.children;
              return (
                <button
                  key={val ?? idx}
                  onClick={() => onSelect(val)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors",
                    isSelected
                      ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-semibold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                  )}
                >
                  <span>{label}</span>
                  {isSelected && <Check className="h-4 w-4 text-violet-600 dark:text-violet-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}