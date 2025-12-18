import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Globe,
  User,
  FolderOpen,
  FileText,
  Activity,
} from "lucide-react";
import { Log } from "@/types/admin";
import { LogActionBadge } from "./LogActionBadge";
import { cn } from "@/lib/utils";
// Use shared date formatting utility - formatting happens at render time only
import { formatDateTime } from "@/lib/project-helpers";

interface LogItemProps {
  log: Log;
  onClick?: (log: Log) => void;
}

const getEntityIcon = (entityType: string) => {
  switch (entityType.toLowerCase()) {
    case "user":
      return <User className="h-4 w-4" />;
    case "project":
      return <FolderOpen className="h-4 w-4" />;
    case "submission":
      return <FileText className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

export function LogItem({ log, onClick }: LogItemProps) {
  return (
    <div
      onClick={() => onClick?.(log)}
      className={cn(
        "group relative p-4 border rounded-lg bg-white",
        "hover:shadow-md hover:border-primary/30 cursor-pointer",
        "transition-all duration-200"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="mt-0.5 text-muted-foreground group-hover:text-primary transition-colors">
          {getEntityIcon(log.entityType)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Action & Entity Type */}
          <div className="flex items-center gap-2 flex-wrap">
            <LogActionBadge action={log.action} />
            <Badge variant="outline" className="font-medium">
              {log.entityType}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              ID: {log.entityId}
            </span>
          </div>

          {/* Time & IP */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {/* formatDateTime handles locale display from ISO string */}
              <span className="font-medium">
                {formatDateTime(log.createdAt)}
              </span>
            </div>
            {log.ipAddress && (
              <div className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                <span className="font-mono text-xs">{log.ipAddress}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
