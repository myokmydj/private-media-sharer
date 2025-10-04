'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function NewMemoForm({ dictionary }: { dictionary: any }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [spoilerIcon, setSpoilerIcon] = useState('🔑');
  const [visibility, setVisibility] = useState('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setGeneratedLink('');

    try {
      const res = await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          spoiler_icon: spoilerIcon,
          visibility,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '메모 생성 실패');
      setGeneratedLink(data.url);
      setContent('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonStyle = "w-full px-4 py-2.5 text-base font-semibold text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400";

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl border border-gray-200">
        <h1 className="text-2xl font-black text-center text-gray-900 mb-6">{dictionary.title}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">{dictionary.contentLabel}</label>
            <textarea
              id="content"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="block w-full text-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder={dictionary.contentPlaceholder}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="spoilerIcon" className="block text-sm font-medium text-gray-700 mb-1">{dictionary.spoilerIconLabel}</label>
              <select
                id="spoilerIcon"
                value={spoilerIcon}
                onChange={(e) => setSpoilerIcon(e.target.value)}
                className="block w-full text-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                <option value="🔑">{dictionary.iconKey}</option>
                <option value="🔞">{dictionary.icon18}</option>
                <option value="🔥">{dictionary.iconFire}</option>
              </select>
            </div>
            <div>
              <h4 className="block text-sm font-medium text-gray-700 mb-2">{dictionary.visibilityLabel}</h4>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <label className="flex items-center space-x-2"><input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={(e) => setVisibility(e.target.value)} className="h-4 w-4" /> <span className="text-sm">{dictionary.visibilityPublic}</span></label>
                <label className="flex items-center space-x-2"><input type="radio" name="visibility" value="followers_only" checked={visibility === 'followers_only'} onChange={(e) => setVisibility(e.target.value)} className="h-4 w-4" /> <span className="text-sm">{dictionary.visibilityFollowers}</span></label>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className={buttonStyle}>
            {isSubmitting ? dictionary.creatingButton : dictionary.createButton}
          </button>
        </form>
        {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
        {generatedLink && (<div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded-md"><p className="text-sm font-medium text-gray-800">{dictionary.successMessage}</p><a href={generatedLink} target="_blank" rel="noopener noreferrer" className="block mt-1 text-sm text-gray-900 font-semibold break-all hover:underline">{generatedLink}</a></div>)}
      </div>
    </main>
  );
}