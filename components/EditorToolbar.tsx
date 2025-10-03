// components/EditorToolbar.tsx (덮어쓰기)
'use client';

import React, { RefObject } from 'react';
import { Bold, Italic, AlignCenter, AlignRight, AlignJustify, Superscript, Subscript } from 'lucide-react';

interface EditorToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement>;
  setContent: (value: string | ((prev: string) => string)) => void;
}

const ToolbarButton = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-2 rounded-md text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors"
  >
    {children}
  </button>
);

export default function EditorToolbar({ textareaRef, setContent }: EditorToolbarProps) {
  const applyTag = (tag: 'b' | 'i' | 'sup' | 'sub') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (!selectedText) { // 선택된 텍스트가 없을 경우
        const placeholder = '텍스트';
        const newText = `${textarea.value.substring(0, start)}<${tag}>${placeholder}</${tag}>${textarea.value.substring(end)}`;
        setContent(newText);
        // placeholder 선택
        setTimeout(() => textarea.setSelectionRange(start + tag.length + 2, start + tag.length + 2 + placeholder.length), 0);
        return;
    }

    // 토글 로직: 선택된 텍스트가 이미 해당 태그로 감싸져 있는지 확인
    const wrapperRegex = new RegExp(`^<${tag}>([\\s\\S]*?)<\\/${tag}>$`);
    const match = selectedText.match(wrapperRegex);

    let newText;
    if (match) { // 태그가 있으면 제거 (unwrap)
      newText = `${textarea.value.substring(0, start)}${match[1]}${textarea.value.substring(end)}`;
    } else { // 태그가 없으면 추가 (wrap)
      newText = `${textarea.value.substring(0, start)}<${tag}>${selectedText}</${tag}>${textarea.value.substring(end)}`;
    }
    setContent(newText);
  };

  const applyAlignment = (align: 'center' | 'right' | 'justify') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    let selectedText = textarea.value.substring(start, end);
    if (!selectedText) selectedText = "정렬할 텍스트";

    // 정렬은 토글하지 않고 항상 새로 적용
    const newText = `${textarea.value.substring(0, start)}<p style="text-align: ${align};">${selectedText}</p>${textarea.value.substring(end)}`;
    setContent(newText);
  };

  return (
    <div className="flex items-center flex-wrap gap-1 p-1 bg-gray-100 border border-b-0 border-gray-200 rounded-t-md">
      <ToolbarButton onClick={() => applyTag('b')}><Bold size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => applyTag('i')}><Italic size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => applyTag('sup')}><Superscript size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => applyTag('sub')}><Subscript size={16} /></ToolbarButton>
      <div className="w-px h-5 bg-gray-300 mx-1"></div>
      <ToolbarButton onClick={() => applyAlignment('center')}><AlignCenter size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => applyAlignment('right')}><AlignRight size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => applyAlignment('justify')}><AlignJustify size={16} /></ToolbarButton>
    </div>
  );
}