import { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  maxLength: number;
  value: string;
}

const TextArea = ({ id, maxLength, value, style, ...props }: TextAreaProps) => {
  return (
    <div style={{ position: 'relative' }}>
      <textarea
        id={id}
        maxLength={maxLength}
        value={value}
        style={{ ...style, paddingBottom: '24px' }}
        {...props}
      />
      <span style={{
        position: 'absolute',
        bottom: '8px',
        right: '10px',
        fontSize: '11px',
        color: value.length >= maxLength ? 'var(--color-error)' : 'var(--text-placeholder)',
        pointerEvents: 'none',
      }}>
        {value.length}/{maxLength}
      </span>
    </div>
  );
};

export default TextArea;
