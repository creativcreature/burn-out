-- =====================================================
-- Burnout App Database Schema
-- =====================================================
-- Run this in Supabase SQL Editor or as a migration
-- 
-- Features:
-- - Row Level Security (RLS) for multi-tenant isolation
-- - Soft deletes for conflict resolution
-- - Version columns for optimistic concurrency
-- - Indexes for common queries
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TASKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID,
  goal_id UUID,
  category_id UUID,
  verb_label VARCHAR(12) NOT NULL,
  task_body TEXT NOT NULL,
  time_estimate INTEGER NOT NULL CHECK (time_estimate >= 0),
  feed_level VARCHAR(10) NOT NULL CHECK (feed_level IN ('low', 'medium', 'high')),
  scheduled_for DATE,
  time_of_day VARCHAR(10) CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'anytime')),
  status VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'deferred')),
  deferred_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  task_order INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_goal ON tasks(goal_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_updated ON tasks(user_id, updated_at);

-- RLS Policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- GOALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  timeframe VARCHAR(5) NOT NULL CHECK (timeframe IN ('5y', '3y', '1y', '6m', '3m', '1m', '1w')),
  target_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived BOOLEAN NOT NULL DEFAULT false,
  goal_order INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_active ON goals(user_id, is_active) WHERE deleted_at IS NULL AND archived = false;
CREATE INDEX IF NOT EXISTS idx_goals_updated ON goals(user_id, updated_at);

-- RLS Policies
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Foreign key (after goals table exists)
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_goal 
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL;

-- =====================================================
-- PROJECTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  parent_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project_order INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_goal ON projects(goal_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(user_id, updated_at);

-- RLS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Foreign key (after projects table exists)
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_project 
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- =====================================================
-- HABITS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verb_label VARCHAR(12) NOT NULL,
  habit_body TEXT NOT NULL,
  frequency VARCHAR(10) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'custom')),
  custom_days INTEGER[],
  time_of_day VARCHAR(10) NOT NULL CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'anytime')),
  feed_level VARCHAR(10) NOT NULL CHECK (feed_level IN ('low', 'medium', 'high')),
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_completed TIMESTAMPTZ,
  completion_count INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_goal ON habits(goal_id) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- JOURNAL ENTRIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  content TEXT NOT NULL,
  mood VARCHAR(15) CHECK (mood IN ('struggling', 'okay', 'good', 'great')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, entry_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(user_id, entry_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_journal_updated ON journal_entries(user_id, updated_at);

-- RLS Policies
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- COMPLETED TASKS TABLE (for history/analytics)
-- =====================================================

CREATE TABLE IF NOT EXISTS completed_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID,
  habit_id UUID,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration INTEGER NOT NULL DEFAULT 0,
  energy_before INTEGER CHECK (energy_before BETWEEN 1 AND 5),
  energy_after INTEGER CHECK (energy_after BETWEEN 1 AND 5),
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_completed_user_id ON completed_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_date ON completed_tasks(user_id, completed_at);

-- RLS Policies
ALTER TABLE completed_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completed tasks" ON completed_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completed tasks" ON completed_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TASK CATEGORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS task_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON task_categories(user_id);

-- RLS Policies
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories" ON task_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON task_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON task_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON task_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Foreign key
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_category 
  FOREIGN KEY (category_id) REFERENCES task_categories(id) ON DELETE SET NULL;

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE tasks IS 'User tasks with energy-aware metadata';
COMMENT ON TABLE goals IS 'High-level user goals (1w to 5y timeframes)';
COMMENT ON TABLE projects IS 'Projects that belong to goals';
COMMENT ON TABLE habits IS 'Recurring habits (daily/weekly)';
COMMENT ON TABLE journal_entries IS 'Daily mood and reflection entries';
COMMENT ON TABLE completed_tasks IS 'History of completed tasks for analytics';
COMMENT ON TABLE task_categories IS 'Categories for organizing orphan tasks';

COMMENT ON COLUMN tasks.feed_level IS 'Energy required: low (quick wins), medium (moderate focus), high (deep work)';
COMMENT ON COLUMN tasks.verb_label IS 'Short action verb, max 12 chars (e.g., Deep Work, Quick Win)';
COMMENT ON COLUMN tasks.deleted_at IS 'Soft delete timestamp for conflict resolution';
COMMENT ON COLUMN tasks.version IS 'Optimistic concurrency control version';
