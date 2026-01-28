-- Clean all release planning data
-- Run this script to delete all releases and related data

-- Delete in correct order (respecting foreign key constraints)

-- 1. Delete email logs (references platform_plans and releases)
DELETE FROM email_logs;

-- 2. Delete daily tasks (references releases)
DELETE FROM daily_tasks;

-- 3. Delete promotion days (references releases)
DELETE FROM promotion_days;

-- 4. Delete platform plans (references releases)
DELETE FROM platform_plans;

-- 5. Delete release assets (references releases)
DELETE FROM release_assets;

-- 6. Delete releases (main table)
DELETE FROM releases;

-- Verify deletion
SELECT 
  (SELECT COUNT(*) FROM releases) as releases_count,
  (SELECT COUNT(*) FROM release_assets) as assets_count,
  (SELECT COUNT(*) FROM platform_plans) as platform_plans_count,
  (SELECT COUNT(*) FROM promotion_days) as promotion_days_count,
  (SELECT COUNT(*) FROM daily_tasks) as daily_tasks_count,
  (SELECT COUNT(*) FROM email_logs) as email_logs_count;
