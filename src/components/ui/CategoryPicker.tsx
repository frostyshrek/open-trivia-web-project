import React, { useEffect, useRef, useState } from 'react';
import 'src/css/components/CategoryPicker.css';
import { Body1 } from '../presets/Typography';

type Option = { label: string; value: number };

interface Props {
  label?: string;
  value: number;
  options: Option[];
  onChange: (value: number) => void;
}

const CategoryPicker: React.FC<Props> = ({ label = 'Category', value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value)?.label ?? 'Select…';

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className="cp-root" ref={rootRef}>
      {label && <Body1 className="cp-label">{label}</Body1>}

      <button type="button" className="cp-button" onClick={() => setOpen((v) => !v)}>
        <span className="cp-value">{selected}</span>
        <span className={`cp-chevron ${open ? 'open' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="cp-menu" role="listbox">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`cp-item ${opt.value === value ? 'active' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPicker;
