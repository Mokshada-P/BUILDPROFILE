import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

const migrationPath = path.resolve(process.cwd(), "supabase/migrations/20261015000000_initial_schema.sql");

test("Supabase SQL migration exists and contains all required tables", () => {
  assert.ok(fs.existsSync(migrationPath), "Migration file must exist at supabase/migrations/20261015000000_initial_schema.sql");
  const sql = fs.readFileSync(migrationPath, "utf8").toLowerCase();

  const requiredTables = [
    "profiles",
    "profile_audits",
    "content_conversations",
    "content_messages",
    "post_drafts",
    "connection_suggestions",
    "career_milestones",
    "user_activity",
  ];

  for (const table of requiredTables) {
    assert.ok(
      sql.includes(`create table if not exists public.${table}`),
      `Migration must define table public.${table}`
    );
  }
});

test("Supabase SQL migration enforces strict Row Level Security (RLS) on all user tables", () => {
  const sql = fs.readFileSync(migrationPath, "utf8").toLowerCase();

  const userTables = [
    "profiles",
    "profile_audits",
    "content_conversations",
    "content_messages",
    "post_drafts",
    "connection_suggestions",
    "career_milestones",
    "user_activity",
  ];

  for (const table of userTables) {
    // Check RLS enabled
    assert.ok(
      sql.includes(`alter table public.${table} enable row level security`),
      `RLS must be enabled on public.${table}`
    );

    // Check foreign key to auth.users with cascade
    assert.ok(
      sql.includes(`user_id uuid not null references auth.users(id) on delete cascade`) ||
      sql.includes(`user_id uuid not null references auth.users(id) on delete cascade unique`),
      `Table public.${table} must reference auth.users(id) with on delete cascade`
    );

    // Check RLS policy uses auth.uid() = user_id
    assert.ok(
      sql.includes(`auth.uid() = user_id`),
      `RLS policies must isolate access via auth.uid() = user_id`
    );
  }
});
