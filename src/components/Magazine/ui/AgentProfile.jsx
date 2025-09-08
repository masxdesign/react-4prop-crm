import React from 'react';
import { CheckCircle, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import getAvatarImageUrl from '@/utils/getAvatarImageUrl';
import ImageWithFallback from '@/components/ui/ImageWithFallback';


const AgentProfile = ({
  user,
  role, // "approver" | "payer"
  size = "sm",
  showCompany = false,
  showRoleIcon = true,
  className,
  ...props
}) => {

  if (!user) return null;

  // Map user.id to user.nid for getAvatarImageUrl compatibility
  const userForAvatar = {
    nid: user.id,
    picture: user.picture
  };

  const avatarUrl = getAvatarImageUrl(userForAvatar, size);
  const fullName = `${user.firstname} ${user.surname}`;

  // Role icon mapping
  const roleIcons = {
    approver: CheckCircle,
    payer: CreditCard
  };

  const roleColors = {
    approver: 'text-green-600',
    payer: 'text-blue-600'
  };

  const RoleIcon = roleIcons[role];

  return (
    <div 
      className={cn(
        "flex items-center gap-2",
        size === "sm" ? "text-xs" : "text-sm",
        className
      )}
      {...props}
    >
      {/* Profile Picture / Avatar */}
      <div className={cn(
        "flex-shrink-0 rounded-full overflow-hidden",
        size === "sm" ? "w-6 h-6" : "w-8 h-8"
      )}>
        <ImageWithFallback
          src={avatarUrl}
          alt={fullName}
          className="w-full h-full object-cover"
          fallback={
            <div className={cn(
              "w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium",
              size === "sm" ? "text-xs" : "text-sm"
            )}>
              {user.firstname?.charAt(0)?.toUpperCase() || ''}{user.surname?.charAt(0)?.toUpperCase() || ''}
            </div>
          }
        />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className={cn(
          "font-medium text-gray-900 truncate",
          size === "sm" ? "text-xs" : "text-sm"
        )}>
          {fullName}
        </div>
        {showCompany && user.company && (
          <div className={cn(
            "text-gray-600 truncate",
            size === "sm" ? "text-xs" : "text-xs"
          )}>
            {user.company}
          </div>
        )}
      </div>

      {/* Role Icon */}
      {RoleIcon && showRoleIcon && (
        <div className={cn(
          "flex-shrink-0",
          roleColors[role] || "text-gray-600"
        )}>
          <RoleIcon className={cn(
            size === "sm" ? "w-4 h-4" : "w-5 h-5"
          )} />
        </div>
      )}
    </div>
  );
};

export default AgentProfile;