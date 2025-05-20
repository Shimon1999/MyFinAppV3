import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = ({ value, onValueChange, children, disabled }) => {
  const [open, setOpen] = useState(false);
  
  const handleValueChange = (newValue) => {
    onValueChange(newValue);
    setOpen(false);
  };

  return (
    <SelectRoot value={value} onValueChange={handleValueChange} open={open} onOpenChange={setOpen} disabled={disabled}>
      {children}
    </SelectRoot>
  );
};

const SelectRoot = ({ value, onValueChange, open, onOpenChange, disabled, children }) => {
  const ref = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target) && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className="relative">
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => !disabled && onOpenChange(!open),
            value,
            disabled,
          });
        }
        if (child.type === SelectContent) {
          return open ? React.cloneElement(child, { value, onValueChange }) : null;
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, onClick, disabled, ...props }, ref) => (
  <Button
    ref={ref}
    type="button"
    variant="outline"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex w-full justify-between items-center font-normal",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
    {...props}
  >
    <div className="flex-grow text-left">{children}</div>
    <ChevronDown className="h-4 w-4 opacity-50 ml-2 flex-shrink-0" />
  </Button>
));

SelectTrigger.displayName = "SelectTrigger";

const SelectContent = ({ children, value, onValueChange, align = "center", className }) => {
  return (
    <div className={cn(
      "absolute z-[150] w-full min-w-[8rem] rounded-md border bg-white shadow-md p-1 mt-1",
      align === "end" && "right-0",
      className
    )}>
      {React.Children.map(children, (child) => {
        if (child.type === SelectItem) {
          return React.cloneElement(child, { 
            selected: child.props.value === value,
            onSelect: () => onValueChange(child.props.value)
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectItem = React.forwardRef(({ className, children, selected, onSelect, disabled, value, ...props }, ref) => (
  <div
    ref={ref}
    role="option"
    aria-selected={selected}
    data-disabled={disabled || undefined}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
      "hover:bg-gray-100 hover:text-gray-900",
      selected && "bg-blue-100 text-blue-900",
      disabled && "pointer-events-none opacity-50",
      className
    )}
    onClick={() => !disabled && onSelect()}
    {...props}
  >
    {selected && (
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <Check className="h-4 w-4" />
      </span>
    )}
    {children}
  </div>
));

SelectItem.displayName = "SelectItem";

const SelectValue = ({ placeholder, children }) => {
  return <>{children || placeholder}</>;
};

export { 
  Select,
  SelectTrigger,
  SelectContent, 
  SelectItem, 
  SelectValue 
};