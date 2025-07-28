import React, { useEffect, useState, useRef } from 'react';

export const metadata = {
  title: "Luxury Italian Clock",
  description: "고급스러운 이탈리아 스타일의 아날로그 시계 - 숨겨진 이스터에그를 찾아보세요!",
  type: "react" as const,
  tags: ["animation", "clock", "luxury", "italian", "easter-eggs"],
  category: 'entertainment',
  hidden: true,
  createdAt: new Date().toISOString(),
};

const AnimatedClock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [clickCount, setClickCount] = useState(0);
  const [brandText, setBrandText] = useState('ITALIA');
  const [isNightMode, setIsNightMode] = useState(false);
  const [pendulumMode, setPendulumMode] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [showMoonPhase, setShowMoonPhase] = useState(false);
  const [isRainbow, setIsRainbow] = useState(false);
  const [showConstellation, setShowConstellation] = useState(false);
  const lastClickTime = useRef(0);
  const doubleClickTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      setSecretCode(prev => (prev + e.key).slice(-6));
      
      // Easter egg 7: Konami code
      if ((prev + e.key).includes('ArrowUpArrowUpArrowDownArrowDown')) {
        setIsRainbow(true);
        setTimeout(() => setIsRainbow(false), 10000);
      }
      
      // Easter egg 8: Type "time" 
      if ((prev + e.key).toLowerCase().includes('time')) {
        setPendulumMode(true);
        setTimeout(() => setPendulumMode(false), 5000);
      }
      
      // Easter egg 9: Type "moon"
      if ((prev + e.key).toLowerCase().includes('moon')) {
        setShowMoonPhase(!showMoonPhase);
      }
      
      // Easter egg 10: Type "star"
      if ((prev + e.key).toLowerCase().includes('star')) {
        setShowConstellation(true);
        setTimeout(() => setShowConstellation(false), 8000);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showMoonPhase]);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDegrees = (seconds * 6) - 90;
  const minuteDegrees = (minutes * 6 + seconds * 0.1) - 90;
  const hourDegrees = (hours * 30 + minutes * 0.5) - 90;

  const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

  const monthNames = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 
                      'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  
  const dayNames = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

  const italianBrands = ['FERRARI', 'GUCCI', 'VERSACE', 'ARMANI', 'PRADA', 'BULGARI', 'VALENTINO'];

  // Easter egg 1: Click center dot 10 times
  const handleCenterClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount === 9) {
      setBrandText(italianBrands[Math.floor(Math.random() * italianBrands.length)]);
      setClickCount(0);
    }
  };

  // Easter egg 2: Double click on clock face
  const handleClockDoubleClick = () => {
    setIsReversed(!isReversed);
  };

  // Easter egg 3: Click at midnight or noon
  const handleTimeClick = () => {
    if ((hours === 0 || hours === 12) && minutes === 0 && seconds < 5) {
      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 5000);
    }
  };

  // Easter egg 4: Hover over date for 3 seconds
  const [dateHoverTime, setDateHoverTime] = useState(0);
  useEffect(() => {
    if (dateHoverTime > 0) {
      const timer = setTimeout(() => {
        if (dateHoverTime >= 3) {
          setIsNightMode(!isNightMode);
          setDateHoverTime(0);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [dateHoverTime, isNightMode]);

  // Easter egg 5: Click Roman IV (special formatting)
  const handleRomanClick = (numeral: string) => {
    if (numeral === 'IV') {
      alert('Fun fact: Some luxury watches use IIII instead of IV for better visual balance!');
    }
  };

  // Easter egg 6: Birthday surprise
  const isBirthday = time.getMonth() === 11 && time.getDate() === 25; // Christmas
  
  // Moon phase calculation
  const getMoonPhase = () => {
    const year = time.getFullYear();
    const month = time.getMonth() + 1;
    const day = time.getDate();
    
    const c = Math.floor(year / 100);
    const e = Math.floor((11 * (year % 19) + 29) % 30);
    const f = month < 3 ? 0 : 2;
    const phase = ((e + day + f) % 30) / 30;
    
    if (phase < 0.125) return '🌑';
    if (phase < 0.25) return '🌒';
    if (phase < 0.375) return '🌓';
    if (phase < 0.5) return '🌔';
    if (phase < 0.625) return '🌕';
    if (phase < 0.75) return '🌖';
    if (phase < 0.875) return '🌗';
    return '🌘';
  };

  return (
    <div className={`flex items-center justify-center min-h-screen transition-all duration-1000 ${
      isNightMode 
        ? 'bg-gradient-to-br from-blue-950 via-purple-950 to-black' 
        : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
    }`}>
      {/* Easter egg 11: Fireworks */}
      {showFireworks && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      )}

      {/* Easter egg 12: Constellation */}
      {showConstellation && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative">
        {/* Outer ring */}
        <div className={`absolute -inset-8 rounded-full opacity-30 blur-xl ${
          isRainbow 
            ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 animate-spin' 
            : 'bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 animate-pulse'
        }`} />
        
        {/* Clock face */}
        <div 
          className={`w-80 h-80 rounded-full shadow-2xl relative overflow-hidden cursor-pointer transition-all duration-500 ${
            pendulumMode ? 'animate-pulse' : ''
          } ${
            isReversed ? 'scale-x-[-1]' : ''
          } ${
            isBirthday ? 'bg-gradient-to-br from-red-100 via-green-50 to-red-100' : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100'
          }`}
          onDoubleClick={handleClockDoubleClick}
          onClick={handleTimeClick}
        >
          {/* Inner decorative ring */}
          <div className="absolute inset-4 rounded-full border-2 border-yellow-700 opacity-40" />
          <div className="absolute inset-6 rounded-full border border-yellow-600 opacity-30" />
          
          {/* Texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-200/10 to-transparent" />

          {/* Roman numerals */}
          {romanNumerals.map((numeral, i) => (
            <div
              key={i}
              className="absolute text-yellow-800 font-serif text-xl font-bold cursor-pointer hover:text-yellow-600 transition-colors"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translateY(-120px) rotate(${i * 30}deg)`,
                transformOrigin: '50% 120px'
              }}
              onClick={() => handleRomanClick(numeral)}
            >
              <div style={{ transform: `rotate(${-i * 30}deg)` }}>
                {isReversed ? numeral.split('').reverse().join('') : numeral}
              </div>
            </div>
          ))}
          
          {/* Minute markers */}
          {[...Array(60)].map((_, i) => (
            i % 5 !== 0 && (
              <div
                key={i}
                className="absolute w-0.5 h-2 bg-yellow-700 opacity-60"
                style={{
                  top: '12px',
                  left: '50%',
                  transform: `translateX(-50%) rotate(${i * 6}deg)`,
                  transformOrigin: '50% 148px'
                }}
              />
            )
          ))}

          {/* Brand name */}
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 text-yellow-800 font-serif text-sm tracking-widest">
            {brandText}
          </div>

          {/* Moon phase display */}
          {showMoonPhase && (
            <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-2xl">
              {getMoonPhase()}
            </div>
          )}

          {/* Easter egg 13: Secret message at 13:37 */}
          {hours === 1 && minutes === 37 && (
            <div className="absolute top-32 left-1/2 transform -translate-x-1/2 text-xs text-yellow-600 font-mono">
              1337 H4X0R
            </div>
          )}

          {/* Date window */}
          <div 
            className="absolute top-1/2 right-16 transform -translate-y-1/2 bg-gray-900 text-white px-2 py-1 text-xs font-mono rounded cursor-pointer hover:bg-gray-700 transition-colors"
            onMouseEnter={() => setDateHoverTime(prev => prev + 1)}
            onMouseLeave={() => setDateHoverTime(0)}
          >
            {time.getDate()}
          </div>

          {/* Center decorative element */}
          <div 
            className="absolute top-1/2 left-1/2 w-6 h-6 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-30 shadow-lg cursor-pointer hover:scale-110 transition-transform"
            onClick={handleCenterClick}
          >
            <div className="absolute inset-1 bg-gray-900 rounded-full" />
            <div className="absolute inset-1.5 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full" />
          </div>

          {/* Hour hand */}
          <div
            className="absolute top-1/2 left-1/2 origin-left transform -translate-y-1/2 transition-transform duration-500"
            style={{ transform: `translateY(-50%) rotate(${hourDegrees}deg)` }}
          >
            <div className="w-24 h-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-full shadow-lg" />
            <div className="absolute top-1/2 left-0 w-20 h-1.5 bg-gradient-to-r from-yellow-700 to-yellow-600 transform -translate-y-1/2" />
          </div>

          {/* Minute hand */}
          <div
            className="absolute top-1/2 left-1/2 origin-left transform -translate-y-1/2 transition-transform duration-500"
            style={{ transform: `translateY(-50%) rotate(${minuteDegrees}deg)` }}
          >
            <div className="w-32 h-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-full shadow-lg" />
            <div className="absolute top-1/2 left-0 w-28 h-1 bg-gradient-to-r from-yellow-700 to-yellow-600 transform -translate-y-1/2" />
          </div>

          {/* Second hand */}
          <div
            className="absolute top-1/2 left-1/2 origin-left transform -translate-y-1/2 transition-transform duration-200"
            style={{ transform: `translateY(-50%) rotate(${secondDegrees}deg)` }}
          >
            <div className="w-36 h-0.5 bg-gradient-to-r from-red-700 to-red-600 rounded-full shadow-lg" />
            <div className="absolute -left-6 top-1/2 w-6 h-6 bg-gradient-to-br from-red-700 to-red-600 rounded-full transform -translate-y-1/2 shadow-lg" />
          </div>
        </div>

        {/* Date and time display */}
        <div className="mt-10 text-center">
          <div className={`px-8 py-4 rounded-lg shadow-2xl border transition-all duration-500 ${
            isBirthday 
              ? 'bg-gradient-to-br from-red-100 via-white to-green-100 border-red-500/30 animate-pulse' 
              : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border-yellow-700/30'
          }`}>
            <div className="text-yellow-800 font-serif text-sm tracking-wide">
              {dayNames[time.getDay()].toUpperCase()}
              {isBirthday && ' 🎄'}
            </div>
            <div className="text-3xl font-serif text-gray-900 my-1">
              {time.toLocaleTimeString('it-IT', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </div>
            <div className="text-yellow-800 font-serif text-sm">
              {time.getDate()} {monthNames[time.getMonth()]} {time.getFullYear()}
            </div>
          </div>
          
          {/* Easter egg instructions (hidden by default) */}
          <div className="mt-4 text-xs text-gray-600 opacity-0 hover:opacity-100 transition-opacity duration-500">
            <p>이스터에그 힌트: 클릭, 더블클릭, 타이핑, 특별한 시간...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedClock;