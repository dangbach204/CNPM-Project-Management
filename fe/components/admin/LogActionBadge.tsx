import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LogActionBadgeProps {
  action: string;
  className?: string;
}

// Action color mapping
const ACTION_COLOR_MAP: Record<string, string> = {
  // Login/Logout
  login: "bg-purple-100 text-purple-700 border-purple-200",
  logout: "bg-purple-100 text-purple-700 border-purple-200",

  // Create
  create: "bg-green-100 text-green-700 border-green-200",
  add: "bg-green-100 text-green-700 border-green-200",
  register: "bg-green-100 text-green-700 border-green-200",

  // Update
  update: "bg-yellow-100 text-yellow-700 border-yellow-200",
  edit: "bg-yellow-100 text-yellow-700 border-yellow-200",
  modify: "bg-yellow-100 text-yellow-700 border-yellow-200",

  // Delete
  delete: "bg-red-100 text-red-700 border-red-200",
  remove: "bg-red-100 text-red-700 border-red-200",

  // View/Read
  view: "bg-blue-100 text-blue-700 border-blue-200",
  read: "bg-blue-100 text-blue-700 border-blue-200",

  // Default
  default: "bg-gray-100 text-gray-700 border-gray-200",
};

export function LogActionBadge({ action, className }: LogActionBadgeProps) {
  const getActionColor = (action: string): string => {
    const lowerAction = action.toLowerCase();

    for (const [key, color] of Object.entries(ACTION_COLOR_MAP)) {
      if (key !== "default" && lowerAction.includes(key)) {
        return color;
      }
    }

    return ACTION_COLOR_MAP.default;
  };

  return (
    <Badge className={cn(getActionColor(action), "font-medium", className)}>
      {action}
    </Badge>
  );
}
