// types/index.ts (덮어쓰기)
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
  author_name?: string;
  letter_spacing?: string;
  line_height?: string;
  og_font?: string;
}

export interface Memo {
  id: string;
  user_id: number;
  content: string;
  spoiler_icon: string;
  visibility: string;
  created_at: string;
  author_name: string;
  author_image: string | null;
  author_header_image?: string | null;
}