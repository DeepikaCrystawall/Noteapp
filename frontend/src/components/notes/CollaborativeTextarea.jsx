import { useRef, useEffect, useState, useCallback } from 'react';
import { throttle } from '@/lib/utils';
import { getUserColor } from '@/lib/userColors';

const TEXTAREA_CLASS =
  'w-full flex-1 min-h-[50vh] resize-none border-none outline-none text-lg leading-relaxed p-0 m-0 bg-transparent text-[var(--color-foreground)] placeholder:text-[var(--color-on-surface-variant)]/60';

function measureCaret(textarea, position) {
  const style = window.getComputedStyle(textarea);
  const mirror = document.createElement('div');
  mirror.style.cssText = `
    position: absolute; visibility: hidden; top: 0; left: 0; overflow: hidden;
    white-space: pre-wrap; word-wrap: break-word; word-break: break-word;
    font: ${style.font};
    padding: ${style.padding};
    width: ${textarea.clientWidth}px;
    line-height: ${style.lineHeight};
    letter-spacing: ${style.letterSpacing};
    border: ${style.border};
    box-sizing: border-box;
  `;
  mirror.textContent = textarea.value.substring(0, position);
  const marker = document.createElement('span');
  marker.textContent = '\u200b';
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
  const { offsetTop, offsetLeft, offsetHeight } = marker;
  document.body.removeChild(mirror);
  return {
    top: offsetTop - textarea.scrollTop,
    left: offsetLeft - textarea.scrollLeft,
    height: offsetHeight || parseFloat(style.lineHeight) || 20,
  };
}

function RemoteCaret({ textarea, position, name, userId }) {
  const [coords, setCoords] = useState({ top: 0, left: 0, height: 20 });
  const color = getUserColor(userId);

  useEffect(() => {
    if (!textarea || position == null) return;

    const update = () => {
      try {
        setCoords(measureCaret(textarea, position));
      } catch {
        /* ignore */
      }
    };

    update();
    textarea.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      textarea.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [textarea, position, textarea?.value]);

  if (position == null) return null;

  return (
    <div
      className="absolute pointer-events-none z-20"
      style={{ top: coords.top, left: coords.left, height: coords.height }}
      title={name}
    >
      {name && (
        <span
          className="absolute -top-5 left-0 text-[10px] px-1.5 py-0.5 rounded text-white font-semibold whitespace-nowrap"
          style={{ backgroundColor: color.cursor }}
        >
          {name}
        </span>
      )}
      <div className="w-0.5 h-full animate-pulse" style={{ backgroundColor: color.cursor }} />
    </div>
  );
}

function ColoredTextMirror({ segments, placeholder, isEmpty }) {
  return (
    <div className={`${TEXTAREA_CLASS} whitespace-pre-wrap break-words`}>
      {isEmpty ? (
        <span className="text-[var(--color-muted-foreground)]">{placeholder}</span>
      ) : (
        segments.map((seg, i) => (
          <span
            key={`${seg.userId}-${i}`}
            style={{
              color: getUserColor(seg.userId).text,
              textDecoration: seg.modifiedBy ? 'underline dashed' : undefined,
              textUnderlineOffset: '3px',
            }}
            title={seg.modifiedBy ? `Modified by ${seg.modifiedByName}` : undefined}
          >
            {seg.text}
          </span>
        ))
      )}
    </div>
  );
}

export default function CollaborativeTextarea({
  value,
  segments,
  coloredByUser = false,
  onChange,
  onCursorChange,
  remoteCursors,
  currentUserId,
  placeholder,
  className,
  readOnly = false,
}) {
  const textareaRef = useRef(null);
  const mirrorScrollRef = useRef(null);
  const [textareaEl, setTextareaEl] = useState(null);
  const localColor = getUserColor(currentUserId);

  const emitCursor = useCallback(
    throttle(() => {
      const el = textareaRef.current;
      if (!el || !onCursorChange || readOnly) return;
      onCursorChange({
        start: el.selectionStart,
        end: el.selectionEnd,
      });
    }, 120),
    [onCursorChange, readOnly]
  );

  const syncScroll = (scrollTop) => {
    if (mirrorScrollRef.current) mirrorScrollRef.current.scrollTop = scrollTop;
  };

  const handleChange = (e) => {
    if (readOnly) return;
    onChange(e);
    emitCursor();
  };

  const handleSelect = () => emitCursor();

  const handleScroll = (e) => {
    syncScroll(e.target.scrollTop);
    emitCursor();
  };

  useEffect(() => {
    if (textareaEl && mirrorScrollRef.current) {
      mirrorScrollRef.current.scrollTop = textareaEl.scrollTop;
    }
  }, [textareaEl, value]);

  const layerClass = className || TEXTAREA_CLASS;
  const displaySegments = segments?.length
    ? segments
    : (value ? [{ userId: currentUserId, name: '', text: value }] : []);

  if (coloredByUser && readOnly) {
    return (
      <div className={`relative w-full min-h-[60vh] overflow-auto ${layerClass}`}>
        <ColoredTextMirror
          segments={displaySegments}
          placeholder={placeholder}
          isEmpty={!value}
        />
      </div>
    );
  }

  if (!coloredByUser) {
    if (readOnly) {
      return (
        <div className={`${layerClass} whitespace-pre-wrap break-words min-h-[60vh]`}>
          {value || <span className="text-[var(--color-muted-foreground)]">{placeholder}</span>}
        </div>
      );
    }

    return (
      <div className="relative w-full min-h-[60vh]">
        <div className="absolute inset-0 pointer-events-none overflow-visible z-10" aria-hidden>
          {textareaEl && Object.entries(remoteCursors).map(([userId, data]) => {
            if (userId === currentUserId) return null;
            const pos = data.position?.start ?? data.position;
            return (
              <RemoteCaret
                key={`caret-${userId}`}
                textarea={textareaEl}
                position={typeof pos === 'number' ? pos : null}
                name={data.name}
                userId={userId}
              />
            );
          })}
        </div>
        <textarea
          ref={(el) => {
            textareaRef.current = el;
            setTextareaEl(el);
          }}
          value={value}
          onChange={handleChange}
          onSelect={handleSelect}
          onKeyUp={handleSelect}
          onClick={handleSelect}
          onScroll={handleSelect}
          placeholder={placeholder}
          className={`${layerClass} relative z-[1]`}
          spellCheck
        />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[60vh]">
      <div
        ref={mirrorScrollRef}
        className="absolute inset-0 overflow-hidden pointer-events-none z-0"
        aria-hidden
      >
        <ColoredTextMirror
          segments={displaySegments}
          placeholder={placeholder}
          isEmpty={!value}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-visible z-10" aria-hidden>
        {textareaEl && Object.entries(remoteCursors).map(([userId, data]) => {
          if (userId === currentUserId) return null;
          const pos = data.position?.start ?? data.position;
          return (
            <RemoteCaret
              key={`caret-${userId}`}
              textarea={textareaEl}
              position={typeof pos === 'number' ? pos : null}
              name={data.name}
              userId={userId}
            />
          );
        })}
      </div>

      <textarea
        ref={(el) => {
          textareaRef.current = el;
          setTextareaEl(el);
        }}
        value={value}
        onChange={handleChange}
        onSelect={handleSelect}
        onKeyUp={handleSelect}
        onClick={handleSelect}
        onScroll={handleScroll}
        placeholder=""
        className={`${layerClass} relative z-[1]`}
        style={{
          color: 'transparent',
          caretColor: localColor.cursor,
          WebkitTextFillColor: 'transparent',
        }}
        spellCheck
      />
    </div>
  );
}
