import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (username: string) => void;
}
interface LoginResponse {
  loginUser: {
    token: string;
    user: {
      _id: string;
      username: string;
    };
  };
}

interface RegisterResponse {
  registerUser: {
    _id: string;
    username: string;
  };
}
interface ClaimResponse {
claimer: {
  _id:string;
  totalPoints:number;
}
}
const CLAIM_SCORES_MUTATION = gql`
  mutation ClaimScores($scoreIds: [ID!]!) {
    claimScores(scoreIds: $scoreIds) {
      _id
      totalPoints
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    loginUser(username: $username, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!) {
    registerUser(username: $username, password: $password) {
      _id
      username
    }
  }
`;

const AuthModal = ({ isOpen, onClose, onAuthSuccess }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const [loginUser, { loading: loginLoading }] = useMutation<LoginResponse>(LOGIN_MUTATION);
  const [registerUser, { loading: registerLoading }] = useMutation<RegisterResponse>(REGISTER_MUTATION);
  const [claimScores, { loading: claimScoresLoading }] = useMutation<RegisterResponse>(CLAIM_SCORES_MUTATION);
  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setError('');

    try {
    if (isLogin) {
      const { data } = await loginUser({ variables: formData });
      if (data) {
        const { token, user } = data.loginUser;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ username: user.username, id: user._id }));
        
        onAuthSuccess(user.username);
        onClose();
      }
      const unclaimed = JSON.parse(localStorage.getItem('unclaimed_scores') || '[]');
if (unclaimed.length > 0) {
    try {
        await claimScores({ variables: { scoreIds: unclaimed } });
        localStorage.removeItem('unclaimed_scores');
    } catch (claimErr) {
        console.error("Failed to merge guest scores:", claimErr);
    }
}
    } else {
       await registerUser({ variables: formData });
      
      const { data } = await loginUser({ variables: formData });
      
      if (data) {
        const { token, user } = data.loginUser;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ username: user.username, id: user._id }));
        
        onAuthSuccess(user.username);
        onClose();
      }
    }
  } catch (err: any) {
    setError(err.message || 'Server connection failed');
  }
};

  const isProcessing = loginLoading || registerLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-deep-purple border border-glass-border p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 size-48 bg-electric-violet/20 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
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

            <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full h-14 bg-neon-yellow text-deep-purple font-bold rounded-xl shadow-lg shadow-neon-yellow/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>

          <button 
            type="button"
            onClick={() => {
                setIsLogin(!isLogin);
                setError('');
            }}
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