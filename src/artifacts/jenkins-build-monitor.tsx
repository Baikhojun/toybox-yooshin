import React, { useState, useEffect } from 'react';

export const metadata = {
  id: 'jenkins-build-monitor',
  title: 'Jenkins 빌드 모니터',
  description: '여러 Jenkins 서버의 빌드 상태를 실시간으로 모니터링하는 대시보드',
  type: 'react' as const,
  tags: ['jenkins', 'ci/cd', 'monitoring', 'dashboard'],
  category: 'engineering',
  createdAt: new Date('2025-07-29').toISOString(),
  updatedAt: new Date('2025-07-29').toISOString(),
};

interface JenkinsServer {
  id: string;
  name: string;
  url: string;
  status: 'online' | 'offline' | 'error';
}

interface Build {
  id: string;
  jobName: string;
  buildNumber: number;
  status: 'success' | 'failed' | 'building' | 'unstable' | 'aborted';
  timestamp: Date;
  duration: number;
  progress?: number;
  culprits?: string[];
  server: string;
}

export default function JenkinsBuildMonitor() {
  const [servers] = useState<JenkinsServer[]>([
    { id: 'erp-jenkins', name: 'ERP Jenkins', url: 'http://172.16.0.14:9050/', status: 'online' },
    { id: 'yerp-jenkins', name: 'YERP Jenkins', url: 'http://172.16.0.29:9050/', status: 'online' }
  ]);

  const [builds, setBuilds] = useState<Build[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // 모의 빌드 데이터 생성
  useEffect(() => {
    const generateMockBuilds = () => {
      const jobNames = [
        'ERP-Frontend-Build',
        'ERP-Backend-API',
        'YERP-Main-Service',
        'Database-Migration',
        'Integration-Tests',
        'Performance-Tests',
        'Security-Scan',
        'Documentation-Build'
      ];

      const statuses: Build['status'][] = ['success', 'failed', 'building', 'unstable', 'aborted'];
      const developers = ['김개발', '이코딩', '박자바', '최디비', '정테스트'];

      const mockBuilds: Build[] = [];

      servers.forEach(server => {
        jobNames.forEach((jobName, index) => {
          const isBuilding = Math.random() > 0.8;
          const status = isBuilding ? 'building' : statuses[Math.floor(Math.random() * (statuses.length - 1))];
          
          mockBuilds.push({
            id: `${server.id}-${jobName}-${Date.now()}`,
            jobName,
            buildNumber: Math.floor(Math.random() * 500) + 100,
            status,
            timestamp: new Date(Date.now() - Math.random() * 86400000),
            duration: isBuilding ? Date.now() - (Date.now() - Math.random() * 600000) : Math.random() * 600000,
            progress: isBuilding ? Math.floor(Math.random() * 100) : undefined,
            culprits: status === 'failed' ? [developers[Math.floor(Math.random() * developers.length)]] : undefined,
            server: server.name
          });
        });
      });

      setBuilds(mockBuilds.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    };

    generateMockBuilds();

    if (autoRefresh) {
      const interval = setInterval(generateMockBuilds, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, servers]);

  const getStatusColor = (status: Build['status']) => {
    switch (status) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'failed':
        return 'bg-gradient-to-r from-red-500 to-rose-600';
      case 'building':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600';
      case 'unstable':
        return 'bg-gradient-to-r from-yellow-500 to-amber-600';
      case 'aborted':
        return 'bg-gradient-to-r from-gray-500 to-slate-600';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getStatusIcon = (status: Build['status']) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'failed':
        return '❌';
      case 'building':
        return '🔄';
      case 'unstable':
        return '⚠️';
      case 'aborted':
        return '⏹️';
      default:
        return '❓';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds % 60}초`;
    }
    return `${seconds}초`;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  const filteredBuilds = builds.filter(build => {
    const serverMatch = selectedServer === 'all' || build.server === selectedServer;
    const statusMatch = filterStatus === 'all' || build.status === filterStatus;
    return serverMatch && statusMatch;
  });

  const stats = {
    total: filteredBuilds.length,
    success: filteredBuilds.filter(b => b.status === 'success').length,
    failed: filteredBuilds.filter(b => b.status === 'failed').length,
    building: filteredBuilds.filter(b => b.status === 'building').length,
  };

  const successRate = stats.total > 0 ? Math.round((stats.success / (stats.total - stats.building)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Jenkins 빌드 모니터
          </h1>
          <p className="text-gray-300 text-lg text-center">
            실시간 빌드 상태 모니터링 대시보드
          </p>
        </div>

        {/* 서버 상태 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {servers.map(server => (
            <div
              key={server.id}
              className={`bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border ${
                server.status === 'online' ? 'border-green-500' : 'border-red-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{server.name}</h3>
                  <p className="text-sm text-gray-400">{server.url}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  server.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                } animate-pulse`} />
              </div>
            </div>
          ))}
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
            <div className="text-gray-400">전체 빌드</div>
          </div>
          <div className="bg-green-900/30 backdrop-blur-lg rounded-xl p-6 border border-green-700">
            <div className="text-3xl font-bold text-green-400 mb-2">{stats.success}</div>
            <div className="text-green-300">성공</div>
          </div>
          <div className="bg-red-900/30 backdrop-blur-lg rounded-xl p-6 border border-red-700">
            <div className="text-3xl font-bold text-red-400 mb-2">{stats.failed}</div>
            <div className="text-red-300">실패</div>
          </div>
          <div className="bg-blue-900/30 backdrop-blur-lg rounded-xl p-6 border border-blue-700">
            <div className="text-3xl font-bold text-blue-400 mb-2">{successRate}%</div>
            <div className="text-blue-300">성공률</div>
          </div>
        </div>

        {/* 필터 및 설정 */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 mb-6 border border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <select
                value={selectedServer}
                onChange={(e) => setSelectedServer(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">모든 서버</option>
                {servers.map(server => (
                  <option key={server.id} value={server.name}>{server.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">모든 상태</option>
                <option value="success">성공</option>
                <option value="failed">실패</option>
                <option value="building">빌드 중</option>
                <option value="unstable">불안정</option>
                <option value="aborted">중단됨</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                자동 새로고침
              </label>

              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="bg-gray-700 text-white px-3 py-1 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value={10}>10초</option>
                  <option value={30}>30초</option>
                  <option value={60}>1분</option>
                  <option value={300}>5분</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* 빌드 목록 */}
        <div className="space-y-4">
          {filteredBuilds.map(build => (
            <div
              key={build.id}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{getStatusIcon(build.status)}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{build.jobName}</h3>
                    <p className="text-sm text-gray-400">
                      #{build.buildNumber} • {build.server} • {formatTimestamp(build.timestamp)}
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg text-white font-semibold ${getStatusColor(build.status)}`}>
                  {build.status === 'building' ? `빌드 중 ${build.progress}%` : build.status.toUpperCase()}
                </div>
              </div>

              {build.status === 'building' && build.progress !== undefined && (
                <div className="mb-4">
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${build.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400">
                  소요 시간: {formatDuration(build.duration)}
                </div>
                {build.culprits && build.culprits.length > 0 && (
                  <div className="text-red-400">
                    담당자: {build.culprits.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredBuilds.length === 0 && (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-12 border border-gray-700 text-center">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-gray-400 text-lg">일치하는 빌드가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}