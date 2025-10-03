// types/index.ts (전체 코드)

export interface Post {
  id: string;
  title: string;
  tags: string | null;
  content: string;
  thumbnail_url: string;
  is_thumbnail_blurred: boolean;
  is_content_spoiler: boolean;
  is_nsfw: boolean;
  font_family: string | null;
  password: string | null;
  created_at: string;
  dominant_color: string | null;
  text_color: string | null;
  user_id?: number;
  visibility?: string;
  author_name?: string; // ▼▼▼ 작성자 이름을 위해 추가 ▼▼▼
}