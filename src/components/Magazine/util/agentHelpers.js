import getAvatarImageUrl from '@/utils/getAvatarImageUrl';

/**
 * Helper function to get agent initials from firstname and surname
 * @param {string} firstname - Agent's first name
 * @param {string} surname - Agent's surname
 * @returns {string} Two-character initials (e.g., "JD")
 */
export const getAgentInitials = (firstname, surname) => {
  const firstInitial = firstname?.charAt(0)?.toUpperCase() || '';
  const lastInitial = surname?.charAt(0)?.toUpperCase() || '';
  return `${firstInitial}${lastInitial}`;
};

/**
 * Get avatar URL for agent profile picture
 * @param {Object} agent - Agent object with id and picture properties
 * @param {string} size - Size parameter for avatar ('sm', 'md', 'lg')
 * @returns {string|null} Avatar URL or null if not available
 */
export const getAgentAvatar = (agent, size = 'sm') => {
  if (!agent) return null;
  const userForAvatar = { nid: agent.id, picture: agent.picture };
  return getAvatarImageUrl(userForAvatar, size);
};

/**
 * Get agent's full name from firstname and surname
 * @param {Object} agent - Agent object with firstname and surname
 * @returns {string} Full name or fallback
 */
export const getAgentFullName = (agent) => {
  if (!agent) return 'Unknown Agent';
  if (agent.firstname && agent.surname) {
    return `${agent.firstname} ${agent.surname}`;
  }
  if (agent.firstname) return agent.firstname;
  if (agent.surname) return agent.surname;
  return `Agent ${agent.id || 'Unknown'}`;
};