BEGIN;

LOCK TABLE budget_prompt_cells, budget_prompt_runs IN SHARE ROW EXCLUSIVE MODE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM budget_prompt_runs
    WHERE sheet IN ('cash-flow', 'tax') AND status IN ('running', 'cancel_requested')
  ) THEN
    RAISE EXCEPTION 'Wait for active budget prompts to finish before merging the grid';
  END IF;

  -- Shift legacy cash-flow references from bottom to top to avoid shifting
  -- a reference twice. PROMPT strings are stored separately and stay intact.
  FOR old_row IN REVERSE 34..1 LOOP
    UPDATE budget_prompt_cells
    SET cell_value = regexp_replace(
      cell_value, '\m([A-Da-d])' || old_row || '\M', '\1' || (old_row + 11), 'g'
    )
    WHERE sheet = 'cash-flow' AND ltrim(cell_value) LIKE '=%';
  END LOOP;

  UPDATE budget_prompt_cells
  SET cell_value = regexp_replace(cell_value, '\mTAKE_HOME\M', 'B11', 'gi')
  WHERE sheet = 'cash-flow' AND ltrim(cell_value) LIKE '=%';
END $$;

UPDATE budget_prompt_cells
SET sheet = 'budget', cell = left(cell, 1) || (substring(cell from 2)::integer + 11)
WHERE sheet = 'cash-flow';

UPDATE budget_prompt_runs
SET sheet = 'budget', cell = left(cell, 1) || (substring(cell from 2)::integer + 11)
WHERE sheet = 'cash-flow';

UPDATE budget_prompt_cells SET sheet = 'budget' WHERE sheet = 'tax';
UPDATE budget_prompt_runs SET sheet = 'budget' WHERE sheet = 'tax';

COMMIT;
