import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * SQL Schema for Supabase Setup
 * This script can be run in Supabase SQL Editor.
 */
export const SUPABASE_SQL_SCHEMA = `
-- 1. Profiles Table (Users with Roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  student_no TEXT,
  role TEXT CHECK (role IN ('student', 'teacher', 'dev')) DEFAULT 'student',
  avatar_url TEXT,
  class_code TEXT DEFAULT 'CSS-302',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Challenges Table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  target_image_url TEXT NOT NULL,
  target_width INT DEFAULT 720,
  target_height INT DEFAULT 420,
  starter_html TEXT NOT NULL,
  starter_css TEXT NOT NULL,
  hints JSONB DEFAULT '[]'::jsonb,
  max_lines_goal INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Submissions Table (Student Solutions)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles ON DELETE CASCADE,
  html TEXT NOT NULL,
  css TEXT NOT NULL,
  visual_match NUMERIC(5,2) DEFAULT 0,
  clean_score NUMERIC(5,2) DEFAULT 0,
  lines_count INT DEFAULT 0,
  unused_css_percent NUMERIC(5,2) DEFAULT 0,
  status TEXT CHECK (status IN ('coding', 'submitted', 'approved')) DEFAULT 'coding',
  teacher_feedback TEXT,
  grade INT,
  submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Profiles: Users can read all in their class, edit own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Challenges: Everyone can view, teachers & devs can insert/update
CREATE POLICY "Challenges viewable by all" ON public.challenges FOR SELECT USING (true);

-- Submissions: Students view own, teachers view all
CREATE POLICY "Students can view and edit own submissions" ON public.submissions
  FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Teachers and devs view all submissions" ON public.submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('teacher', 'dev'))
  );
`;
