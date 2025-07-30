import React, { useState, useEffect } from 'react';

export const metadata = {
  id: 'deployment-checklist',
  title: '배포 체크리스트',
  description: '배포 전후 체크리스트와 롤백 시나리오를 관리하는 도구',
  type: 'react' as const,
  tags: ['deployment', 'checklist', 'devops', 'rollback'],
  category: 'engineering',
  createdAt: new Date('2025-07-29').toISOString(),
  updatedAt: new Date('2025-07-29').toISOString(),
};

interface CheckItem {
  id: string;
  text: string;
  checked: boolean;
  required: boolean;
  category: 'pre' | 'post' | 'rollback';
  severity: 'critical' | 'important' | 'optional';
  description?: string;
}

interface DeploymentInfo {
  version: string;
  environment: 'development' | 'staging' | 'production';
  deploymentType: 'backend' | 'frontend' | 'database' | 'full';
  scheduledTime: string;
  responsible: string;
}

export default function DeploymentChecklist() {
  const [checkItems, setCheckItems] = useState<CheckItem[]>([
    // 배포 전 체크리스트
    {
      id: 'pre-1',
      text: '코드 리뷰 완료',
      checked: false,
      required: true,
      category: 'pre',
      severity: 'critical',
      description: '모든 PR이 승인되고 머지되었는지 확인'
    },
    {
      id: 'pre-2',
      text: '단위 테스트 통과',
      checked: false,
      required: true,
      category: 'pre',
      severity: 'critical',
      description: '모든 단위 테스트가 성공적으로 통과했는지 확인'
    },
    {
      id: 'pre-3',
      text: '통합 테스트 완료',
      checked: false,
      required: true,
      category: 'pre',
      severity: 'critical',
      description: 'E2E 테스트 및 API 통합 테스트 완료'
    },
    {
      id: 'pre-4',
      text: '데이터베이스 백업',
      checked: false,
      required: true,
      category: 'pre',
      severity: 'critical',
      description: '운영 DB의 전체 백업 완료 및 복구 테스트'
    },
    {
      id: 'pre-5',
      text: '배포 공지',
      checked: false,
      required: true,
      category: 'pre',
      severity: 'important',
      description: '관련 팀에 배포 일정 및 영향도 공지'
    },
    {
      id: 'pre-6',
      text: '로드밸런서 설정 확인',
      checked: false,
      required: false,
      category: 'pre',
      severity: 'important',
      description: '무중단 배포를 위한 로드밸런서 설정 확인'
    },
    {
      id: 'pre-7',
      text: '환경 변수 확인',
      checked: false,
      required: true,
      category: 'pre',
      severity: 'critical',
      description: '운영 환경 변수 및 시크릿 설정 확인'
    },
    {
      id: 'pre-8',
      text: '롤백 계획 수립',
      checked: false,
      required: true,
      category: 'pre',
      severity: 'critical',
      description: '문제 발생 시 롤백 절차 및 담당자 확인'
    },
    // 배포 후 체크리스트
    {
      id: 'post-1',
      text: '서비스 정상 작동 확인',
      checked: false,
      required: true,
      category: 'post',
      severity: 'critical',
      description: '주요 기능 및 API 엔드포인트 동작 확인'
    },
    {
      id: 'post-2',
      text: '로그 모니터링',
      checked: false,
      required: true,
      category: 'post',
      severity: 'critical',
      description: '에러 로그 및 예외 상황 모니터링'
    },
    {
      id: 'post-3',
      text: '성능 지표 확인',
      checked: false,
      required: true,
      category: 'post',
      severity: 'important',
      description: 'CPU, 메모리, 응답시간 등 성능 지표 확인'
    },
    {
      id: 'post-4',
      text: '데이터베이스 연결 확인',
      checked: false,
      required: true,
      category: 'post',
      severity: 'critical',
      description: 'DB 커넥션 풀 및 쿼리 성능 확인'
    },
    {
      id: 'post-5',
      text: '외부 서비스 연동 확인',
      checked: false,
      required: false,
      category: 'post',
      severity: 'important',
      description: '결제, 인증 등 외부 API 연동 확인'
    },
    {
      id: 'post-6',
      text: '캐시 서버 동작 확인',
      checked: false,
      required: false,
      category: 'post',
      severity: 'optional',
      description: 'Redis, Memcached 등 캐시 서버 정상 동작 확인'
    },
    // 롤백 체크리스트
    {
      id: 'rollback-1',
      text: '롤백 결정 회의',
      checked: false,
      required: true,
      category: 'rollback',
      severity: 'critical',
      description: '관련 담당자와 롤백 필요성 논의'
    },
    {
      id: 'rollback-2',
      text: '이전 버전 태그 확인',
      checked: false,
      required: true,
      category: 'rollback',
      severity: 'critical',
      description: '롤백할 안정적인 이전 버전 확인'
    },
    {
      id: 'rollback-3',
      text: '데이터 마이그레이션 검토',
      checked: false,
      required: true,
      category: 'rollback',
      severity: 'critical',
      description: 'DB 스키마 변경사항 롤백 가능 여부 확인'
    },
    {
      id: 'rollback-4',
      text: '롤백 실행',
      checked: false,
      required: true,
      category: 'rollback',
      severity: 'critical',
      description: '이전 버전으로 배포 실행'
    },
    {
      id: 'rollback-5',
      text: '롤백 후 검증',
      checked: false,
      required: true,
      category: 'rollback',
      severity: 'critical',
      description: '롤백 후 서비스 정상 동작 확인'
    }
  ]);

  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo>({
    version: '',
    environment: 'production',
    deploymentType: 'full',
    scheduledTime: new Date().toISOString().slice(0, 16),
    responsible: ''
  });

  const [activeTab, setActiveTab] = useState<'pre' | 'post' | 'rollback'>('pre');
  const [showReport, setShowReport] = useState(false);

  const toggleCheck = (id: string) => {
    setCheckItems(items =>
      items.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const getProgress = (category: 'pre' | 'post' | 'rollback') => {
    const categoryItems = checkItems.filter(item => item.category === category);
    const checkedItems = categoryItems.filter(item => item.checked);
    return Math.round((checkedItems.length / categoryItems.length) * 100);
  };

  const getRequiredUnchecked = (category: 'pre' | 'post' | 'rollback') => {
    return checkItems.filter(
      item => item.category === category && item.required && !item.checked
    );
  };

  const getSeverityColor = (severity: CheckItem['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 border-red-500';
      case 'important':
        return 'text-yellow-500 border-yellow-500';
      case 'optional':
        return 'text-blue-500 border-blue-500';
    }
  };

  const getSeverityBadge = (severity: CheckItem['severity']) => {
    switch (severity) {
      case 'critical':
        return '🔴 필수';
      case 'important':
        return '🟡 중요';
      case 'optional':
        return '🔵 선택';
    }
  };

  const canProceed = (category: 'pre' | 'post' | 'rollback') => {
    const requiredUnchecked = getRequiredUnchecked(category);
    return requiredUnchecked.length === 0;
  };

  const generateReport = () => {
    const report = {
      deploymentInfo,
      timestamp: new Date().toISOString(),
      checklistStatus: {
        pre: getProgress('pre'),
        post: getProgress('post'),
        rollback: getProgress('rollback')
      },
      completedItems: checkItems.filter(item => item.checked),
      pendingItems: checkItems.filter(item => !item.checked)
    };
    
    console.log('Deployment Report:', report);
    setShowReport(true);
  };

  const tabData = [
    { id: 'pre', label: '배포 전', icon: '📋', color: 'from-blue-600 to-indigo-600' },
    { id: 'post', label: '배포 후', icon: '✅', color: 'from-green-600 to-emerald-600' },
    { id: 'rollback', label: '롤백', icon: '⚠️', color: 'from-red-600 to-rose-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            배포 체크리스트
          </h1>
          <p className="text-gray-300 text-lg">
            안전한 배포를 위한 단계별 체크리스트 관리
          </p>
        </div>

        {/* 배포 정보 입력 */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📝</span> 배포 정보
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">버전</label>
              <input
                type="text"
                value={deploymentInfo.version}
                onChange={(e) => setDeploymentInfo({...deploymentInfo, version: e.target.value})}
                placeholder="v1.2.3"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">환경</label>
              <select
                value={deploymentInfo.environment}
                onChange={(e) => setDeploymentInfo({...deploymentInfo, environment: e.target.value as DeploymentInfo['environment']})}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none"
              >
                <option value="development">개발</option>
                <option value="staging">스테이징</option>
                <option value="production">운영</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">배포 유형</label>
              <select
                value={deploymentInfo.deploymentType}
                onChange={(e) => setDeploymentInfo({...deploymentInfo, deploymentType: e.target.value as DeploymentInfo['deploymentType']})}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none"
              >
                <option value="backend">백엔드</option>
                <option value="frontend">프론트엔드</option>
                <option value="database">데이터베이스</option>
                <option value="full">전체</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">예정 시간</label>
              <input
                type="datetime-local"
                value={deploymentInfo.scheduledTime}
                onChange={(e) => setDeploymentInfo({...deploymentInfo, scheduledTime: e.target.value})}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">담당자</label>
              <input
                type="text"
                value={deploymentInfo.responsible}
                onChange={(e) => setDeploymentInfo({...deploymentInfo, responsible: e.target.value})}
                placeholder="이름 입력"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={generateReport}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-[1.02]"
              >
                📄 리포트 생성
              </button>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-4 mb-6">
          {tabData.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} shadow-lg`
                  : 'bg-gray-800/50 backdrop-blur-lg border border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{tab.icon}</span>
                <span>{tab.label}</span>
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-sm">
                  {getProgress(tab.id as typeof activeTab)}%
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* 체크리스트 */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-white">
              {tabData.find(t => t.id === activeTab)?.icon} {tabData.find(t => t.id === activeTab)?.label} 체크리스트
            </h3>
            {!canProceed(activeTab) && (
              <div className="px-4 py-2 bg-red-900/50 border border-red-600 rounded-lg text-red-300">
                ⚠️ 필수 항목을 모두 완료해주세요
              </div>
            )}
          </div>

          {/* 진행률 바 */}
          <div className="mb-6">
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${tabData.find(t => t.id === activeTab)?.color} transition-all duration-500`}
                style={{ width: `${getProgress(activeTab)}%` }}
              />
            </div>
          </div>

          {/* 체크 항목들 */}
          <div className="space-y-3">
            {checkItems
              .filter(item => item.category === activeTab)
              .map(item => (
                <div
                  key={item.id}
                  className={`bg-gray-900/50 rounded-lg p-4 border transition-all duration-200 hover:bg-gray-900/70 ${
                    item.checked ? 'border-green-600' : getSeverityColor(item.severity)
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleCheck(item.id)}
                      className="w-5 h-5 mt-1 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-semibold ${item.checked ? 'text-green-400 line-through' : 'text-white'}`}>
                          {item.text}
                        </h4>
                        <span className="text-sm">{getSeverityBadge(item.severity)}</span>
                      </div>
                      {item.description && (
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* 다음 단계 버튼 */}
          {activeTab === 'pre' && canProceed('pre') && (
            <button
              onClick={() => setActiveTab('post')}
              className="mt-6 w-full py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-[1.02]"
            >
              배포 진행 → 배포 후 체크리스트로 이동
            </button>
          )}
        </div>

        {/* 리포트 모달 */}
        {showReport && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50" onClick={() => setShowReport(false)}>
            <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-600 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">📊 배포 리포트</h3>
                <button
                  onClick={() => setShowReport(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">배포 정보</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">버전:</div>
                    <div className="text-white">{deploymentInfo.version || 'N/A'}</div>
                    <div className="text-gray-400">환경:</div>
                    <div className="text-white">{deploymentInfo.environment}</div>
                    <div className="text-gray-400">담당자:</div>
                    <div className="text-white">{deploymentInfo.responsible || 'N/A'}</div>
                    <div className="text-gray-400">시간:</div>
                    <div className="text-white">{new Date(deploymentInfo.scheduledTime).toLocaleString()}</div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">진행 상황</h4>
                  <div className="space-y-2">
                    {tabData.map(tab => (
                      <div key={tab.id} className="flex items-center justify-between">
                        <span className="text-gray-300">{tab.icon} {tab.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-full bg-gradient-to-r ${tab.color} rounded-full`}
                              style={{ width: `${getProgress(tab.id as typeof activeTab)}%` }}
                            />
                          </div>
                          <span className="text-white text-sm">{getProgress(tab.id as typeof activeTab)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const reportData = {
                      deploymentInfo,
                      timestamp: new Date().toISOString(),
                      checklistStatus: {
                        pre: getProgress('pre'),
                        post: getProgress('post'),
                        rollback: getProgress('rollback')
                      },
                      items: checkItems
                    };
                    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
                    alert('리포트가 클립보드에 복사되었습니다!');
                  }}
                  className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                >
                  📋 리포트 복사
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}