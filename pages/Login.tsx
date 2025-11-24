import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { Button } from '../components/Button';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = storageService.login(email);
    if (user) {
      if (user.role === UserRole.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } else {
      setError('User not found. Please register first.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access your papers</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </div>
          
          <div className="flex items-center justify-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <Link to="/register" className="ml-1 font-medium text-indigo-600 hover:text-indigo-500">
              Register here
            </Link>
          </div>

           <div className="mt-6 border-t pt-6">
            <p className="text-xs text-center text-gray-400 uppercase tracking-wider mb-4">Demo Accounts</p>
            <div className="flex gap-2 justify-center">
                <button type="button" onClick={() => setEmail('admin@edu.com')} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-gray-600">Admin</button>
                <button type="button" onClick={() => setEmail('student@edu.com')} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-gray-600">Student</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};