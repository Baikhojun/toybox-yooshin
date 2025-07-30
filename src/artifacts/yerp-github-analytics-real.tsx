import React, { useState, useEffect } from 'react';

export const metadata = {
  id: 'yerp-github-analytics-real',
  title: 'YERP GitHub 분석 (실제 API)',
  description: 'GitHub API를 사용한 실제 프로젝트 분석 대시보드',
  type: 'react' as const,
  tags: ['github', 'api', 'analytics', 'yerp'],
  category: 'engineering',
  createdAt: new Date('2025-07-29').toISOString(),
  updatedAt: new Date('2025-07-29').toISOString(),
};

// GitHub API 타입 정의
interface GitHubRepo {
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  updated_at: string;
  default_branch: string;
}

interface GitHubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

interface GitHubLanguages {
  [key: string]: number;
}

interface GitHubPullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  merged_at: string | null;
}

interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export default function YerpGithubAnalyticsReal() {
  const [token, setToken] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // API 데이터 상태
  const [repoData, setRepoData] = useState<GitHubRepo | null>(null);
  const [contributors, setContributors] = useState<GitHubContributor[]>([]);
  const [recentCommits, setRecentCommits] = useState<GitHubCommit[]>([]);
  const [languages, setLanguages] = useState<GitHubLanguages>({});
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([]);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);

  const REPO_OWNER = 'yooshinYERP';
  const REPO_NAME = 'yerp';

  // GitHub API 호출 함수
  const fetchGitHubData = async (endpoint: string) => {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('인증 실패: 토큰을 확인해주세요');
      } else if (response.status === 403) {
        throw new Error('API 호출 한도 초과: 잠시 후 다시 시도해주세요');
      } else if (response.status === 404) {
        throw new Error('저장소를 찾을 수 없습니다');
      }
      throw new Error(`API 오류: ${response.status}`);
    }

    return response.json();
  };

  // 데이터 로드
  const loadAllData = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      // 1. 저장소 정보
      const repo = await fetchGitHubData(`/repos/${REPO_OWNER}/${REPO_NAME}`);
      setRepoData(repo);

      // 2. 기여자 정보 (상위 10명)
      const contribData = await fetchGitHubData(`/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=10`);
      setContributors(contribData);

      // 3. 최근 커밋 (30개)
      const commitsData = await fetchGitHubData(`/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=30`);
      setRecentCommits(commitsData);

      // 4. 언어 통계
      const langData = await fetchGitHubData(`/repos/${REPO_OWNER}/${REPO_NAME}/languages`);
      setLanguages(langData);

      // 5. Pull Requests (최근 10개)
      const prData = await fetchGitHubData(`/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=all&per_page=10`);
      setPullRequests(prData);

      // 6. 브랜치 목록
      const branchData = await fetchGitHubData(`/repos/${REPO_OWNER}/${REPO_NAME}/branches?per_page=20`);
      setBranches(branchData);

      setIsConfigured(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 언어 통계 계산
  const calculateLanguageStats = () => {
    const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    return Object.entries(languages)
      .map(([name, bytes]) => ({
        name,
        percentage: ((bytes / total) * 100).toFixed(1),
        bytes,
      }))
      .sort((a, b) => b.bytes - a.bytes);
  };

  // 커밋 활동 분석
  const analyzeCommitActivity = () => {
    const activityMap = new Map<string, number>();
    
    recentCommits.forEach(commit => {
      const date = new Date(commit.commit.author.date).toLocaleDateString();
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    });

    return Array.from(activityMap.entries())
      .map(([date, count]) => ({ date, count }))
      .reverse();
  };

  // 언어별 색상
  const getLanguageColor = (language: string): string => {
    const colors: { [key: string]: string } = {
      'TypeScript': '#3178c6',
      'JavaScript': '#f1e05a',
      'Java': '#b07219',
      'Python': '#3572A5',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'SCSS': '#c6538c',
      'Vue': '#4FC08D',
      'React': '#61DAFB',
    };
    return colors[language] || '#808080';
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">GitHub API 설정</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">GitHub Personal Access Token</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 text-sm text-gray-300">
              <p className="font-semibold mb-2">토큰 생성 방법:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>GitHub 로그인 → Settings → Developer settings</li>
                <li>Personal access tokens → Tokens (classic) → Generate new token</li>
                <li>권한 선택: repo (전체), read:user</li>
                <li>생성된 토큰을 위에 입력</li>
              </ol>
            </div>

            <button
              onClick={loadAllData}
              disabled={!token || loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                !token || loading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              {loading ? '데이터 로딩 중...' : '연결하기'}
            </button>

            <div className="text-center text-gray-400 text-sm">
              <p>토큰은 브라우저에만 저장되며 서버로 전송되지 않습니다</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const languageStats = calculateLanguageStats();
  const commitActivity = analyzeCommitActivity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            {repoData?.name} 실시간 분석
          </h1>
          <p className="text-gray-300 text-lg mb-2">{repoData?.description}</p>
          <div className="flex items-center justify-center gap-6 text-gray-400">
            <span>⭐ {repoData?.stargazers_count}</span>
            <span>🔱 {repoData?.forks_count}</span>
            <span>❗ {repoData?.open_issues_count} issues</span>
            <span>🔄 업데이트: {new Date(repoData?.updated_at || '').toLocaleDateString()}</span>
          </div>
        </div>

        {/* 기여자 순위 */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">🏆 TOP 기여자</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributors.slice(0, 6).map((contributor, index) => (
              <a
                key={contributor.login}
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-900/50 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-all duration-200 transform hover:scale-[1.02] flex items-center gap-4"
              >
                <img
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {index === 0 && <span className="text-yellow-400">🥇</span>}
                    {index === 1 && <span className="text-gray-300">🥈</span>}
                    {index === 2 && <span className="text-orange-400">🥉</span>}
                    <h4 className="text-white font-semibold">{contributor.login}</h4>
                  </div>
                  <p className="text-gray-400 text-sm">{contributor.contributions} commits</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 언어 통계 */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">📊 언어 분포</h3>
            <div className="space-y-3">
              {languageStats.slice(0, 5).map(lang => (
                <div key={lang.name} className="flex items-center gap-4">
                  <div className="w-20 text-gray-300 text-sm">{lang.name}</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 flex items-center justify-end pr-2"
                      style={{ 
                        width: `${lang.percentage}%`,
                        backgroundColor: getLanguageColor(lang.name)
                      }}
                    >
                      <span className="text-xs text-white font-semibold">{lang.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 최근 커밋 활동 */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">📈 최근 커밋 활동</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {commitActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{activity.date}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                        style={{ width: `${Math.min(activity.count * 20, 100)}%` }}
                      />
                    </div>
                    <span className="text-white w-8 text-right">{activity.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 최근 Pull Requests */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 mt-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">🔀 최근 Pull Requests</h3>
          <div className="grid gap-3">
            {pullRequests.slice(0, 5).map(pr => (
              <div key={pr.number} className="bg-gray-900/50 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-400">#{pr.number}</span>
                      <h4 className="text-white font-semibold">{pr.title}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <img
                        src={pr.user.avatar_url}
                        alt={pr.user.login}
                        className="w-5 h-5 rounded-full inline"
                      />
                      <span>{pr.user.login}</span>
                      <span>📅 {new Date(pr.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    pr.merged_at ? 'bg-purple-900/50 text-purple-300' :
                    pr.state === 'open' ? 'bg-green-900/50 text-green-300' :
                    'bg-red-900/50 text-red-300'
                  }`}>
                    {pr.merged_at ? '🟣 Merged' : pr.state === 'open' ? '🟢 Open' : '🔴 Closed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 브랜치 목록 */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 mt-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">🌿 브랜치</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {branches.map(branch => (
              <div key={branch.name} className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
                <div className="flex items-center gap-2">
                  {branch.protected && <span className="text-yellow-500">🔒</span>}
                  <span className="text-white font-mono text-sm">{branch.name}</span>
                  {branch.name === repoData?.default_branch && (
                    <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">DEFAULT</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 새로고침 버튼 */}
        <div className="mt-8 text-center">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? '⏳ 데이터 로딩 중...' : '🔄 데이터 새로고침'}
          </button>
        </div>
      </div>
    </div>
  );
}