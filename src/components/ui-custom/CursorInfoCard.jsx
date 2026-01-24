import { createPortal } from 'react-dom';

const OFFSET_X = 15; // pixels from cursor
const OFFSET_Y = 15;

/**
 * Cursor-following info card component
 * Renders a floating card that follows the mouse cursor via portal
 * With screen-edge awareness to prevent clipping
 *
 * @param {boolean} visible - Whether to show the card
 * @param {number} x - Mouse X position (clientX)
 * @param {number} y - Mouse Y position (clientY)
 * @param {number} [minWidth=200] - Minimum width of the tooltip in pixels
 * @param {number} [edgePadding=10] - Minimum distance from screen edges in pixels
 * @param {React.ReactNode} children - Content to display in the card
 */
export function CursorInfoCard({ visible, x, y, minWidth = 200, edgePadding = 10, children }) {
  if (!visible || !children) return null;

  // Calculate position with screen-edge awareness
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

  // Check if tooltip would overflow right edge using minWidth
  const wouldOverflowRight = x + OFFSET_X + minWidth + edgePadding > viewportWidth;

  // Position tooltip to the left of cursor if it would overflow right
  const left = wouldOverflowRight
    ? Math.max(edgePadding, x - OFFSET_X - minWidth)
    : x + OFFSET_X;

  // Calculate maxWidth to ensure tooltip never exceeds right edge with padding
  const maxWidth = viewportWidth - left - edgePadding;

  // Check if tooltip would overflow bottom edge (estimate ~60px height)
  const estimatedHeight = 60;
  const wouldOverflowBottom = y + OFFSET_Y + estimatedHeight + edgePadding > viewportHeight;

  // Position tooltip above cursor if it would overflow bottom
  const top = wouldOverflowBottom
    ? Math.max(edgePadding, y - OFFSET_Y - estimatedHeight)
    : y + OFFSET_Y;

  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left,
        top,
        minWidth,
        maxWidth,
        transform: 'translate(0, 0)', // GPU acceleration hint
      }}
    >
      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-pre-wrap">
        {children}
      </div>
    </div>,
    document.body
  );
}

export default CursorInfoCard;
