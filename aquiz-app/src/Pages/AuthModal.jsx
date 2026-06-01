import React, { useState } from 'react';
import API_BASE_URL from './config'

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/login' : '/api/signup';
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify({ username: data.username, id: data.id }));
        onAuthSuccess(data.username);
        onClose();
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Server connection failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-deep-purple border border-glass-border p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 size-48 bg-electric-violet/20 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <button onClick={onClose} className="text-lavender-light/50 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {error && <p className="mb-4 text-red-400 text-sm bg-red-400/10 p-2 rounded-lg border border-red-400/20">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-lavender-light/50 mb-1 ml-1">Username</label>
              <input 
                type="text"
                required
                className="w-full p-4 rounded-xl bg-white/5 border border-glass-border text-white outline-none focus:border-electric-violet"
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-lavender-light/50 mb-1 ml-1">Password</label>
              <input 
                type="password"
                required
                className="w-full p-4 rounded-xl bg-white/5 border border-glass-border text-white outline-none focus:border-electric-violet"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button type="submit" className="w-full h-14 bg-neon-yellow text-deep-purple font-bold rounded-xl shadow-lg shadow-neon-yellow/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-6 text-sm text-lavender-light/60 hover:text-electric-violet transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;