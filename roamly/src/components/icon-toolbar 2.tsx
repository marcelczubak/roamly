"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ICON_THEMES,
  type IconThemeKey,
  type ThemedIconItem,
} from "@/lib/icon-themes";

const ICON_STROKE = 1.75;
const BUTTON_SIZE = "size-[38px]";

type IconCircleButtonProps = {
  icon: LucideIcon;
  theme: IconThemeKey;
  label: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export function IconCircleButton({
  icon: Icon,
  theme,
  label,
  selected = false,
  onClick,
  disabled,
  className,
}: IconCircleButtonProps) {
  const colors = ICON_THEMES[theme];
  const Component = onClick ? "button" : "span";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={onClick ? selected : undefined}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full border border-solid transition-all duration-200",
        BUTTON_SIZE,
        selected ? colors.borderSelected : colors.border,
        selected ? colors.bgSelected : colors.bg,
        onClick && !selected && colors.bgHover,
        onClick && "cursor-pointer",
        selected && "z-10 shadow-lg ring-2 ring-offset-1",
        selected && colors.ring,
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <Icon
        className={cn("size-4", selected ? colors.iconSelected : colors.icon)}
        strokeWidth={ICON_STROKE}
      />
    </Component>
  );
}

type IconToolbarProps = {
  items: ThemedIconItem[];
  selected?: string[];
  onToggle?: (id: string) => void;
  showLabels?: boolean;
  className?: string;
};

export function IconToolbar({
  items,
  selected = [],
  onToggle,
  showLabels = false,
  className,
}: IconToolbarProps) {
  return (
    <div className={cn("w-full overflow-visible", className)}>
      <div
        role={onToggle ? "toolbar" : undefined}
        aria-label={onToggle ? "Interest selection" : undefined}
        className="-mx-1 flex items-center gap-2.5 overflow-x-auto px-1 py-3 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const isSelected = selected.includes(item.id);
          const colors = ICON_THEMES[item.theme];

          return (
            <div
              key={item.id}
              className="flex shrink-0 flex-col items-center"
            >
              <IconCircleButton
                icon={item.icon}
                theme={item.theme}
                label={item.label}
                selected={isSelected}
                onClick={onToggle ? () => onToggle(item.id) : undefined}
              />
              {showLabels ? (
                <span
                  className={cn(
                    "mt-1.5 max-w-[52px] truncate text-center text-[10px] transition-colors",
                    isSelected
                      ? cn("font-semibold", colors.labelSelected)
                      : "font-medium text-stone-400"
                  )}
                >
                  {item.label}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type CategoryBadgeProps = {
  category: ThemedIconItem;
  className?: string;
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colors = ICON_THEMES[category.theme];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
        colors.border,
        colors.bg,
        colors.icon,
        className
      )}
    >
      <category.icon className="size-3" strokeWidth={ICON_STROKE} />
      {category.label}
    </span>
  );
}
