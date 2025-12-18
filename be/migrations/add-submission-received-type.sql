-- Add submission_received to notifications type enum
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('user_updated', 'project_updated', 'grade_submitted', 'added_to_project', 'submission_received'));
