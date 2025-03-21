import  { useState, useEffect } from "react";

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e:MouseEvent) => {
      setTargetPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const animateCursor = () => {
      setPosition((prev) => ({
        x: prev.x + (targetPosition.x - prev.x) * 0.2,
        y: prev.y + (targetPosition.y - prev.y) * 0.2,
      }));
    };

    const animationFrame = requestAnimationFrame(animateCursor);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetPosition]);

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="w-2 h-2 bg-primary rounded-full opacity-70"></div>
    </div>
  );
};
