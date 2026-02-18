
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text unique not null,
  university text not null,
  program text,
  year integer,
  bio text,
  cleanliness integer check (cleanliness >= 1 and cleanliness <= 5),
  sleep_schedule text check (sleep_schedule in ('early', 'night')),
  gender_preference text,
  budget_min integer default 0,
  budget_max integer default 10000,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LISTINGS TABLE
create table listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  location text not null,
  price integer not null,
  start_date date not null,
  end_date date not null,
  room_type text check (room_type in ('private', 'shared', 'studio')),
  amenities text[] default '{}',
  description text,
  photo_urls text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MESSAGES TABLE
create table messages (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references listings(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SAVED LISTINGS TABLE
create table saved_listings (
  user_id uuid references profiles(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete cascade not null,
  primary key (user_id, listing_id)
);

-- RLS POLICIES

-- Profiles: Users can view all, but update only their own
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Listings: Everyone can view, creators can update/delete
alter table listings enable row level security;
create policy "Listings are viewable by everyone." on listings for select using (true);
create policy "Users can create listings." on listings for insert with check (auth.uid() = user_id);
create policy "Users can update own listings." on listings for update using (auth.uid() = user_id);
create policy "Users can delete own listings." on listings for delete using (auth.uid() = user_id);

-- Messages: Users can see only their own conversations
alter table messages enable row level security;
create policy "Users can see messages they sent or received." on messages 
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages." on messages 
  for insert with check (auth.uid() = sender_id);

-- Saved Listings: Users can manage only their own bookmarks
alter table saved_listings enable row level security;
create policy "Users can see their own saved listings." on saved_listings for select using (auth.uid() = user_id);
create policy "Users can save listings." on saved_listings for insert with check (auth.uid() = user_id);
create policy "Users can unsave listings." on saved_listings for delete using (auth.uid() = user_id);
