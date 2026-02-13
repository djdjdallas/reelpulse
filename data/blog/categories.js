export const categories = {
  fundamentals: {
    key: "fundamentals",
    label: "Fundamentals",
    color: "blue",
    description: "Core concepts and essential metrics for short-form series creators",
  },
  "platform-analytics": {
    key: "platform-analytics",
    label: "Platform Analytics",
    color: "purple",
    description: "Platform-specific guides for YouTube Shorts, TikTok, and ReelShort",
  },
  "paywall-optimization": {
    key: "paywall-optimization",
    label: "Paywall & Revenue",
    color: "green",
    description: "Maximize revenue with smarter paywall placement and pricing",
  },
  "tools-comparison": {
    key: "tools-comparison",
    label: "Tools & Comparisons",
    color: "amber",
    description: "Compare analytics tools and build the right stack for your studio",
  },
  "advanced-analytics": {
    key: "advanced-analytics",
    label: "Advanced Analytics",
    color: "red",
    description: "Deep-dive analytics techniques for data-driven content studios",
  },
};

export const categoryColors = {
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  green: "bg-green-500/10 text-green-400 border-green-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function getCategoryStyle(categoryKey) {
  const category = categories[categoryKey];
  if (!category) return categoryColors.blue;
  return categoryColors[category.color] || categoryColors.blue;
}

export function getCategoryLabel(categoryKey) {
  return categories[categoryKey]?.label || categoryKey;
}
