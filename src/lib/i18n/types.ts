export type Locale = "en" | "uk" | "ru";

export interface Translations {
  // Nav
  nav_dashboard: string;
  nav_schedule: string;
  nav_exams: string;
  nav_progress: string;
  nav_settings: string;
  nav_logout: string;

  // Landing
  landing_title: string;
  landing_subtitle: string;
  landing_get_started: string;
  landing_login: string;

  // Auth
  auth_login: string;
  auth_signup: string;
  auth_email_placeholder: string;
  auth_password_placeholder: string;
  auth_password_confirm: string;
  auth_logging_in: string;
  auth_creating: string;
  auth_no_account: string;
  auth_has_account: string;
  auth_forgot_password: string;
  auth_check_email: string;
  auth_send_reset: string;
  auth_sending: string;
  auth_reset_password: string;
  auth_reset_subtitle: string;
  auth_new_password: string;
  auth_confirm_password: string;
  auth_update_password: string;
  auth_updating: string;
  auth_passwords_mismatch: string;
  auth_min_chars: string;
  auth_back_to_login: string;
  auth_check_email_confirm: string;

  // Settings
  settings_title: string;
  settings_welcome: string;
  settings_daily_hours: string;
  settings_start_time: string;
  settings_include_weekends: string;
  settings_timezone: string;
  settings_saved: string;
  settings_save: string;
  settings_save_continue: string;
  settings_saving: string;
  settings_hours_changed: string;
  settings_regen_all: string;
  settings_keep_current: string;
  settings_language: string;

  // Exams
  exams_title: string;
  exams_add: string;
  exams_no_exams: string;
  exams_no_exams_hint: string;
  exams_upcoming: string;
  exams_past: string;
  exams_add_modal_title: string;
  exams_subject_placeholder: string;
  exams_colour: string;
  exams_cancel: string;
  exams_saving: string;
  exams_days_away: string;
  exams_past_label: string;
  exams_topics: string;

  // Exam detail
  exam_generate: string;
  exam_generating: string;
  exam_scheduled_sessions: string;
  exam_topics_title: string;
  exam_no_topics: string;
  exam_add_topic: string;
  exam_topic_name: string;
  exam_topic_notes: string;
  exam_easy: string;
  exam_medium: string;
  exam_hard: string;
  exam_regen_prompt: string;
  exam_regen_full: string;
  exam_regen_just_add: string;

  // Dashboard
  dash_today: string;
  dash_all_done: string;
  dash_free_today: string;
  dash_upcoming_exams: string;
  dash_add_first_exam: string;
  dash_this_week: string;
  dash_topics_confident: string;
  dash_missed_sessions: string;
  dash_reschedule: string;
  dash_dismiss: string;
  dash_working: string;
  dash_rescheduled: string;
  dash_exam_tomorrow: string;
  dash_struggling_boost: string;
  dash_bonus_session: string;
  dash_bonus_weakest: string;
  dash_start_bonus: string;
  dash_loading: string;

  // Study session
  study_review: string;
  study_finished: string;
  study_how_well: string;
  study_auto_stop: string;
  study_start: string;
  study_est_min: string;

  // Ratings
  rating_blackout: string;
  rating_blackout_sub: string;
  rating_hard: string;
  rating_hard_sub: string;
  rating_good: string;
  rating_good_sub: string;
  rating_easy: string;
  rating_easy_sub: string;

  // Schedule
  schedule_title: string;
  schedule_subtitle: string;
  schedule_pick_day: string;
  schedule_no_sessions: string;
  schedule_completed: string;
  schedule_skipped: string;
  schedule_pending: string;
  schedule_exam_today: string;

  // Progress
  progress_title: string;
  progress_streak: string;
  progress_streak_days: string;
  progress_this_week: string;
  progress_confidence: string;
  progress_no_data: string;
  progress_mastery: string;
  progress_topic: string;
  progress_subject: string;
  progress_last_studied: string;
  progress_ease: string;
  progress_next_review: string;
  progress_no_topics: string;
  progress_scheduled: string;
  progress_completed: string;

  // Exam actions
  exam_delete: string;
  exam_delete_confirm: string;
  exam_delete_warning: string;
  exam_edit: string;
  exam_edit_title: string;
  exam_save: string;

  // Topic editing
  topic_edit: string;
  topic_save: string;

  // Study session
  study_cancel: string;
  study_cancel_confirm: string;

  // Validation
  validation_required: string;
  validation_too_long: string;
  validation_future_date: string;

  // Toast / notifications
  toast_success: string;
  toast_error: string;
  toast_deleted: string;
  toast_updated: string;

  // 404
  not_found_title: string;
  not_found_message: string;
  not_found_go_home: string;

  // Accessibility
  skip_to_content: string;

  // Weekdays short
  mon: string; tue: string; wed: string; thu: string; fri: string; sat: string; sun: string;

  // Feedback
  feedback_button: string;
  feedback_title: string;
  feedback_subtitle: string;
  feedback_rate_label: string;
  feedback_message_label: string;
  feedback_message_placeholder: string;
  feedback_submit: string;
  feedback_submitting: string;
  feedback_later: string;
  feedback_thanks: string;
  feedback_star_label: string;
}
