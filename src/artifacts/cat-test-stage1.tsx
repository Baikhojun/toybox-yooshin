import React, { useState, useEffect, useRef, useCallback } from 'react';

// CAT 1단계 - 시각적 주의력 검사
export const metadata = {
  id: 'cat-test-stage1',
  title: 'CAT 검사 1단계 - 시각적 주의력',
  description: 'ADHD 진단을 위한 종합주의력검사(CAT) 1단계 - X를 제외한 도형에 반응하기',
  type: 'react' as const,
  tags: ['adhd', 'test', 'attention', 'cat', 'medical'],
  createdAt: new Date('2025-07-22').toISOString(),
  updatedAt: new Date('2025-07-22').toISOString(),
};

// 도형 타입 정의
type ShapeType = 'X' | 'triangle' | 'square' | 'circle' | 'plus';

// 반응 데이터 타입
interface ResponseData {
  shapeType: ShapeType;
  responseTime: number | null;
  isCorrect: boolean;
  errorType: 'commission' | 'omission' | null;
  timestamp: number;
  phase: 'first-half' | 'second-half';
}

// 결과 통계 타입
interface TestResults {
  totalTrials: number;
  correctResponses: number;
  commissionErrors: number;
  omissionErrors: number;
  averageResponseTime: number;
  responseTimeSD: number;
  firstHalfAccuracy: number;
  secondHalfAccuracy: number;
  firstHalfAvgRT: number;
  secondHalfAvgRT: number;
}

export default function CATTestStage1() {
  // 게임 상태
  const [gameState, setGameState] = useState<'intro' | 'practice' | 'test' | 'result'>('intro');
  const [currentShape, setCurrentShape] = useState<ShapeType | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // 데이터 수집
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [results, setResults] = useState<TestResults | null>(null);
  
  // 타이밍 관련
  const shapeStartTime = useRef<number>(0);
  const gameStartTime = useRef<number>(0);
  const shapeTimeout = useRef<NodeJS.Timeout | null>(null);
  const intervalTimeout = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const hasResponded = useRef<boolean>(false);
  
  // 설정
  const SHAPE_DISPLAY_TIME = 500; // 도형 표시 시간 (ms)
  const MIN_INTERVAL = 1500; // 최소 간격 (ms)
  const MAX_INTERVAL = 2500; // 최대 간격 (ms)
  const PRACTICE_DURATION = 30; // 연습 시간 (초)
  const TEST_DURATION = 480; // 실제 테스트 시간 (8분)
  
  // 도형 컴포넌트
  const Shape: React.FC<{ type: ShapeType }> = ({ type }) => {
    const size = 120;
    const strokeWidth = 8;
    
    switch (type) {
      case 'X':
        return (
          <svg width={size} height={size} viewBox="0 0 120 120">
            <line x1="20" y1="20" x2="100" y2="100" stroke="black" strokeWidth={strokeWidth} />
            <line x1="100" y1="20" x2="20" y2="100" stroke="black" strokeWidth={strokeWidth} />
          </svg>
        );
      case 'triangle':
        return (
          <svg width={size} height={size} viewBox="0 0 120 120">
            <polygon points="60,20 100,90 20,90" fill="none" stroke="black" strokeWidth={strokeWidth} />
          </svg>
        );
      case 'square':
        return (
          <svg width={size} height={size} viewBox="0 0 120 120">
            <rect x="20" y="20" width="80" height="80" fill="none" stroke="black" strokeWidth={strokeWidth} />
          </svg>
        );
      case 'circle':
        return (
          <svg width={size} height={size} viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="40" fill="none" stroke="black" strokeWidth={strokeWidth} />
          </svg>
        );
      case 'plus':
        return (
          <svg width={size} height={size} viewBox="0 0 120 120">
            <line x1="60" y1="20" x2="60" y2="100" stroke="black" strokeWidth={strokeWidth} />
            <line x1="20" y1="60" x2="100" y2="60" stroke="black" strokeWidth={strokeWidth} />
          </svg>
        );
    }
  };
  
  // 랜덤 도형 선택
  const getRandomShape = (): ShapeType => {
    const shapes: ShapeType[] = ['X', 'triangle', 'square', 'circle', 'plus'];
    return shapes[Math.floor(Math.random() * shapes.length)];
  };
  
  // 랜덤 간격 생성
  const getRandomInterval = (): number => {
    return Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL + 1)) + MIN_INTERVAL;
  };
  
  // 현재 단계 확인 (전반기/후반기)
  const getCurrentPhase = (): 'first-half' | 'second-half' => {
    const elapsed = Date.now() - gameStartTime.current;
    const duration = gameState === 'practice' ? PRACTICE_DURATION * 1000 : TEST_DURATION * 1000;
    return elapsed < duration / 2 ? 'first-half' : 'second-half';
  };
  
  // 반응 기록
  const recordResponse = (responded: boolean) => {
    if (!currentShape) return;
    
    const responseTime = responded ? Date.now() - shapeStartTime.current : null;
    const shouldRespond = currentShape !== 'X';
    const isCorrect = responded === shouldRespond;
    let errorType: 'commission' | 'omission' | null = null;
    
    if (!isCorrect) {
      if (responded && !shouldRespond) {
        errorType = 'commission'; // X에 반응함
      } else if (!responded && shouldRespond) {
        errorType = 'omission'; // 놓침
      }
    }
    
    const responseData: ResponseData = {
      shapeType: currentShape,
      responseTime,
      isCorrect,
      errorType,
      timestamp: Date.now(),
      phase: getCurrentPhase()
    };
    
    if (gameState === 'test') {
      setResponses(prev => [...prev, responseData]);
    }
  };
  
  // 도형 표시
  const showShape = useCallback(() => {
    if (isPaused) return;
    
    const shape = getRandomShape();
    setCurrentShape(shape);
    shapeStartTime.current = Date.now();
    hasResponded.current = false;
    
    // 도형 숨기기
    shapeTimeout.current = setTimeout(() => {
      if (!hasResponded.current) {
        recordResponse(false);
      }
      setCurrentShape(null);
      
      // 다음 도형 표시
      const interval = getRandomInterval();
      intervalTimeout.current = setTimeout(showShape, interval);
    }, SHAPE_DISPLAY_TIME);
  }, [isPaused, gameState]);
  
  // 키보드 이벤트 처리
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ' && currentShape && !hasResponded.current) {
      e.preventDefault();
      hasResponded.current = true;
      recordResponse(true);
    }
  }, [currentShape]);
  
  // 게임 시작
  const startGame = (mode: 'practice' | 'test') => {
    setGameState(mode);
    setResponses([]);
    gameStartTime.current = Date.now();
    setTimeRemaining(mode === 'practice' ? PRACTICE_DURATION : TEST_DURATION);
    
    // 첫 도형 표시
    setTimeout(showShape, 1000);
    
    // 타이머 시작
    timerInterval.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // 게임 종료
  const endGame = () => {
    // 타이머 정리
    if (shapeTimeout.current) clearTimeout(shapeTimeout.current);
    if (intervalTimeout.current) clearTimeout(intervalTimeout.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
    
    setCurrentShape(null);
    
    if (gameState === 'test') {
      calculateResults();
    } else if (gameState === 'practice') {
      setGameState('intro');
    }
  };
  
  // 결과 계산
  const calculateResults = () => {
    const totalTrials = responses.length;
    const correctResponses = responses.filter(r => r.isCorrect).length;
    const commissionErrors = responses.filter(r => r.errorType === 'commission').length;
    const omissionErrors = responses.filter(r => r.errorType === 'omission').length;
    
    // 반응 시간 계산 (정답만)
    const correctRTs = responses
      .filter(r => r.isCorrect && r.responseTime !== null)
      .map(r => r.responseTime!);
    
    const averageResponseTime = correctRTs.length > 0
      ? correctRTs.reduce((a, b) => a + b, 0) / correctRTs.length
      : 0;
    
    // 표준편차 계산
    const variance = correctRTs.length > 0
      ? correctRTs.reduce((sum, rt) => sum + Math.pow(rt - averageResponseTime, 2), 0) / correctRTs.length
      : 0;
    const responseTimeSD = Math.sqrt(variance);
    
    // 전반기/후반기 분석
    const firstHalf = responses.filter(r => r.phase === 'first-half');
    const secondHalf = responses.filter(r => r.phase === 'second-half');
    
    const firstHalfCorrect = firstHalf.filter(r => r.isCorrect).length;
    const secondHalfCorrect = secondHalf.filter(r => r.isCorrect).length;
    
    const firstHalfAccuracy = firstHalf.length > 0 ? (firstHalfCorrect / firstHalf.length) * 100 : 0;
    const secondHalfAccuracy = secondHalf.length > 0 ? (secondHalfCorrect / secondHalf.length) * 100 : 0;
    
    // 전반기/후반기 반응 시간
    const firstHalfRTs = firstHalf
      .filter(r => r.isCorrect && r.responseTime !== null)
      .map(r => r.responseTime!);
    const secondHalfRTs = secondHalf
      .filter(r => r.isCorrect && r.responseTime !== null)
      .map(r => r.responseTime!);
    
    const firstHalfAvgRT = firstHalfRTs.length > 0
      ? firstHalfRTs.reduce((a, b) => a + b, 0) / firstHalfRTs.length
      : 0;
    const secondHalfAvgRT = secondHalfRTs.length > 0
      ? secondHalfRTs.reduce((a, b) => a + b, 0) / secondHalfRTs.length
      : 0;
    
    const results: TestResults = {
      totalTrials,
      correctResponses,
      commissionErrors,
      omissionErrors,
      averageResponseTime,
      responseTimeSD,
      firstHalfAccuracy,
      secondHalfAccuracy,
      firstHalfAvgRT,
      secondHalfAvgRT
    };
    
    setResults(results);
    setGameState('result');
  };
  
  // 키보드 이벤트 리스너
  useEffect(() => {
    if (gameState === 'practice' || gameState === 'test') {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameState, handleKeyPress]);
  
  // 시간 포맷
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 소개 화면
  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
          <h1 className="text-3xl font-bold mb-6 text-center">CAT 검사 1단계 - 시각적 주의력</h1>
          
          <div className="mb-6 space-y-4">
            <p className="text-lg">이 검사는 당신의 시각적 주의력을 측정합니다.</p>
            
            <div className="bg-blue-50 p-4 rounded">
              <h2 className="font-semibold mb-2">검사 방법:</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>화면 중앙에 다양한 도형이 나타납니다</li>
                <li><strong>X를 제외한</strong> 모든 도형이 나타날 때 <kbd className="px-2 py-1 bg-gray-200 rounded">스페이스바</kbd>를 누르세요</li>
                <li>X가 나타날 때는 아무것도 누르지 마세요</li>
                <li>가능한 빠르고 정확하게 반응하세요</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded">
              <h2 className="font-semibold mb-2">도형 종류:</h2>
              <div className="flex justify-around items-center mt-4">
                <div className="text-center">
                  <Shape type="X" />
                  <p className="mt-2 text-red-600 font-semibold">반응 X</p>
                </div>
                <div className="text-center">
                  <Shape type="triangle" />
                  <p className="mt-2 text-green-600 font-semibold">반응 O</p>
                </div>
                <div className="text-center">
                  <Shape type="square" />
                  <p className="mt-2 text-green-600 font-semibold">반응 O</p>
                </div>
                <div className="text-center">
                  <Shape type="circle" />
                  <p className="mt-2 text-green-600 font-semibold">반응 O</p>
                </div>
                <div className="text-center">
                  <Shape type="plus" />
                  <p className="mt-2 text-green-600 font-semibold">반응 O</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => startGame('practice')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              연습하기 (30초)
            </button>
            <button
              onClick={() => startGame('test')}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              검사 시작 (8분)
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 검사 화면
  if (gameState === 'practice' || gameState === 'test') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        {/* 상단 정보 */}
        <div className="absolute top-4 w-full px-8">
          <div className="flex justify-between items-center text-white">
            <div className="text-lg">
              {gameState === 'practice' ? '연습 모드' : '실제 검사'}
            </div>
            <div className="text-2xl font-mono">
              {formatTime(timeRemaining)}
            </div>
          </div>
          
          {/* 진행 바 */}
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: `${(1 - timeRemaining / (gameState === 'practice' ? PRACTICE_DURATION : TEST_DURATION)) * 100}%` 
              }}
            />
          </div>
        </div>
        
        {/* 도형 표시 영역 */}
        <div className="w-48 h-48 flex items-center justify-center">
          {currentShape && <Shape type={currentShape} />}
        </div>
        
        {/* 하단 안내 */}
        <div className="absolute bottom-8 text-white text-center">
          <p className="text-lg">X를 제외한 도형에 스페이스바를 누르세요</p>
          <kbd className="mt-2 px-4 py-2 bg-gray-700 rounded text-xl">SPACE</kbd>
        </div>
      </div>
    );
  }
  
  // 결과 화면
  if (gameState === 'result' && results) {
    const accuracyRate = (results.correctResponses / results.totalTrials) * 100;
    const accuracyDiff = results.secondHalfAccuracy - results.firstHalfAccuracy;
    const rtDiff = results.secondHalfAvgRT - results.firstHalfAvgRT;
    
    return (
      <div className="min-h-screen bg-gray-100 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">검사 결과</h1>
          
          {/* 전체 요약 */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">전체 수행 요약</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{accuracyRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">전체 정확도</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{results.averageResponseTime.toFixed(0)}ms</div>
                <div className="text-sm text-gray-600">평균 반응시간</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{results.commissionErrors}</div>
                <div className="text-sm text-gray-600">충동성 오류</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{results.omissionErrors}</div>
                <div className="text-sm text-gray-600">부주의 오류</div>
              </div>
            </div>
          </div>
          
          {/* 전반기/후반기 비교 */}
          <div className="mb-8 p-6 bg-yellow-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">시간대별 수행 변화</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">정확도 변화</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>전반기:</span>
                    <span className="font-mono">{results.firstHalfAccuracy.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>후반기:</span>
                    <span className="font-mono">{results.secondHalfAccuracy.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>변화:</span>
                    <span className={`font-mono ${accuracyDiff < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {accuracyDiff > 0 ? '+' : ''}{accuracyDiff.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">반응시간 변화</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>전반기:</span>
                    <span className="font-mono">{results.firstHalfAvgRT.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>후반기:</span>
                    <span className="font-mono">{results.secondHalfAvgRT.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>변화:</span>
                    <span className={`font-mono ${rtDiff > 50 ? 'text-red-600' : 'text-green-600'}`}>
                      {rtDiff > 0 ? '+' : ''}{rtDiff.toFixed(0)}ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 해석 */}
          <div className="mb-8 p-6 bg-green-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">결과 해석</h2>
            <ul className="space-y-2 list-disc list-inside">
              {accuracyDiff < -10 && (
                <li>후반기 정확도가 크게 감소했습니다. 지속적 주의력 유지에 어려움이 있을 수 있습니다.</li>
              )}
              {rtDiff > 100 && (
                <li>후반기 반응시간이 크게 증가했습니다. 피로나 집중력 저하가 나타났을 수 있습니다.</li>
              )}
              {results.commissionErrors > results.totalTrials * 0.1 && (
                <li>충동성 오류가 많습니다. 반응 억제에 어려움이 있을 수 있습니다.</li>
              )}
              {results.omissionErrors > results.totalTrials * 0.15 && (
                <li>부주의 오류가 많습니다. 지속적인 주의 유지에 어려움이 있을 수 있습니다.</li>
              )}
              {results.responseTimeSD > 150 && (
                <li>반응시간의 변동성이 큽니다. 일관된 주의력 유지에 어려움이 있을 수 있습니다.</li>
              )}
              {accuracyRate > 90 && results.responseTimeSD < 100 && (
                <li className="text-green-600">전반적으로 우수한 수행을 보였습니다!</li>
              )}
            </ul>
          </div>
          
          {/* 상세 통계 */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">상세 통계</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>총 시행 수:</div>
              <div className="font-mono">{results.totalTrials}</div>
              
              <div>정답 수:</div>
              <div className="font-mono">{results.correctResponses}</div>
              
              <div>반응시간 표준편차:</div>
              <div className="font-mono">{results.responseTimeSD.toFixed(0)}ms</div>
              
              <div>검사 시간:</div>
              <div className="font-mono">8분</div>
            </div>
          </div>
          
          {/* 다시 검사 버튼 */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setGameState('intro');
                setResults(null);
                setResponses([]);
              }}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              다시 검사하기
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>※ 이 검사는 참고용이며, 정확한 진단은 전문가의 상담이 필요합니다.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}