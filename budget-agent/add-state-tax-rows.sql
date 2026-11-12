BEGIN;

LOCK TABLE budget_prompt_cells, budget_prompt_runs IN SHARE ROW EXCLUSIVE MODE;

DO $$
DECLARE
  new_row integer;
BEGIN
  IF EXISTS (
    SELECT 1 FROM budget_prompt_cells
    WHERE sheet = 'settings' AND cell = 'migration:state-tax-breakdown'
  ) THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM budget_prompt_runs
    WHERE sheet = 'budget' AND status IN ('running', 'cancel_requested')
  ) THEN
    RAISE EXCEPTION 'Wait for active budget prompts to finish before inserting rows';
  END IF;

  -- Work from the bottom up to avoid collisions or shifting a reference twice.
  FOR old_row IN REVERSE 52..12 LOOP
    new_row := old_row + CASE WHEN old_row >= 13 THEN 6 ELSE 4 END;

    UPDATE budget_prompt_cells
    SET cell_value = regexp_replace(
      cell_value, '\m([A-Da-d])' || old_row || '\M', '\1' || new_row, 'g'
    )
    WHERE sheet = 'budget' AND ltrim(cell_value) LIKE '=%';

    UPDATE budget_prompt_cells
    SET cell = left(cell, 1) || new_row
    WHERE sheet = 'budget' AND substring(cell from 2) = old_row::text;

    UPDATE budget_prompt_runs
    SET cell = left(cell, 1) || new_row
    WHERE sheet = 'budget' AND substring(cell from 2) = old_row::text;
  END LOOP;

  INSERT INTO budget_prompt_cells (sheet, cell, status)
  VALUES ('settings', 'migration:state-tax-breakdown', 'saved');
END $$;

COMMIT;
