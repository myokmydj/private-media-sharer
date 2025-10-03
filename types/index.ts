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
  visibility?: string; // 추가
  user_id?: number;
}