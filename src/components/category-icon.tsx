import React from "react";
import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

interface CategoryIconProps extends LucideProps {
  name?: string;
  iconName?: string;
}

export function CategoryIcon({ name, iconName, ...props }: CategoryIconProps) {
  const targetName = name || iconName || "CircleDot";
  // @ts-expect-error dynamic lucide icon lookup
  const IconComponent = Icons[targetName] || Icons.CircleDot;
  return <IconComponent {...props} />;
}
