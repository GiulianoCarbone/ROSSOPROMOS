-- Create the products table
create table products (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  image_url text not null,
  category text not null,
  active boolean default true
);

-- Enable Row Level Security (RLS)
alter table products enable row level security;

-- Create a policy that allows anyone to read products
create policy "Public products are viewable by everyone"
  on products for select
  using ( true );

-- Create a policy that allows authenticated users to insert/update/delete
create policy "Authenticated users can modify products"
  on products for all
  using ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );

-- STORAGE POLICIES (You need to create a bucket named 'images' in the dashboard first)
-- or run: insert into storage.buckets (id, name) values ('images', 'images');

-- Allow public access to images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'images' );

-- Allow authenticated uploads
create policy "Authenticated Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'images' AND auth.role() = 'authenticated' );
