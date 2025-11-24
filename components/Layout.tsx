import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { UserRole } from '../types';
import { LogOut, BookOpen, UserCircle, LayoutDashboard, Settings } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = storageService.getCurrentUser();

  const handleLogout = () => {
    storageService.logout();
    navigate('/login');
  };

  if (location.pathname === '/login' || location.pathname === '/register') {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-indigo-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">EduVault</span>
            </div>

            {/* Navigation Links */}
            {user && user.role === UserRole.ADMIN && (
              <nav className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <Link 
                  to="/admin" 
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    location.pathname === '/admin' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/admin/courses" 
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    location.pathname === '/admin/courses' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                >
                  Curriculum
                </Link>
              </nav>
            )}

            {/* User Profile & Logout */}
            <div className="flex items-center gap-6">
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.role}</div>
                  </div>
                  <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <UserCircle className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              )}
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};