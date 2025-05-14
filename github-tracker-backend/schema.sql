-- PostgreSQL schema for GitHub Tracker

CREATE TABLE repositories (
    id SERIAL PRIMARY KEY,
    owner TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT
);

CREATE TABLE releases (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    release_date TIMESTAMP NOT NULL,
    release_notes TEXT
);

CREATE TABLE seen_status (
    id SERIAL PRIMARY KEY,
    release_id INTEGER REFERENCES releases(id) ON DELETE CASCADE,
    seen BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(release_id)
);

-- Add indexes for better performance
CREATE INDEX idx_releases_repository_id ON releases(repository_id);
CREATE INDEX idx_releases_release_date ON releases(release_date);
CREATE INDEX idx_seen_status_release_id ON seen_status(release_id);