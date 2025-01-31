import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAdmin(!!session);
    };
    checkAuth();
  }, [supabase.auth]);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold text-blue-600 transition-colors hover:text-blue-700"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-8"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M4 14h6m-6-4h16M4 18h16m-6-8h6"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>Pipe Puzzle</span>
          </Link>

          <nav className="flex items-center space-x-4">
            <Link
              href="/"
              className={`
                rounded-md px-4 py-2 text-sm font-medium transition-all
                ${
                  pathname === "/"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              Game
            </Link>

            {isAdmin ? (
              <Link
                href="/admin"
                className={`
                  rounded-md px-4 py-2 text-sm font-medium transition-all
                  ${
                    pathname?.startsWith("/admin")
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                Admin
              </Link>
            ) : (
              <Link
                href="/login"
                className={`
                  rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600
                  ${pathname === "/login" && "bg-blue-600"}
                `}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
