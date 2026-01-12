import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  // 先用 clsx 处理条件逻辑，再用 twMerge 解决 Tailwind 类名冲突
  return twMerge(clsx(inputs));
}