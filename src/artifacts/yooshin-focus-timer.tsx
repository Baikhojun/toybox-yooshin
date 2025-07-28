import React, { useState, useEffect, useRef, useCallback } from 'react';

// 유신 포커스 타이머
export const metadata = {
  id: 'yooshin-focus-timer',
  title: '유신 Focus Timer',
  description: '유신님을 위한 집중력 향상 포모도로 타이머 - 특별한 기능들',
  type: 'react' as const,
  tags: ['productivity', 'timer', 'focus', 'pomodoro', 'yooshin'],
  category: 'productivity',
  createdAt: new Date('2025-07-22').toISOString(),
  updatedAt: new Date('2025-07-22').toISOString(),
};

export default function YooshinFocusTimer() {
  // 타이머 상태
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isLongBreak, setIsLongBreak] = useState(false);
  
  // 집중력 향상 특화 상태
  const [sessionCount, setSessionCount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(8);
  const [completedToday, setCompletedToday] = useState(0);
  const [miniBreakAlert, setMiniBreakAlert] = useState(false);
  const [hyperFocusMode, setHyperFocusMode] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationText, setMotivationText] = useState('');
  
  // 설정
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [miniBreaksEnabled, setMiniBreaksEnabled] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  
  // 참조
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 동기부여 문구들
  const motivationalQuotes = [
    "한 걸음씩 나아가고 있어요! 💪",
    "집중력이 향상되고 있어요! 🎯",
    "잘하고 있어요! 계속해봐요! ⭐",
    "당신은 할 수 있어요! 🌟",
    "오늘도 최고의 하루! 🚀",
    "작은 성취가 큰 변화를 만들어요! 🌈",
    "지금 이 순간에 집중해요! 🎪",
    "당신의 노력이 빛나고 있어요! ✨"
  ];
  
  // 타이머 로직
  const tick = useCallback(() => {
    if (seconds > 0) {
      setSeconds(seconds - 1);
    } else if (minutes > 0) {
      setMinutes(minutes - 1);
      setSeconds(59);
      
      // 미니 브레이크 알림 (5분마다)
      if (miniBreaksEnabled && !isBreak && minutes % 5 === 0 && minutes !== workDuration) {
        setMiniBreakAlert(true);
        setTimeout(() => setMiniBreakAlert(false), 3000);
      }
    } else {
      // 타이머 완료 시 비활성화
      setIsActive(false);
    }
  }, [minutes, seconds, isBreak, miniBreaksEnabled, workDuration]);
  
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, tick]);
  
  // 타이머 완료 감지
  useEffect(() => {
    if (!isActive && minutes === 0 && seconds === 0 && (sessionCount > 0 || completedToday > 0)) {
      handleTimerComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);
  
  // 타이머 완료 처리
  const handleTimerComplete = () => {
    playSound();
    
    if (!isBreak) {
      // 작업 세션 완료
      setSessionCount(prev => prev + 1);
      setCompletedToday(prev => prev + 1);
      
      // 4세션마다 긴 휴식
      if ((sessionCount + 1) % 4 === 0) {
        setIsLongBreak(true);
        setMinutes(longBreakDuration);
      } else {
        setIsBreak(true);
        setMinutes(breakDuration);
      }
      
      // 동기부여 메시지
      showRandomMotivation();
      
      // 목표 달성 확인
      if (completedToday + 1 === dailyGoal) {
        celebrate();
      }
    } else {
      // 휴식 완료
      setIsBreak(false);
      setIsLongBreak(false);
      setMinutes(workDuration);
      
      if (autoStart) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    }
    
    setSeconds(0);
  };
  
  // 사운드 재생
  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Sound play failed:', e));
    }
  };
  
  // 랜덤 동기부여 메시지
  const showRandomMotivation = () => {
    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setMotivationText(quote);
    setShowMotivation(true);
    setTimeout(() => setShowMotivation(false), 5000);
  };
  
  // 목표 달성 축하
  const celebrate = () => {
    setMotivationText('🎉 오늘의 목표를 달성했어요! 대단해요! 🎉');
    setShowMotivation(true);
  };
  
  // 타이머 시작/일시정지
  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };
  
  // 타이머 리셋
  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setMinutes(isBreak ? breakDuration : workDuration);
    setSeconds(0);
  };
  
  // 하이퍼포커스 모드 (5분 추가)
  const activateHyperFocus = () => {
    if (!isBreak && isActive) {
      setMinutes(prev => prev + 5);
      setHyperFocusMode(true);
      showRandomMotivation();
    }
  };
  
  // 긴급 휴식
  const emergencyBreak = () => {
    setIsActive(false);
    setIsPaused(false);
    setIsBreak(true);
    setMinutes(breakDuration);
    setSeconds(0);
    setMotivationText('휴식이 필요할 때는 쉬어도 괜찮아요 🌸');
    setShowMotivation(true);
  };
  
  // 진행률 계산
  const totalSeconds = isBreak 
    ? (isLongBreak ? longBreakDuration : breakDuration) * 60
    : workDuration * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;
  
  // 색상 설정
  const getColor = () => {
    if (isBreak) return isLongBreak ? '#3B82F6' : '#10B981'; // 파랑/초록
    if (hyperFocusMode) return '#F59E0B'; // 주황
    return '#EF4444'; // 빨강
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      {/* 오디오 엘리먼트 */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSt2v+3mnjMGHm7A7+OZURE"/>
      
      {/* 헤더 */}
      <div className="w-full max-w-2xl mb-8">
        <h1 className="text-4xl font-bold text-center mb-4">유신 Focus Timer</h1>
        
        {/* 현재 작업 입력 */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="현재 작업을 입력하세요..."
            value={currentTask}
            onChange={(e) => setCurrentTask(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* 진행 상황 */}
        <div className="flex justify-between text-sm mb-2">
          <span>오늘 완료: {completedToday}/{dailyGoal}</span>
          <span>연속 세션: {sessionCount}</span>
        </div>
      </div>
      
      {/* 메인 타이머 */}
      <div className="relative w-80 h-80 mb-8">
        {/* 원형 프로그레스 바 */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="160"
            cy="160"
            r="150"
            stroke="#374151"
            strokeWidth="20"
            fill="none"
          />
          <circle
            cx="160"
            cy="160"
            r="150"
            stroke={getColor()}
            strokeWidth="20"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 150}`}
            strokeDashoffset={`${2 * Math.PI * 150 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
        
        {/* 타이머 표시 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl font-mono font-bold">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-xl mt-2">
            {isBreak ? (isLongBreak ? '긴 휴식' : '짧은 휴식') : '집중 시간'}
          </div>
          {currentTask && (
            <div className="text-sm mt-2 text-gray-400 max-w-[200px] text-center truncate">
              {currentTask}
            </div>
          )}
        </div>
        
        {/* 미니 브레이크 알림 */}
        {miniBreakAlert && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-lg animate-bounce">
            5분 휴식 타임! 잠깐 스트레칭 해요 🙆‍♂️
          </div>
        )}
      </div>
      
      {/* 컨트롤 버튼 */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={toggleTimer}
          className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
            isActive && !isPaused 
              ? 'bg-yellow-500 hover:bg-yellow-600' 
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {!isActive ? '시작' : isPaused ? '계속' : '일시정지'}
        </button>
        
        <button
          onClick={resetTimer}
          className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-lg transition-all"
        >
          리셋
        </button>
        
        {!isBreak && isActive && (
          <button
            onClick={activateHyperFocus}
            className="px-8 py-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold text-lg transition-all"
            title="집중이 잘 될 때 5분 추가"
          >
            하이퍼포커스 +5분
          </button>
        )}
        
        <button
          onClick={emergencyBreak}
          className="px-8 py-4 bg-red-500 hover:bg-red-600 rounded-lg font-semibold text-lg transition-all"
          title="긴급 휴식"
        >
          긴급 휴식
        </button>
      </div>
      
      {/* 동기부여 메시지 */}
      {showMotivation && (
        <div className="absolute top-20 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          {motivationText}
        </div>
      )}
      
      {/* 설정 패널 */}
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">설정</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">집중 시간 (분)</label>
            <select 
              value={workDuration} 
              onChange={(e) => setWorkDuration(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 rounded"
              disabled={isActive}
            >
              <option value={15}>15분</option>
              <option value={20}>20분</option>
              <option value={25}>25분 (권장)</option>
              <option value={30}>30분</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-2">휴식 시간 (분)</label>
            <select 
              value={breakDuration} 
              onChange={(e) => setBreakDuration(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 rounded"
              disabled={isActive}
            >
              <option value={3}>3분</option>
              <option value={5}>5분 (권장)</option>
              <option value={7}>7분</option>
              <option value={10}>10분</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-2">일일 목표</label>
            <input
              type="number"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 rounded"
              min={1}
              max={20}
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">긴 휴식 (분)</label>
            <select 
              value={longBreakDuration} 
              onChange={(e) => setLongBreakDuration(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 rounded"
              disabled={isActive}
            >
              <option value={10}>10분</option>
              <option value={15}>15분 (권장)</option>
              <option value={20}>20분</option>
              <option value={30}>30분</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="mr-2"
            />
            알림음 활성화
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={miniBreaksEnabled}
              onChange={(e) => setMiniBreaksEnabled(e.target.checked)}
              className="mr-2"
            />
            5분마다 미니 브레이크 알림
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoStart}
              onChange={(e) => setAutoStart(e.target.checked)}
              className="mr-2"
            />
            휴식 후 자동 시작
          </label>
        </div>
      </div>
      
      {/* 팁 */}
      <div className="w-full max-w-2xl mt-6 text-center text-sm text-gray-400">
        💡 팁: 집중이 잘 될 때는 하이퍼포커스 버튼으로 5분을 추가하세요!
      </div>
    </div>
  );
}