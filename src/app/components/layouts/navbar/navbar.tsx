"use client";
import { signOut } from "next-auth/react";
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import useWindowWidth from "../../utils/useWindowWidth";
import Image from "next/image";

export default function Navbar({
  isFixHeight = false,
  isAdmin = false,
  name,
}: {
  isFixHeight?: boolean;
  isAdmin?: boolean;
  name?: string;
}) {
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const path = usePathname();
  const router = useTransitionRouter();
  const windowWidth = useWindowWidth();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;
  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-[3.5rem] transition-all duration-500 z-50 ${
        scrollY > 0 ? "shadow-xl backdrop-blur-sm" : "shadow-none"
      } ${isFixHeight && "shadow-xl backdrop-blur-sm"} bg-linear-to-b`}
    >
      <div className="w-full h-full flex justify-between px-7 items-center text-xl text-orange-300">
        {isAdmin ? (
          <h1
            className="font-bold cursor-pointer"
            onClick={() => {
              if (path == "/admin") return;
              router.push("/admin", {
                onTransitionReady: PageAnimation,
              });
            }}
          >
            Admin Panel
          </h1>
        ) : (
          <Image
            className="font-bold cursor-pointer"
            onClick={() => {
              if (path == "/") return;
              router.push("/", {
                onTransitionReady: PageAnimation,
              });
            }}
            src="/images/smasa.webp"
            alt="logo smasa"
            width={40}
            height={50}
          ></Image>
        )}
        <div>
          {isAdmin ? (
            <div className="flex gap-3 items-center text-blue-400">
              {name && (
                <p
                  className={`text-md ${
                    windowWidth <= 400
                      ? "max-w-[70px] truncate"
                      : "max-w-[500px] truncate"
                  }`}
                >
                  {name}
                </p>
              )}
              <button
                className="bg-orange-200 p-1 px-4 rounded-md text-orange-500 text-[16px] cursor-pointer hover:bg-orange-200/70"
                onClick={() =>
                  signOut({
                    callbackUrl: "/auth/login",
                  })
                }
              >
                Logout
              </button>
            </div>
          ) : (
            <h1 className="font-semibold">BHIMACREW</h1>
          )}
        </div>
      </div>
    </nav>
  );
}

const PageAnimation = () => {
  document.documentElement.animate(
    [
      {
        transform: `translateY(0)`,
      },
      {
        transform: `translateY(100%)`,
      },
    ],
    {
      duration: 1000,
      easing: "cubic-bezier(0.76, 0, 0.24, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    }
  );

  document.documentElement.animate(
    [
      {
        transform: `translateY(-100%)`,
      },
      {
        transform: `translateY(0)`,
      },
    ],
    {
      duration: 1000,
      easing: "cubic-bezier(0.76, 0, 0.24, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    }
  );
};
