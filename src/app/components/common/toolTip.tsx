import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export function Tooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (visible && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2,
      });
    }
  }, [visible]);

  return (
    <>
      <span
        ref={ref}
        className="relative cursor-pointer text-orange-500 text-[14px]"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </span>
      {visible &&
        createPortal(
          <div
            className="absolute bg-gray-700 text-white text-xs px-2 py-1 rounded-md
                       whitespace-nowrap pointer-events-none z-[9999]
                       transition-opacity duration-150 after:content-[''] after:absolute 
                       after:top-full after:left-1/2 after:-translate-x-1/2 
                       after:border-4 after:border-transparent after:border-t-gray-700"
            style={{
              top: coords.top,
              left: coords.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            {label}
          </div>,
          document.body
        )}
    </>
  );
}
