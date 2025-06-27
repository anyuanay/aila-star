'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }
    // Wait 500ms for session to be established
    setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role === 'instructor') {
          router.push('/instructor');
        } else if (profile?.role === 'student') {
          router.push('/student');
        } else {
          router.push('/');
        }
      }
      setLoading(false);
    }, 500);
  };

  const handleSocial = (provider) => {
    alert(`Social login with ${provider} is not enabled yet.`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleEmailLogin}
        className="bg-white p-8 rounded-xl shadow w-full max-w-md flex flex-col"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome back</h2>
        <input
          type="email"
          placeholder="Email address"
          className="w-full px-4 py-3 mb-4 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 mb-4 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-full mb-3 font-semibold text-lg transition hover:bg-gray-900"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Continue'}
        </button>
        <div className="text-center mb-2 text-gray-700">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-600 underline">
            Sign up
          </a>
        </div>
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-400">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>
        <button
          type="button"
          className="w-full flex items-center justify-start bg-white border border-gray-200 py-3 px-4 rounded-full mb-2 hover:bg-gray-50 opacity-60 cursor-not-allowed"
          onClick={() => handleSocial('Google')}
          disabled
        >
          <img src="/google-icon.svg" alt="Google" className="h-5 w-5 mr-3" />
          Continue with Google
        </button>
        <button
          type="button"
          className="w-full flex items-center justify-start bg-white border border-gray-200 py-3 px-4 rounded-full mb-2 hover:bg-gray-50 opacity-60 cursor-not-allowed"
          onClick={() => handleSocial('Microsoft')}
          disabled
        >
          <img src="/microsoft-icon.svg" alt="Microsoft" className="h-5 w-5 mr-3" />
          Continue with Microsoft Account
        </button>
        <button
          type="button"
          className="w-full flex items-center justify-start bg-white border border-gray-200 py-3 px-4 rounded-full mb-2 hover:bg-gray-50 opacity-60 cursor-not-allowed"
          onClick={() => handleSocial('Apple')}
          disabled
        >
          <img src="/apple-icon.svg" alt="Apple" className="h-5 w-5 mr-3" />
          Continue with Apple
        </button>
        <button
          type="button"
          className="w-full flex items-center justify-start bg-white border border-gray-200 py-3 px-4 rounded-full hover:bg-gray-50 opacity-60 cursor-not-allowed"
          onClick={() => handleSocial('Phone')}
          disabled
        >
          <svg className="h-5 w-5 mr-3 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm12-12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 12a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          Continue with phone
        </button>
      </form>
    </div>
  );
}
