import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Pipe Puzzle
          </Link>

          <nav className="flex space-x-4">
            <Link
              href="/"
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                pathname === "/"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Game
            </Link>
            <Link
              href="/admin"
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                isAdmin
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
