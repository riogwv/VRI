-- Remove the policy that allows all authenticated users to read reports.
-- Add a staff-only policy after defining trusted staff roles.
drop policy if exists "Reports are viewable by staff" on public.reports;
