'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function SignupForm({ dictionary }: { dictionary: any }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다.');
      }
      router.push(`/${locale}/login?signup=success`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = "mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm";
  const buttonStyle = "w-full px-4 py-2.5 text-base font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400";

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-gray-900">{dictionary.title}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">{dictionary.name}</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputStyle} />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">{dictionary.email}</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputStyle} />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">{dictionary.password}</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputStyle} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={isLoading} className={buttonStyle}>
            {isLoading ? dictionary.signingUp : dictionary.signupButton}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          {dictionary.hasAccount}{' '}
          <Link href={`/${locale}/login`} className="font-medium text-gray-800 hover:underline">
            {dictionary.loginLink}
          </Link>
        </p>
      </div>
    </main>
  );
}