-- Clean no-op migration to refresh schema/types and ensure sync
-- This creates and drops a temporary function in a single tx
BEGIN;

CREATE OR REPLACE FUNCTION public._noop_refresh()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- intentionally empty
  NULL;
END;
$$;

-- Call it once to ensure it's valid
SELECT public._noop_refresh();

-- Drop it to leave no residue
DROP FUNCTION public._noop_refresh();

COMMIT;