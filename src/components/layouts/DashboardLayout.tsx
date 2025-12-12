'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, LayoutDashboard, Bookmark, Shield, Home } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-white">Surecapta</h1>
              
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                
                <Link
                  href="/saved-bets"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
                >
                  <Bookmark size={18} />
                  <span>Apostas Salvas</span>
                </Link>
                
                <Link
                  href="/bookmakers"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
                >
                  <Home size={18} />
                  <span>Casas</span>
                </Link>
                
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-yellow-500 hover:bg-gray-800 transition"
                  >
                    <Shield size={18} />
                    <span>Admin</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
              >
                <LogOut size={18} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
