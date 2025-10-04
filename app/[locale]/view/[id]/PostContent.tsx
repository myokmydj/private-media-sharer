// app/[locale]/view/[id]/PostContent.tsx (덮어쓰기)
'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import type { Pluggable } from 'unified';
import type { Post } from '@/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation'; // useParams 추가
import { Edit, Trash2, Tag } from 'lucide-react';

export default function PostContent({ post }: { post: Post }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams(); // params 훅 사용
  const locale = params.locale; // locale 가져오기
  const isAuthor = session && (session.user as any).id === String(post.user_id);

  const articleStyle = {
    letterSpacing: post.letter_spacing || 'normal',
    lineHeight: post.line_height || '1.75',
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '삭제에 실패했습니다.');
      }
      alert('포스트가 삭제되었습니다.');
      // ▼▼▼ [수정] router.push에 locale 추가 ▼▼▼
      router.push(`/${locale}/my-posts`);
    } catch (error: any) {
      alert(`오류: ${error.message}`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Meta Section */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="border border-black bg-white p-4">
            <h1 className={`text-3xl font-serif font-extrabold ${post.font_family}`}>{post.title}</h1>
          </div>
          <div className="border border-black bg-white p-4 font-mono text-xs space-y-2">
            <p className="text-gray-500">AUTHOR:</p>
            {/* ▼▼▼ [수정] Link에 locale 추가 ▼▼▼ */}
            <Link href={`/${locale}/profile/${post.user_id}`} className="block font-semibold text-black hover:underline">{post.author_name}</Link>
            <p className="text-gray-500">PUBLISHED:</p>
            <p>{new Date(post.created_at).toLocaleString()}</p>
          </div>
          {post.tags && (
            <div className="border border-black bg-white p-4">
              <h3 className="font-mono text-xs text-gray-500 mb-2">TAGS:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, i) => (
                  <span key={i} className="text-xs font-semibold bg-gray-100 border border-gray-300 px-2 py-1 flex items-center gap-1">
                    <Tag size={12}/> {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {isAuthor && (
            <div className="border border-black bg-white p-2 flex items-center justify-end gap-2">
              {/* ▼▼▼ [수정] Link에 locale 추가 ▼▼▼ */}
              <Link href={`/${locale}/edit/${post.id}`} className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors" title="수정">
                <Edit size={16} />
              </Link>
              <button onClick={handleDelete} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors" title="삭제">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </aside>

        {/* Right Content Section */}
        <div className="lg:col-span-8 border border-black bg-white min-h-[60vh]">
          <div className="p-6 sm:p-10">
            {!isClient && <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>}
            
            {isClient && (
              <article
                className={`prose lg:prose-lg max-w-none ${post.font_family || 'font-freesentation'}`}
                style={articleStyle}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks] as Pluggable[]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    'img': ({ ...props }) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img {...props} style={{ maxWidth: '100%', height: 'auto' }} alt="" />
                    )
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}