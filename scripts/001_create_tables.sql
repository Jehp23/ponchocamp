-- Tabla de perfiles de usuario
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Trigger para crear perfil automaticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Tabla de notas del wiki
create table if not exists public.wiki_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  emoji text default '📄',
  content text default '',
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.wiki_pages enable row level security;

-- Politicas: todos los usuarios autenticados pueden ver y crear
create policy "wiki_select_authenticated" on public.wiki_pages for select to authenticated using (true);
create policy "wiki_insert_authenticated" on public.wiki_pages for insert to authenticated with check (auth.uid() = user_id);
create policy "wiki_update_authenticated" on public.wiki_pages for update to authenticated using (auth.uid() = user_id);
create policy "wiki_delete_authenticated" on public.wiki_pages for delete to authenticated using (auth.uid() = user_id);

-- Tabla de tags
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  color text default '#1f4d3a'
);

alter table public.tags enable row level security;
create policy "tags_select_authenticated" on public.tags for select to authenticated using (true);
create policy "tags_insert_authenticated" on public.tags for insert to authenticated with check (true);

-- Tabla de relacion wiki <-> tags
create table if not exists public.wiki_page_tags (
  wiki_page_id uuid references public.wiki_pages(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (wiki_page_id, tag_id)
);

alter table public.wiki_page_tags enable row level security;
create policy "wiki_tags_select_authenticated" on public.wiki_page_tags for select to authenticated using (true);
create policy "wiki_tags_insert_authenticated" on public.wiki_page_tags for insert to authenticated with check (true);
create policy "wiki_tags_delete_authenticated" on public.wiki_page_tags for delete to authenticated using (true);

-- Tabla de cursos (admin puede crear)
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text check (category in ('finanzas', 'tecnologia')),
  level text check (level in ('basico', 'intermedio', 'avanzado')),
  duration text,
  lessons_count int default 0,
  created_at timestamptz default now()
);

alter table public.courses enable row level security;
create policy "courses_select_authenticated" on public.courses for select to authenticated using (true);

-- Tabla de lecciones
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  content text,
  video_url text,
  order_index int default 0,
  duration text
);

alter table public.lessons enable row level security;
create policy "lessons_select_authenticated" on public.lessons for select to authenticated using (true);

-- Tabla de progreso de usuario
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean default false,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

alter table public.user_progress enable row level security;
create policy "progress_select_own" on public.user_progress for select to authenticated using (auth.uid() = user_id);
create policy "progress_insert_own" on public.user_progress for insert to authenticated with check (auth.uid() = user_id);
create policy "progress_update_own" on public.user_progress for update to authenticated using (auth.uid() = user_id);

-- Tabla de favoritos
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text check (item_type in ('wiki_page', 'course', 'file')),
  item_id uuid not null,
  created_at timestamptz default now(),
  unique (user_id, item_type, item_id)
);

alter table public.favorites enable row level security;
create policy "favorites_select_own" on public.favorites for select to authenticated using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.favorites for insert to authenticated with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorites for delete to authenticated using (auth.uid() = user_id);

-- Tabla de archivos subidos
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pathname text not null,
  size bigint,
  content_type text,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.files enable row level security;
create policy "files_select_authenticated" on public.files for select to authenticated using (true);
create policy "files_insert_authenticated" on public.files for insert to authenticated with check (auth.uid() = user_id);
create policy "files_delete_own" on public.files for delete to authenticated using (auth.uid() = user_id);
