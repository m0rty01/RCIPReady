'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-indigo-700 dark:bg-indigo-600' : '';
  };

  return (
    <nav className="bg-indigo-600 dark:bg-indigo-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <img src="/globe.svg" alt="RCIP Ready Logo" className="h-8 w-8" />
              <span className="font-bold text-xl">RCIP Ready</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/jobs"
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors ${isActive('/jobs')}`}
            >
              Jobs
            </Link>
            <Link
              href="/documents"
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors ${isActive('/documents')}`}
            >
              Documents
            </Link>
            <Link
              href="/communities"
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors ${isActive('/communities')}`}
            >
              Communities
            </Link>
            <Link
              href="/process"
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors ${isActive('/process')}`}
            >
              Process
            </Link>
            <div className="ml-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}