import React from 'react';

export const metadata = {
  id: 'hanmadang-server-check',
  title: '한마당 서버체크',
  description: '유신엔지니어링 서버 상태를 체크하는 도구',
  type: 'react' as const,
  tags: ['server', 'monitoring', 'devops', 'yooshin'],
  category: 'engineering',
  createdAt: new Date('2025-07-29').toISOString(),
  updatedAt: new Date('2025-07-29').toISOString(),
};

interface Server {
  name: string;
  url: string;
  displayName: string;
}

export default function HanmadangServerCheck() {
  const servers: Server[] = [
    { name: 'YERP', url: 'https://yerp.yooshin.com', displayName: 'YERP' },
    { name: 'ERP', url: 'https://erp.yooshin.com', displayName: 'ERP' },
    { name: 'ERP_TOMCAT', url: 'https://erp.yooshin.com/manager/html', displayName: 'ERP톰캣' },
    { name: 'ERP_JENKINS', url: 'http://172.16.0.14:9050/', displayName: 'ERP젠킨스' },
    { name: 'YERP_JENKINS', url: 'http://172.16.0.29:9050/', displayName: 'YERP젠킨스' },
    { name: 'HANMADANG_IIS', url: 'https://hanmadang.yooshin.com', displayName: '한마당IIS' },
    { name: 'REPORT_SERVER', url: 'https://report.yooshin.com/UbiServer', displayName: '리포트서버' },
  ];

  const openServer = (server: Server) => {
    // 쿠키 삭제를 위한 시도 (브라우저 보안상 제한적)
    // 같은 도메인의 쿠키만 삭제 가능
    try {
      const domain = new URL(server.url).hostname;
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=." + domain);
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } catch (e) {
      // 크로스 도메인 쿠키는 삭제 불가
    }
    
    window.open(server.url, '_blank');
  };

  const openAllServers = () => {
    servers.forEach((server) => {
      window.open(server.url, '_blank');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            한마당 서버체크
          </h1>
          <p className="text-gray-600 text-center mb-8">
            유신엔지니어링 서버 상태를 한번에 확인하세요
          </p>

          {/* 전체 실행 버튼 */}
          <div className="mb-8">
            <button
              onClick={openAllServers}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🚀 전체 서버 한번에 열기
            </button>
          </div>

          {/* 구분선 */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">또는 개별 서버 선택</span>
            </div>
          </div>

          {/* 개별 서버 버튼들 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {servers.map((server) => (
              <button
                key={server.name}
                onClick={() => openServer(server)}
                className="group relative bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">
                    {server.name.includes('JENKINS') ? '🔧' : 
                     server.name.includes('TOMCAT') ? '🐱' :
                     server.name === 'REPORT_SERVER' ? '📊' :
                     server.name === 'HANMADANG_IIS' ? '🏛️' :
                     '🖥️'}
                  </span>
                  <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {server.displayName}
                  </span>
                  <span className="text-xs text-gray-500 mt-1 break-all">
                    {server.url.replace('https://', '').replace('http://', '')}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* 안내 메시지 */}
          <div className="mt-8 space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 팁: 브라우저의 팝업 차단 기능이 활성화되어 있다면, 전체 서버 열기가 제대로 동작하지 않을 수 있습니다.
                이 경우 팝업을 허용하거나 개별 버튼을 사용해주세요.
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-700">
                🍪 쿠키 관련: 브라우저 보안상 다른 도메인의 쿠키는 직접 삭제할 수 없습니다. 
                완전한 쿠키 초기화가 필요하다면 시크릿/프라이빗 브라우징을 사용하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}