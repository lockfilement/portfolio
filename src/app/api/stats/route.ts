import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
}

export async function GET() {
  try {
    const toDate = new Date().toISOString();
    const fromDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

    const graphQLQuery = `
      query {
        viewer {
          contributionsCollection(from: "${fromDate}", to: "${toDate}") {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;

    const graphQLRes = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: graphQLQuery }),
    });

    const graphQLData = await graphQLRes.json();
    const calendar = graphQLData.data.viewer.contributionsCollection.contributionCalendar;
    const total = calendar.totalContributions;

    const allDays = calendar.weeks.flatMap((week: any) => week.contributionDays);

    const maxCount = Math.max(...allDays.map((day: any) => day.contributionCount));
    const getLevel = (count: number) => {
      if (count === 0) return 0;
      if (count < maxCount * 0.25) return 1;
      if (count < maxCount * 0.5) return 2;
      if (count < maxCount * 0.75) return 3;
      return 4;
    };

    const contributions = allDays.map((day: any) => ({
      date: day.date,
      count: day.contributionCount,
      level: getLevel(day.contributionCount),
    }));

    const publicReposRes = await fetchWithAuth(`https://api.github.com/user/repos?visibility=public&per_page=100`);
    const publicRepos = await publicReposRes.json();

    const publicLanguages: { [key: string]: number } = {};
    for (const repo of publicRepos) {
      if (!repo.fork) {
        const langRes = await fetchWithAuth(repo.languages_url);
        const repoLanguages = await langRes.json();
        for (const [lang, bytes] of Object.entries(repoLanguages)) {
          publicLanguages[lang] = (publicLanguages[lang] || 0) + (bytes as number);
        }
      }
    }

    const privateReposRes = await fetchWithAuth(`https://api.github.com/user/repos?visibility=private&per_page=100`);
    const privateRepos = await privateReposRes.json();

    const privateLanguages: { [key: string]: number } = {};
    for (const repo of privateRepos) {
      if (!repo.fork) {
        const langRes = await fetchWithAuth(repo.languages_url);
        const repoLanguages = await langRes.json();
        for (const [lang, bytes] of Object.entries(repoLanguages)) {
          privateLanguages[lang] = (privateLanguages[lang] || 0) + (bytes as number);
        }
      }
    }

    return NextResponse.json({
      contributions,
      total,
      publicLanguages,
      privateLanguages,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}