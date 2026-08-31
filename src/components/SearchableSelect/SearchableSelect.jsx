import { useState, useRef, useEffect, useMemo } from 'react';
import './SearchableSelect.css';

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecciona una opción',
  searchPlaceholder = 'Buscar...',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const normalized = useMemo(
    () => (options || []).map((opt) => (typeof opt === 'object' ? opt : { value: opt, label: opt })),
    [options]
  );

  const selectedLabel = normalized.find((o) => String(o.value) === String(value))?.label ?? '';

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return normalized;
    return normalized.filter((o) => String(o.label).toLowerCase().includes(term));
  }, [normalized, search]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setSearch('');
      setHighlight(0);
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  useEffect(() => {
    setHighlight(0);
  }, [search]);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) handleSelect(opt.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  const isPlaceholder = !selectedLabel;
  const displayText = selectedLabel || placeholder;

  return (
    <div
      ref={wrapperRef}
      className={`searchable-select ${disabled ? 'searchable-select--disabled' : ''} ${open ? 'searchable-select--open' : ''}`}
    >
      <button
        type="button"
        className={`searchable-select__trigger ${isPlaceholder ? 'searchable-select__trigger--placeholder' : ''}`}
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {displayText}
      </button>
      <span className="searchable-select__icon">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 5l5 5 5-5" stroke={disabled ? '#c4cad4' : '#9b7ad4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      {open && (
        <div className="searchable-select__dropdown" role="dialog">
          <div className="searchable-select__search">
            <svg className="searchable-select__search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.25" stroke="#9b7ad4" strokeWidth="1.5" />
              <path d="M9.5 9.5L12 12" stroke="#9b7ad4" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="searchable-select__search-input"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <ul className="searchable-select__list" role="listbox">
            {filtered.length === 0 ? (
              <li className="searchable-select__empty">Sin resultados</li>
            ) : (
              filtered.map((opt, i) => {
                const isSelected = String(opt.value) === String(value);
                const isHighlighted = i === highlight;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    className={`searchable-select__item ${isSelected ? 'searchable-select__item--selected' : ''} ${isHighlighted ? 'searchable-select__item--highlighted' : ''}`}
                    onMouseEnter={() => setHighlight(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(opt.value)}
                  >
                    {opt.label}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
