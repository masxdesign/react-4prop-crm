import { useRef, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';

// Auto-resizing textarea component
export default function AutoResizeTextarea({ value, onChange, minRows = 3, ...props }) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleChange = (e) => {
    onChange(e);
    adjustHeight();
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      rows={minRows}
      className="resize-none overflow-hidden"
      {...props}
    />
  );
}
