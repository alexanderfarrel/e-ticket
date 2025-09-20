import { useEffect, useState } from "react";

const useWindowWidth = () => {
  const isClient = typeof window === "object";
  const [windowWidth, setWindowWidth] = useState(
    isClient ? window.innerWidth : 0
  );

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    if (!isClient) {
      return;
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isClient]);

  return windowWidth;
};

export default useWindowWidth;
