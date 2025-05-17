import { fetchLatestRelease, fetchRepositoryDetails } from './github.ts';
import pool from './db.ts';

interface Repository {
  id: string;
  name: string;
  owner: string;
  url: string;
  description: string | null;
  latestRelease: {
    id: string;
    version: string;
    releaseDate: string | null;
    releaseNotes: string | null;
    seen: boolean;
  } | null;
}

interface MarkAsSeenArgs {
  repoId: string;
}

const resolvers = {
  Query: {
    repositories: async (): Promise<Repository[]> => {
      const { rows } = await pool.query(`
        WITH latest_releases AS (
          SELECT DISTINCT ON (repository_id)
            id,
            repository_id,
            version,
            release_date,
            release_notes
          FROM releases
          ORDER BY repository_id, release_date DESC
        )
        SELECT 
          r.*,
          lr.id as release_id,
          lr.version,
          to_char(lr.release_date, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "releaseDate",
          lr.release_notes as "releaseNotes",
          COALESCE(s.seen, false) as seen
        FROM repositories r
        LEFT JOIN latest_releases lr ON lr.repository_id = r.id
        LEFT JOIN seen_status s ON s.release_id = lr.id
      `);
      
      return rows.map(row => ({
        ...row,
        latestRelease: row.release_id ? {
          id: row.release_id,
          version: row.version,
          releaseDate: row.releaseDate || null,
          releaseNotes: row.releaseNotes,
          seen: row.seen
        } : null
      }));
    }
  },
  Mutation: {
    addRepository: async (_: any, { owner, name }: any) => {
      const url = `https://github.com/${owner}/${name}`;
      
      // Fetch repository details including description
      const { description, latestRelease } = await fetchRepositoryDetails(owner, name);
      
      const result = await pool.query(
        'INSERT INTO repositories (owner, name, url, description) VALUES ($1, $2, $3, $4) RETURNING *',
        [owner, name, url, description]
      );

      const repo = result.rows[0];
      
      let releaseId = null;
      if (latestRelease) {
        const releaseResult = await pool.query(
          'INSERT INTO releases (repository_id, version, release_date, release_notes) VALUES ($1, $2, $3, $4) RETURNING id',
          [
            repo.id,
            latestRelease.version,
            latestRelease.releaseDate,
            latestRelease.releaseNotes
          ]
        );
        releaseId = releaseResult.rows[0].id;
        
        // Add seen_status entry
        await pool.query(
          'INSERT INTO seen_status (release_id, seen) VALUES ($1, false)',
          [releaseId]
        );
      }

      return {
        ...repo,
        latestRelease: latestRelease ? {
          id: releaseId,
          version: latestRelease.version,
          releaseDate: latestRelease.releaseDate,
          releaseNotes: latestRelease.releaseNotes,
          seen: false
        } : null
      };
    },
    markAsSeen: async (_: unknown, { repoId }: MarkAsSeenArgs): Promise<boolean> => {
      const latestRelease = await pool.query(`
        SELECT r.id 
        FROM releases r 
        WHERE r.repository_id = $1 
        ORDER BY r.release_date DESC 
        LIMIT 1
      `, [repoId]);

      if (latestRelease.rows.length === 0) {
        return false;
      }

      const releaseId = latestRelease.rows[0].id;

      const existingStatus = await pool.query(
        'SELECT seen FROM seen_status WHERE release_id = $1',
        [releaseId]
      );

      let res;
      if (existingStatus.rows.length === 0) {
        res = await pool.query(
          'INSERT INTO seen_status (release_id, seen) VALUES ($1, true)',
          [releaseId]
        );
      } else {
        res = await pool.query(
          'UPDATE seen_status SET seen = NOT seen WHERE release_id = $1 RETURNING seen',
          [releaseId]
        );
      }

      return typeof res.rowCount === 'number' ? res.rowCount > 0 : false;
    },
    refreshRepository: async (_: any, { repoId }: any) => {
      const repo = await pool.query('SELECT * FROM repositories WHERE id = $1', [repoId]);
      const { owner, name } = repo.rows[0];
      
      // Fetch updated repository details
      const { description, latestRelease } = await fetchRepositoryDetails(owner, name);
      
      // Update repository description
      await pool.query(
        'UPDATE repositories SET description = $1 WHERE id = $2',
        [description, repoId]
      );

      let releaseId = null;
      if (latestRelease) {
        // Check if there's an existing release with the same version
        const existingRelease = await pool.query(
          'SELECT id, version FROM releases WHERE repository_id = $1 AND version = $2',
          [repoId, latestRelease.version]
        );

        if (existingRelease.rows.length > 0) {
          // If release exists, keep its seen status
          releaseId = existingRelease.rows[0].id;
        } else {
          // If it's a new release, insert it with seen = false
          const releaseResult = await pool.query(
            'INSERT INTO releases (repository_id, version, release_date, release_notes) VALUES ($1, $2, $3, $4) RETURNING id',
            [
              repoId,
              latestRelease.version,
              latestRelease.releaseDate,
              latestRelease.releaseNotes
            ]
          );
          releaseId = releaseResult.rows[0].id;
          
          // Add seen_status entry for new release
          await pool.query(
            'INSERT INTO seen_status (release_id, seen) VALUES ($1, false)',
            [releaseId]
          );
        }
      }

      // Get the current seen status
      const seenStatus = await pool.query(
        'SELECT seen FROM seen_status WHERE release_id = $1',
        [releaseId]
      );

      return {
        ...repo.rows[0],
        latestRelease: latestRelease ? {
          id: releaseId,
          version: latestRelease.version,
          releaseDate: latestRelease.releaseDate,
          releaseNotes: latestRelease.releaseNotes,
          seen: seenStatus.rows[0]?.seen || false
        } : null
      };
    },
    removeRepository: async (_: any, { repoId }: any) => {
      // Delete the repository and cascade to releases and seen_status
      const res = await pool.query('DELETE FROM repositories WHERE id = $1 RETURNING id', [repoId]);
      return res.rows[0]?.id || null;
    }
  }
};

export default resolvers;
