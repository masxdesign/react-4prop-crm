import { createPortal } from 'react-dom';

const OFFSET_X = 15; // pixels from cursor
const OFFSET_Y = 15;

/**
 * Cursor-following info card component
 * Renders a floating card that follows the mouse cursor via portal
 *
 * @param {boolean} visible - Whether to show the card
 * @param {number} x - Mouse X position (clientX)
 * @param {number} y - Mouse Y position (clientY)
 * @param {React.ReactNode} children - Content to display in the card
 */
export function CursorInfoCard({ visible, x, y, children }) {
  if (!visible || !children) return null;

  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: x + OFFSET_X,
        top: y + OFFSET_Y,
        transform: 'translate(0, 0)', // GPU acceleration hint
      }}
    >
      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-xs whitespace-pre-wrap">
        {children}
      </div>
    </div>,
    document.body
  );
}

export default CursorInfoCard;
