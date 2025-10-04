'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm({ dictionary }: { dictionary: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale;
  const callbackUrl = searchParams.get('callbackUrl') || `/${locale}`;
  const signupSuccess = searchParams.get('signup') === 'success';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(dictionary.error);
      setIsLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  const inputStyle = "mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm";
  const buttonStyle = "w-full px-4 py-2.5 text-base font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400";

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-gray-900">{dictionary.title}</h1>
        {signupSuccess && (
          <p className="text-sm text-center text-green-700 bg-green-50 p-3 rounded-md border border-green-200">
            {dictionary.signupSuccess}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
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
            {isLoading ? dictionary.loggingIn : dictionary.loginButton}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          {dictionary.noAccount}{' '}
          <Link href={`/${locale}/signup`} className="font-medium text-gray-800 hover:underline">
            {dictionary.signupLink}
          </Link>
        </p>
      </div>
    </main>
  );
}