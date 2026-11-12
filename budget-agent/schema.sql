CREATE TABLE IF NOT EXISTS budget_prompt_cells (
  sheet text NOT NULL,
  cell text NOT NULL,
  formula text,
  version integer NOT NULL DEFAULT 1,
  research_prompt text,
  schedule jsonb,
  next_run_at timestamptz,
  status text NOT NULL,
  result text,
  error text,
  PRIMARY KEY (sheet, cell)
);

CREATE TABLE IF NOT EXISTS budget_prompt_runs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sheet text NOT NULL,
  cell text NOT NULL,
  version integer NOT NULL,
  due_at timestamptz NOT NULL,
  status text NOT NULL,
  lease_until timestamptz,
  eve_session_id text,
  eve_turn_id text,
  UNIQUE (sheet, cell, version, due_at)
);

ALTER TABLE budget_prompt_cells ADD COLUMN IF NOT EXISTS cell_value text;
