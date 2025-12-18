-- Remove unique constraint on student_id in project_students table
-- This allows students to join multiple projects

ALTER TABLE project_students DROP CONSTRAINT IF EXISTS project_students_student_id_key;
