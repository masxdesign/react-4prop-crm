import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Circle, User, CheckSquare, CreditCard, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import getAvatarImageUrl from '@/utils/getAvatarImageUrl';
import { getScheduleStatusDisplay } from '../util/scheduleStatusHelpers';

// Helper component for individual timeline steps
const TimelineStep = ({ 
  step, 
  isLast = false, 
  isCollapsed = false 
}) => {
  const { agent, timestamp, isFinished, label } = step;
  const [imageError, setImageError] = useState(false);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;
    try {
      const date = parseISO(timestamp);
      const timeStr = format(date, 'h:mmaaa');
      const relativeStr = formatDistanceToNow(date, { addSuffix: true });
      return `@${timeStr} (${relativeStr})`;
    } catch {
      return null;
    }
  };

  // Helper function to get agent initials
  const getAgentInitials = (firstname, surname) => {
    const firstInitial = firstname?.charAt(0)?.toUpperCase() || '';
    const lastInitial = surname?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  // Get avatar URL for tiny profile pic
  const getAgentAvatar = (agent) => {
    if (!agent) return null;
    const userForAvatar = { nid: agent.id, picture: agent.picture };
    return getAvatarImageUrl(userForAvatar, 'sm');
  };

  return (
    <div className={cn(
      "relative",
      !isLast && !isCollapsed && "pb-3"
    )}>
      {/* Connecting line */}
      {!isLast && !isCollapsed && (
        <div className="absolute left-2.5 top-5 w-0.5 h-full bg-gray-200" />
      )}
      
      <div className="flex items-start gap-2.5">
        {/* Status indicator */}
        <div className={cn(
          "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white relative z-10",
          step.id === 'cancelled' ? "bg-amber-500" :
            isFinished 
              ? "bg-green-500" 
              : "bg-gray-300"
        )}>
          {step.id === 'cancelled' ? (
            <X className="w-3 h-3" />
          ) : isFinished ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <Circle className="w-3 h-3" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Status label with timestamp */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className={cn(
              "font-medium text-xs leading-tight",
              isFinished ? "text-gray-900" : "text-gray-600"
            )}>
              {label}
            </div>
            {timestamp && !isCollapsed && (
              <div className="text-xs text-gray-500">
                {formatTimestamp(timestamp)}
              </div>
            )}
          </div>
          
          {/* Agent with tiny profile pic - expanded state */}
          {agent && !isCollapsed && (
            <div className="flex items-center gap-1.5 mt-0.5">
              {/* Tiny profile picture */}
              <div className="shrink-0 w-4 h-4 rounded-full overflow-hidden">
                {getAgentAvatar(agent) && !imageError ? (
                  <img
                    src={getAgentAvatar(agent)}
                    alt={`${agent.firstname} ${agent.surname}`}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                    {getAgentInitials(agent.firstname, agent.surname)}
                  </div>
                )}
              </div>
              {/* Agent name */}
              <div className="text-xs text-gray-700">
                {agent.firstname} {agent.surname}
              </div>
            </div>
          )}

          {/* Agent name - collapsed state (below status) */}
          {agent && isCollapsed && (
            <div className="text-xs text-gray-700 mt-0.5">
              {agent.firstname} {agent.surname}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WorkflowTimeline = ({ 
  schedule, 
  getUserByNid, 
  className,
  ...props 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Build timeline steps
  const getTimelineSteps = () => {
    const steps = [];

    // 1. Created step (always present)
    const creator = getUserByNid(schedule.agent_id);
    if (creator) {
      steps.push({
        id: 'created',
        agent: creator,
        timestamp: schedule.created_at,
        isFinished: true,
        label: 'Schedule Created',
        role: 'creator'
      });
    }

    // 2. Approval step (if approver assigned)
    const approver = getUserByNid(schedule.approver_id);
    if (approver) {
      steps.push({
        id: 'approved',
        agent: approver,
        timestamp: schedule.approved_at,
        isFinished: !!schedule.approved_at,
        label: schedule.approved_at ? 'Schedule Approved' : 'Pending Approval',
        role: 'approver'
      });
    }

    // 3. Subscription activation step (if payer assigned)
    const payer = getUserByNid(schedule.payer_id);
    if (payer) {
      const status = getScheduleStatusDisplay(schedule);
      let activatedLabel = 'Subscription Activated';
      let awaitingLabel = 'Awaiting Activation';
      
      // Adjust labels based on status
      if (status.label === 'Active') {
        activatedLabel = 'Payment Activated';
      } else if (status.label === 'Scheduled') {
        activatedLabel = 'Payment Ready';
      }

      steps.push({
        id: 'activated',
        agent: payer,
        timestamp: schedule.activated_at,
        isFinished: !!schedule.activated_at,
        label: schedule.activated_at ? activatedLabel : awaitingLabel,
        role: 'payer'
      });
    }

    if (schedule.cancelled_at) {
      steps.push({
        id: 'cancelled',
        // agent: getUserByNid(schedule.cancelled_by_id),
        label: 
          <div className='flex flex-col'>
            Schedule Cancelled 
            <span className='text-xs text-gray-700 font-normal'>
              {schedule.cancellation_reason}
            </span>
          </div>,
        timestamp: schedule.cancelled_at,
        isFinished: true,
      });
    }

    return steps;
  };

  const steps = getTimelineSteps();
  
  // Find the current/latest relevant step for collapsed view
  const getCurrentStep = () => {
    // Show the latest incomplete step, or the last completed step
    const incompleteStep = steps.find(step => !step.isFinished);
    return incompleteStep || steps[steps.length - 1];
  };

  const currentStep = getCurrentStep();

  if (steps.length === 0) {
    return (
      <div className="text-xs text-gray-500">No workflow</div>
    );
  }

  return (
    <div className={cn("", className)} {...props}>
      {isExpanded ? (
        // Expanded view - full timeline
        <div className="space-y-0">
          <button
            onClick={() => setIsExpanded(false)}
            className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-800 mb-3 transition-colors"
          >
            <ChevronUp className="w-3 h-3" />
            <span className="font-medium">Workflow Timeline</span>
          </button>
          
          <div className="ml-2">
            {steps.reverse().map((step, index) => (
              <TimelineStep
                key={step.id}
                step={step}
                isLast={index === steps.length - 1}
                isCollapsed={false}
              />
            ))}
          </div>
        </div>
      ) : (
        // Collapsed view - current step only
        <div>
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-start gap-2 text-xs hover:bg-gray-50 transition-colors w-full p-1 rounded -ml-1"
          >
            <ChevronDown className="w-3 h-3 shrink-0 mt-0.5 text-gray-400" />
            <div className="flex-1 text-left">
              <TimelineStep
                step={currentStep}
                isLast={true}
                isCollapsed={true}
              />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkflowTimeline;