import { useRef, useEffect, useState, type ReactNode } from "react";

type ScaledCardWrapperProps = {
  children: ReactNode;
};

export function ScaledCardWrapper({ children }: ScaledCardWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function updateScale() {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setScale(containerWidth / 1080);
      }
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // 9/16 aspect ratio
  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: 420,
        aspectRatio: "9/16",
        margin: "0 auto",
        position: "relative",
      }}
      className="bg-transparent"
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
