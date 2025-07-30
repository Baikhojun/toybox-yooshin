import React, { useState, useEffect } from 'react';

export const metadata = {
  id: 'yerp-github-analytics',
  title: 'YERP GitHub 분석',
  description: '한마당 3.0 프로젝트의 GitHub 통계 및 기여도 분석 대시보드',
  type: 'react' as const,
  tags: ['github', 'analytics', 'yerp', 'statistics'],
  category: 'engineering',
  createdAt: new Date('2025-07-29').toISOString(),
  updatedAt: new Date('2025-07-29').toISOString(),
};

interface Contributor {
  name: string;
  commits: number;
  additions: number;
  deletions: number;
  avatar: string;
  percentage: number;
}

interface CommitActivity {
  date: string;
  count: number;
}

interface LanguageStats {
  name: string;
  percentage: number;
  color: string;
}

interface BranchInfo {
  name: string;
  lastCommit: string;
  ahead: number;
  behind: number;
  isActive: boolean;
}

interface PullRequest {
  number: number;
  title: string;
  author: string;
  state: 'open' | 'closed' | 'merged';
  createdAt: string;
  reviewers: number;
}

export default function YerpGithubAnalytics() {
  const [activeTab, setActiveTab] = useState<'overview' | 'contributors' | 'activity' | 'branches'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);

  // 모의 데이터 (실제로는 GitHub API를 통해 가져옴)
  const [contributors] = useState<Contributor[]>([
    { name: '김개발', commits: 342, additions: 15420, deletions: 8234, avatar: '👨‍💻', percentage: 28 },
    { name: '이프론트', commits: 298, additions: 22103, deletions: 11456, avatar: '👩‍💻', percentage: 24 },
    { name: '박백엔드', commits: 256, additions: 18765, deletions: 9876, avatar: '🧑‍💻', percentage: 21 },
    { name: '최데이터', commits: 187, additions: 8934, deletions: 4521, avatar: '👨‍💼', percentage: 15 },
    { name: '정테스트', commits: 145, additions: 6789, deletions: 3456, avatar: '👩‍💼', percentage: 12 },
  ]);

  const [languages] = useState<LanguageStats[]>([
    { name: 'TypeScript', percentage: 42.3, color: '#3178c6' },
    { name: 'JavaScript', percentage: 28.5, color: '#f1e05a' },
    { name: 'Java', percentage: 15.2, color: '#b07219' },
    { name: 'HTML', percentage: 8.7, color: '#e34c26' },
    { name: 'CSS', percentage: 5.3, color: '#563d7c' },
  ]);

  const [branches] = useState<BranchInfo[]>([
    { name: 'main', lastCommit: '2시간 전', ahead: 0, behind: 0, isActive: true },
    { name: 'feature/user-management', lastCommit: '1일 전', ahead: 15, behind: 3, isActive: true },
    { name: 'hotfix/login-issue', lastCommit: '3시간 전', ahead: 2, behind: 0, isActive: true },
    { name: 'develop', lastCommit: '5시간 전', ahead: 48, behind: 0, isActive: true },
    { name: 'feature/payment-gateway', lastCommit: '2주 전', ahead: 67, behind: 124, isActive: false },
  ]);

  const [pullRequests] = useState<PullRequest[]>([
    { number: 234, title: '사용자 권한 관리 기능 추가', author: '김개발', state: 'open', createdAt: '2시간 전', reviewers: 2 },
    { number: 233, title: '로그인 버그 수정', author: '박백엔드', state: 'merged', createdAt: '1일 전', reviewers: 3 },
    { number: 232, title: 'UI 컴포넌트 리팩토링', author: '이프론트', state: 'open', createdAt: '3일 전', reviewers: 1 },
    { number: 231, title: '성능 최적화', author: '최데이터', state: 'closed', createdAt: '1주 전', reviewers: 2 },
  ]);

  // 주간 커밋 활동 데이터
  const generateCommitActivity = (): CommitActivity[] => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const activity: CommitActivity[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      activity.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 5
      });
    }
    return activity;
  };

  const [commitActivity] = useState<CommitActivity[]>(generateCommitActivity());

  const projectStats = {
    totalCommits: contributors.reduce((sum, c) => sum + c.commits, 0),
    totalContributors: contributors.length,
    activeBranches: branches.filter(b => b.isActive).length,
    openPRs: pullRequests.filter(pr => pr.state === 'open').length,
    totalAdditions: contributors.reduce((sum, c) => sum + c.additions, 0),
    totalDeletions: contributors.reduce((sum, c) => sum + c.deletions, 0),
  };

  const getPRStateColor = (state: PullRequest['state']) => {
    switch (state) {
      case 'open': return 'text-green-400 bg-green-900/30 border-green-600';
      case 'merged': return 'text-purple-400 bg-purple-900/30 border-purple-600';
      case 'closed': return 'text-red-400 bg-red-900/30 border-red-600';
    }
  };

  const getPRStateIcon = (state: PullRequest['state']) => {
    switch (state) {
      case 'open': return '🟢';
      case 'merged': return '🟣';
      case 'closed': return '🔴';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            YERP GitHub 분석
          </h1>
          <p className="text-gray-300 text-lg">
            한마당 3.0 프로젝트의 개발 현황을 한눈에 확인하세요
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>github.com/yooshinYERP/yerp</span>
          </div>
        </div>

        {/* 프로젝트 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-white">{projectStats.totalCommits.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">총 커밋</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-purple-400">{projectStats.totalContributors}</div>
            <div className="text-gray-400 text-sm">기여자</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-blue-400">{projectStats.activeBranches}</div>
            <div className="text-gray-400 text-sm">활성 브랜치</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-green-400">{projectStats.openPRs}</div>
            <div className="text-gray-400 text-sm">열린 PR</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-emerald-400">+{(projectStats.totalAdditions / 1000).toFixed(1)}k</div>
            <div className="text-gray-400 text-sm">추가된 줄</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700 text-center transform hover:scale-105 transition-transform">
            <div className="text-3xl font-bold text-red-400">-{(projectStats.totalDeletions / 1000).toFixed(1)}k</div>
            <div className="text-gray-400 text-sm">삭제된 줄</div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6 bg-gray-800/30 backdrop-blur-lg rounded-xl p-1">
          {[
            { id: 'overview', label: '개요', icon: '📊' },
            { id: 'contributors', label: '기여자', icon: '👥' },
            { id: 'activity', label: '활동', icon: '📈' },
            { id: 'branches', label: '브랜치', icon: '🌿' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 컨텐츠 영역 */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
          {/* 개요 탭 */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 언어 통계 */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">사용 언어</h3>
                <div className="space-y-3">
                  {languages.map(lang => (
                    <div key={lang.name} className="flex items-center gap-4">
                      <div className="w-24 text-gray-300">{lang.name}</div>
                      <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full transition-all duration-1000 flex items-center justify-end pr-2"
                          style={{ 
                            width: `${lang.percentage}%`,
                            backgroundColor: lang.color
                          }}
                        >
                          <span className="text-xs text-white font-semibold">{lang.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 최근 PR */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">최근 Pull Requests</h3>
                <div className="space-y-3">
                  {pullRequests.slice(0, 3).map(pr => (
                    <div key={pr.number} className="bg-gray-900/50 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-400">#{pr.number}</span>
                            <h4 className="text-white font-semibold">{pr.title}</h4>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>👤 {pr.author}</span>
                            <span>⏰ {pr.createdAt}</span>
                            <span>👁️ {pr.reviewers}명 리뷰</span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPRStateColor(pr.state)}`}>
                          {getPRStateIcon(pr.state)} {pr.state.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 기여자 탭 */}
          {activeTab === 'contributors' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">프로젝트 기여자 순위</h3>
              <div className="space-y-4">
                {contributors.map((contributor, index) => (
                  <div key={contributor.name} className="bg-gray-900/50 rounded-xl p-6 border border-gray-600 hover:border-purple-500 transition-all duration-200 transform hover:scale-[1.01]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{contributor.avatar}</div>
                        <div>
                          <h4 className="text-xl font-semibold text-white flex items-center gap-2">
                            {index === 0 && <span className="text-yellow-400">🏆</span>}
                            {index === 1 && <span className="text-gray-300">🥈</span>}
                            {index === 2 && <span className="text-orange-400">🥉</span>}
                            {contributor.name}
                          </h4>
                          <p className="text-gray-400">전체 커밋의 {contributor.percentage}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-400">{contributor.commits}</div>
                        <div className="text-sm text-gray-400">커밋</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-green-400 font-semibold">+{contributor.additions.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">추가</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-red-400 font-semibold">-{contributor.deletions.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">삭제</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-blue-400 font-semibold">{(contributor.additions - contributor.deletions).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">순 기여</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 활동 탭 */}
          {activeTab === 'activity' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">커밋 활동</h3>
                <div className="flex gap-2">
                  {(['week', 'month', 'year'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        timeRange === range
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {range === 'week' ? '주간' : range === 'month' ? '월간' : '연간'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 커밋 그래프 */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-600">
                <div className="h-64 flex items-end gap-1">
                  {commitActivity.slice(-30).map((day, index) => {
                    const maxCount = Math.max(...commitActivity.map(d => d.count));
                    const height = (day.count / maxCount) * 100;
                    return (
                      <div
                        key={index}
                        className="flex-1 bg-gradient-to-t from-purple-600 to-pink-600 rounded-t hover:from-purple-500 hover:to-pink-500 transition-all duration-200 relative group"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {day.count} 커밋
                          <br />
                          {new Date(day.date).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-center text-gray-400 text-sm">
                  최근 30일간 커밋 활동
                </div>
              </div>

              {/* 활동 통계 */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-600 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {Math.round(commitActivity.reduce((sum, d) => sum + d.count, 0) / commitActivity.length)}
                  </div>
                  <div className="text-gray-400 text-sm">일 평균 커밋</div>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-600 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {Math.max(...commitActivity.map(d => d.count))}
                  </div>
                  <div className="text-gray-400 text-sm">최대 일일 커밋</div>
                </div>
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-600 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {commitActivity.filter(d => d.count > 20).length}
                  </div>
                  <div className="text-gray-400 text-sm">활발한 날 (20+ 커밋)</div>
                </div>
              </div>
            </div>
          )}

          {/* 브랜치 탭 */}
          {activeTab === 'branches' && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">브랜치 상태</h3>
              <div className="space-y-3">
                {branches.map(branch => (
                  <div key={branch.name} className={`bg-gray-900/50 rounded-lg p-4 border ${
                    branch.isActive ? 'border-green-600' : 'border-gray-600'
                  } hover:border-purple-500 transition-colors`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          branch.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                        }`} />
                        <div>
                          <h4 className="text-white font-semibold flex items-center gap-2">
                            {branch.name}
                            {branch.name === 'main' && <span className="text-xs bg-blue-600 px-2 py-1 rounded">DEFAULT</span>}
                          </h4>
                          <p className="text-gray-400 text-sm">마지막 커밋: {branch.lastCommit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        {branch.ahead > 0 && (
                          <span className="text-green-400">↑ {branch.ahead} ahead</span>
                        )}
                        {branch.behind > 0 && (
                          <span className="text-orange-400">↓ {branch.behind} behind</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 하단 정보 */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>실시간 데이터는 GitHub API를 통해 가져옵니다</p>
          <p className="mt-2">
            <button className="text-purple-400 hover:text-purple-300 transition-colors">
              🔄 데이터 새로고침
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}