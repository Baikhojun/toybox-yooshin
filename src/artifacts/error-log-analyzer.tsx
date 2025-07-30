import React, { useState, useEffect } from 'react';

export const metadata = {
  id: 'error-log-analyzer',
  title: '에러 로그 분석기',
  description: '로그 파일을 분석하여 에러 패턴과 해결방안을 제시하는 도구',
  type: 'react' as const,
  tags: ['log', 'error', 'debugging', 'analysis'],
  category: 'engineering',
  createdAt: new Date('2025-07-29').toISOString(),
  updatedAt: new Date('2025-07-29').toISOString(),
};

interface ErrorPattern {
  id: string;
  pattern: RegExp;
  type: 'error' | 'warning' | 'critical';
  title: string;
  description: string;
  solution: string[];
  frequency?: number;
}

interface ParsedError {
  timestamp?: string;
  level: string;
  message: string;
  stackTrace?: string;
  pattern?: ErrorPattern;
  lineNumber: number;
}

export default function ErrorLogAnalyzer() {
  const [logInput, setLogInput] = useState('');
  const [parsedErrors, setParsedErrors] = useState<ParsedError[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedError, setSelectedError] = useState<ParsedError | null>(null);
  const [filterLevel, setFilterLevel] = useState<'all' | 'error' | 'warning' | 'critical'>('all');

  // 에러 패턴 정의
  const errorPatterns: ErrorPattern[] = [
    {
      id: 'null-pointer',
      pattern: /NullPointerException|Cannot read prop.*of null|null.*reference/i,
      type: 'error',
      title: 'Null 참조 오류',
      description: '객체가 null인 상태에서 속성이나 메서드에 접근하려고 시도했습니다.',
      solution: [
        '변수 사용 전 null 체크 추가',
        'Optional 또는 null-safe 연산자 사용',
        '객체 초기화 확인'
      ]
    },
    {
      id: 'db-connection',
      pattern: /Connection.*refused|Cannot.*connect.*database|DB.*timeout/i,
      type: 'critical',
      title: '데이터베이스 연결 실패',
      description: '데이터베이스 서버에 연결할 수 없습니다.',
      solution: [
        'DB 서버 상태 확인',
        '연결 문자열 및 포트 확인',
        '방화벽 설정 검토',
        'DB 서버 재시작 고려'
      ]
    },
    {
      id: 'out-of-memory',
      pattern: /OutOfMemoryError|heap.*space|memory.*exhausted/i,
      type: 'critical',
      title: '메모리 부족',
      description: '애플리케이션이 사용 가능한 메모리를 초과했습니다.',
      solution: [
        'JVM 힙 메모리 증가 (-Xmx 옵션)',
        '메모리 누수 확인',
        '대용량 데이터 처리 로직 최적화',
        '불필요한 객체 참조 제거'
      ]
    },
    {
      id: 'sql-syntax',
      pattern: /SQL.*syntax.*error|Invalid.*SQL|SQLException/i,
      type: 'error',
      title: 'SQL 구문 오류',
      description: 'SQL 쿼리에 문법 오류가 있습니다.',
      solution: [
        'SQL 쿼리 문법 확인',
        '테이블 및 컬럼명 확인',
        '파라미터 바인딩 확인',
        'DB 버전별 문법 차이 확인'
      ]
    },
    {
      id: 'file-not-found',
      pattern: /FileNotFoundException|No such file|file.*not.*found/i,
      type: 'warning',
      title: '파일을 찾을 수 없음',
      description: '지정된 파일이 존재하지 않습니다.',
      solution: [
        '파일 경로 확인',
        '파일 권한 확인',
        '상대/절대 경로 검토',
        '파일 존재 여부 사전 체크 로직 추가'
      ]
    },
    {
      id: 'timeout',
      pattern: /Timeout|Request.*timed out|Operation.*timeout/i,
      type: 'warning',
      title: '작업 시간 초과',
      description: '작업이 지정된 시간 내에 완료되지 않았습니다.',
      solution: [
        'Timeout 값 증가',
        '네트워크 상태 확인',
        '작업 로직 최적화',
        '비동기 처리 고려'
      ]
    }
  ];

  const analyzeLog = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const lines = logInput.split('\n');
      const errors: ParsedError[] = [];
      
      lines.forEach((line, index) => {
        if (line.trim()) {
          // 타임스탬프 추출
          const timestampMatch = line.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/);
          const timestamp = timestampMatch ? timestampMatch[0] : undefined;
          
          // 로그 레벨 추출
          const levelMatch = line.match(/\b(ERROR|WARN|WARNING|CRITICAL|FATAL|INFO|DEBUG)\b/i);
          const level = levelMatch ? levelMatch[1].toUpperCase() : 'INFO';
          
          // 에러 패턴 매칭
          let matchedPattern: ErrorPattern | undefined;
          for (const pattern of errorPatterns) {
            if (pattern.pattern.test(line)) {
              matchedPattern = { ...pattern, frequency: (pattern.frequency || 0) + 1 };
              break;
            }
          }
          
          if (level === 'ERROR' || level === 'WARN' || level === 'WARNING' || level === 'CRITICAL' || level === 'FATAL' || matchedPattern) {
            errors.push({
              timestamp,
              level,
              message: line,
              pattern: matchedPattern,
              lineNumber: index + 1
            });
          }
        }
      });
      
      setParsedErrors(errors);
      setIsAnalyzing(false);
    }, 1000);
  };

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL':
      case 'FATAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ERROR':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'WARN':
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type?: 'error' | 'warning' | 'critical') => {
    switch (type) {
      case 'critical':
        return '🚨';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '📋';
    }
  };

  const filteredErrors = parsedErrors.filter(error => {
    if (filterLevel === 'all') return true;
    if (filterLevel === 'critical') return error.level === 'CRITICAL' || error.level === 'FATAL';
    if (filterLevel === 'error') return error.level === 'ERROR';
    if (filterLevel === 'warning') return error.level === 'WARN' || error.level === 'WARNING';
    return true;
  });

  const errorStats = {
    total: parsedErrors.length,
    critical: parsedErrors.filter(e => e.level === 'CRITICAL' || e.level === 'FATAL').length,
    error: parsedErrors.filter(e => e.level === 'ERROR').length,
    warning: parsedErrors.filter(e => e.level === 'WARN' || e.level === 'WARNING').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            에러 로그 분석기
          </h1>
          <p className="text-gray-300 text-lg">
            로그를 붙여넣으면 AI가 에러 패턴을 분석하고 해결방안을 제시합니다
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 입력 영역 */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">📝</span> 로그 입력
            </h2>
            <textarea
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              placeholder="여기에 로그를 붙여넣으세요..."
              className="w-full h-96 p-4 bg-gray-900/50 text-gray-100 rounded-lg font-mono text-sm border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
            />
            <button
              onClick={analyzeLog}
              disabled={!logInput.trim() || isAnalyzing}
              className={`mt-4 w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                !logInput.trim() || isAnalyzing
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02]'
              }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  분석 중...
                </span>
              ) : '🔍 로그 분석 시작'}
            </button>
          </div>

          {/* 분석 결과 영역 */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center justify-between">
              <span><span className="mr-2">📊</span> 분석 결과</span>
              {parsedErrors.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterLevel('all')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      filterLevel === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    전체 ({errorStats.total})
                  </button>
                  <button
                    onClick={() => setFilterLevel('critical')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      filterLevel === 'critical' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    심각 ({errorStats.critical})
                  </button>
                  <button
                    onClick={() => setFilterLevel('error')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      filterLevel === 'error' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    에러 ({errorStats.error})
                  </button>
                  <button
                    onClick={() => setFilterLevel('warning')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      filterLevel === 'warning' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    경고 ({errorStats.warning})
                  </button>
                </div>
              )}
            </h2>

            {parsedErrors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <span className="text-6xl mb-4">🔍</span>
                <p>로그를 입력하고 분석을 시작하세요</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {filteredErrors.map((error, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedError(error)}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-600 hover:border-purple-500 cursor-pointer transition-all duration-200 hover:transform hover:scale-[1.02]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getTypeIcon(error.pattern?.type)}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getLevelColor(error.level)}`}>
                          {error.level}
                        </span>
                        {error.timestamp && (
                          <span className="text-gray-400 text-xs">{error.timestamp}</span>
                        )}
                      </div>
                      <span className="text-gray-500 text-xs">Line {error.lineNumber}</span>
                    </div>
                    {error.pattern && (
                      <p className="text-white font-semibold mb-1">{error.pattern.title}</p>
                    )}
                    <p className="text-gray-300 text-sm font-mono truncate">{error.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 상세 해결방안 모달 */}
        {selectedError && selectedError.pattern && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50" onClick={() => setSelectedError(null)}>
            <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-600 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getTypeIcon(selectedError.pattern.type)}</span>
                  <h3 className="text-2xl font-bold text-white">{selectedError.pattern.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedError(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">문제 설명</h4>
                  <p className="text-gray-300">{selectedError.pattern.description}</p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">에러 메시지</h4>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <code className="text-sm text-gray-300 break-all">{selectedError.message}</code>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">해결 방안</h4>
                  <ul className="space-y-2">
                    {selectedError.pattern.solution.map((solution, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-300">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 통계 요약 */}
        {parsedErrors.length > 0 && (
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700 text-center">
              <div className="text-3xl font-bold text-white">{errorStats.total}</div>
              <div className="text-gray-400 text-sm">전체 이슈</div>
            </div>
            <div className="bg-red-900/30 backdrop-blur-lg rounded-xl p-4 border border-red-700 text-center">
              <div className="text-3xl font-bold text-red-400">{errorStats.critical}</div>
              <div className="text-red-300 text-sm">심각</div>
            </div>
            <div className="bg-orange-900/30 backdrop-blur-lg rounded-xl p-4 border border-orange-700 text-center">
              <div className="text-3xl font-bold text-orange-400">{errorStats.error}</div>
              <div className="text-orange-300 text-sm">에러</div>
            </div>
            <div className="bg-yellow-900/30 backdrop-blur-lg rounded-xl p-4 border border-yellow-700 text-center">
              <div className="text-3xl font-bold text-yellow-400">{errorStats.warning}</div>
              <div className="text-yellow-300 text-sm">경고</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}