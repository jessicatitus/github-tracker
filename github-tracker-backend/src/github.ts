import { Octokit } from '@octokit/rest';

export const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function fetchRepositoryDetails(owner: string, repo: string) {
  const [repoDetails, latestRelease] = await Promise.all([
    octokit.repos.get({ owner, repo }),
    octokit.repos.getLatestRelease({ owner, repo }).catch(() => null)
  ]);

  const releaseData = latestRelease ? {
    version: latestRelease.data.tag_name,
    releaseDate: latestRelease.data.published_at,
    releaseNotes: latestRelease.data.body
  } : null;

  return {
    description: repoDetails.data.description,
    latestRelease: releaseData
  };
}

export async function fetchLatestRelease(owner: string, repo: string) {
  const res = await octokit.repos.getLatestRelease({ owner, repo });
  
  return {
    version: res.data.tag_name,
    releaseDate: res.data.published_at,
    releaseNotes: res.data.body
  };
}