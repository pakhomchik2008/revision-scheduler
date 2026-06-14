export type Difficulty = 1 | 2 | 3;
export type Rating = 1 | 2 | 3 | 4;

export interface Exam {
  id: string;
  user_id: string;
  subject: string;
  exam_date: string;
  color: string;
  created_at: string;
}

export interface Topic {
  id: string;
  exam_id: string;
  user_id: string;
  name: string;
  difficulty: Difficulty;
  notes: string;
  order_index: number;
}

export interface StudySession {
  id: string;
  user_id: string;
  topic_id: string;
  scheduled_date: string;
  completed: boolean;
  skipped: boolean;
  rating: Rating | null;
  duration_minutes: number;
  repetition_count: number;
  ease_factor: number;
  next_review_date: string | null;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  daily_study_hours: number;
  study_start_hour: number;
  include_weekends: boolean;
  timezone: string;
}
