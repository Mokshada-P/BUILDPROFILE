-- Migration: 20261019000000_add_linkedin_columns.sql
-- Add LinkedIn OAuth credentials and author URN to profiles table

alter table if exists public.profiles
  add column if not exists linkedin_access_token text,
  add column if not exists linkedin_member_urn text,
  add column if not exists linkedin_token_expires_at timestamptz,
  add column if not exists linkedin_profile_data jsonb default '{}'::jsonb;

comment on column public.profiles.linkedin_member_urn is 'URN representing LinkedIn member identity: urn:li:person:<sub_id>';
