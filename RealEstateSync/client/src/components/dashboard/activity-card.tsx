import { Activity } from "@shared/schema";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  Search, 
  Eye, 
  Bell,
  Activity as ActivityIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  // Format activity time
  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });
  
  // Determine icon and message based on activity type
  const getActivityDetails = () => {
    switch (activity.type) {
      case "favorite":
        return {
          icon: <Heart className="text-primary" size={18} />,
          bgColor: "bg-primary-50",
          title: activity.details?.action === "added" 
            ? "You saved a property to favorites" 
            : "You removed a property from favorites",
          description: activity.details?.address || "Property"
        };
      case "search":
        return {
          icon: <Search className="text-primary" size={18} />,
          bgColor: "bg-primary-50",
          title: "You created a new search",
          description: activity.details?.name || "Search criteria"
        };
      case "view":
        return {
          icon: <Eye className="text-primary" size={18} />,
          bgColor: "bg-primary-50",
          title: "You viewed a property",
          description: activity.details?.address || "Property details"
        };
      case "alert":
        return {
          icon: <Bell className="text-primary" size={18} />,
          bgColor: "bg-primary-50",
          title: "New property matches your search",
          description: activity.details?.matches 
            ? `${activity.details.matches} properties match your criteria` 
            : "New matching properties"
        };
      default:
        return {
          icon: <ActivityIcon className="text-primary" size={18} />,
          bgColor: "bg-primary-50",
          title: "Activity recorded",
          description: ""
        };
    }
  };
  
  const { icon, bgColor, title, description } = getActivityDetails();
  
  return (
    <div className="p-4 border-b border-neutral-200 flex items-center">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mr-3", bgColor)}>
        {icon}
      </div>
      <div className="flex-1">
        <p>{title}</p>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      <p className="text-sm text-neutral-500">{timeAgo}</p>
    </div>
  );
}
