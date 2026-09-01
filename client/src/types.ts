export type VideoStatus = "roteiro" | "gravacao" | "edicao" | "revisao" | "publicado";

export interface Creator {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  social_handle: string | null;
  rate_per_video: number;
  notes: string | null;
  created_at: string;
}

export interface Script {
  id: number;
  title: string;
  hook: string;
  body: string | null;
  category: string | null;
  tags: string | null;
  performance_note: string | null;
  created_at: string;
}

export interface Video {
  id: number;
  title: string;
  creator_id: number | null;
  script_id: number | null;
  status: VideoStatus;
  platform: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  creator_name: string | null;
  script_title: string | null;
}

export interface MetricsSummary {
  totals: { total_views: number; total_likes: number; total_comments: number; total_shares: number };
  byVideo: { video_id: number; title: string; platform: string; views: number; likes: number; comments: number; shares: number }[];
  byPlatform: { platform: string; views: number; likes: number }[];
  pipelineCounts: { status: VideoStatus; count: number }[];
}
