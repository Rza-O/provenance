CREATE TABLE IF NOT EXISTS pages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    host TEXT NOT NULL,
    status_code SMALLINT CHECK (
        status_code BETWEEN 100 AND 599
    ),
    title TEXT,
    body TEXT,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    tsv TSVECTOR GENERATED ALWAYS AS (
        setweight(
            to_tsvector(
                'english',
                coalesce(title, '')
            ),
            'A'
        ) || setweight(
            to_tsvector('english', coalesce(body, '')),
            'B'
        )
    ) STORED
);

CREATE INDEX IF NOT EXISTS pages_tsv_idx ON pages USING GIN (tsv);

CREATE TABLE IF NOT EXISTS links (
    from_page_id BIGINT NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
    to_url TEXT NOT NULL,
    UNIQUE (from_page_id, to_url)
);