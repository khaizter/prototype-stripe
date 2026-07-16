import type { LucideIcon } from "lucide-react";
import {
  Apple,
  Banana,
  Carrot,
  Cherry,
  Coffee,
  Cookie,
  Egg,
  Fish,
  Grape,
  Milk,
  Pizza,
  Sandwich,
} from "lucide-react";

export const PRODUCT_ICONS = {
  Apple,
  Banana,
  Cherry,
  Grape,
  Carrot,
  Coffee,
  Cookie,
  Milk,
  Fish,
  Egg,
  Sandwich,
  Pizza,
} as const satisfies Record<string, LucideIcon>;

export type ProductIconName = keyof typeof PRODUCT_ICONS;

export const PRODUCT_ICON_NAMES = Object.keys(
  PRODUCT_ICONS,
) as ProductIconName[];

export function getProductIcon(name: string): LucideIcon {
  if (name in PRODUCT_ICONS) {
    return PRODUCT_ICONS[name as ProductIconName];
  }
  return Apple;
}
