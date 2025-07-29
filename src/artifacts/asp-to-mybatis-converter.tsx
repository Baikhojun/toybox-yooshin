import React, { useState } from 'react';

export const metadata = {
  id: 'asp-to-mybatis-converter',
  title: 'ASP→MyBatis 변환',
  description: 'ASP 코드를 MyBatis XML Mapper로 변환하는 도구',
  type: 'react' as const,
  tags: ['converter', 'asp', 'mybatis', 'xml', 'legacy'],
  category: 'development',
  createdAt: new Date('2025-07-28').toISOString(),
  updatedAt: new Date('2025-07-28').toISOString(),
};

interface ParsedAspData {
  parameters: Array<{
    name: string;
    aspMethod: string;
    type: string;
  }>;
  sql: {
    query: string;
    cleanQuery: string;
    parameters: string[];
  };
  procedureCall?: {
    name: string;
    outputParam: string;
    type: 'selectProc' | 'transProc';
  };
}

export default function AspToMyBatisConverter() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ParsedAspData | null>(null);
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState<number | null>(null);

  const parseAspCode = (aspCode: string): ParsedAspData => {
    const lines = aspCode.split('\n');
    const parameters: Array<{ name: string; aspMethod: string; type: string }> = [];
    let sqlQuery = '';
    let procedureCall: { name: string; outputParam: string; type: 'selectProc' | 'transProc' } | undefined;

    let inSqlBlock = false;
    let currentSql = '';

    for (const line of lines) {
      const trimmedLine = line.trim();


      // Parameter 선언 처리
      if (trimmedLine.includes('AspApi.GetParameterStr')) {
        const match = trimmedLine.match(/(\w+)\s*=\s*AspApi\.GetParameterStr\("([^"]+)"\)/);
        if (match) {
          parameters.push({
            name: match[1],
            aspMethod: 'GetParameterStr',
            type: 'string'
          });
        }
      }

      if (trimmedLine.includes('AspApi.GetParameterInt')) {
        const match = trimmedLine.match(/(\w+)\s*=\s*AspApi\.GetParameterInt\("([^"]+)"\)/);
        if (match) {
          parameters.push({
            name: match[1],
            aspMethod: 'GetParameterInt',
            type: 'int'
          });
        }
      }

      // SQL 구문 시작
      if (trimmedLine.includes('sql = "') || trimmedLine.includes("sql = '")) {
        inSqlBlock = true;
        const match = trimmedLine.match(/sql\s*=\s*["'](.*)["']/);
        if (match) {
          currentSql = match[1];
        }
      }
      // SQL 구문 연결
      else if (inSqlBlock && (trimmedLine.includes('sql = sql &') || trimmedLine.includes('sql = sql +'))) {
        const match = trimmedLine.match(/sql\s*=\s*sql\s*[&+]\s*["'](.*)["']/);
        if (match) {
          currentSql += ' ' + match[1];
        }
      }
      // SQL 구문 종료 (selectProcApi 또는 transProcApi 라인을 만나면 종료)
      else if (inSqlBlock && (trimmedLine.includes('selectProcApi') || trimmedLine.includes('transProcApi'))) {
        inSqlBlock = false;
        sqlQuery = currentSql;
      }

      // Procedure 호출 처리
      if (trimmedLine.includes('selectProcApi')) {
        const match = trimmedLine.match(/selectProcApi\s+(\w+)\s*,\s*"([^"]+)"\s*,\s*(\w+)/);
        if (match) {
          procedureCall = {
            name: match[1],
            outputParam: match[2],
            type: 'selectProc'
          };
        }
      }
      
      if (trimmedLine.includes('transProcApi')) {
        const match = trimmedLine.match(/transProcApi\s+(\w+)\s*,\s*"([^"]+)"\s*,\s*(\w+)/);
        if (match) {
          procedureCall = {
            name: match[1],
            outputParam: match[2],
            type: 'transProc'
          };
        }
      }
    }

    // SQL 정리 및 파라미터 추출
    const cleanQuery = cleanSqlQuery(sqlQuery);
    const sqlParameters = extractSqlParameters(sqlQuery);

    return {
      parameters,
      sql: {
        query: sqlQuery,
        cleanQuery,
        parameters: sqlParameters
      },
      procedureCall
    };
  };

  const cleanSqlQuery = (sql: string): string => {
    // 먼저 정규화하고 불필요한 따옴표만 제거
    return sql
      .replace(/\s+/g, ' ')
      .trim();
  };

  const extractSPNameFromSQL = (sql: string): string | null => {
    // exec SP_Name 패턴 찾기
    const execMatch = sql.match(/exec\s+(\w+)/i);
    if (execMatch) {
      return execMatch[1];
    }
    return null;
  };

  const extractSqlParameters = (sql: string): string[] => {
    const params: string[] = [];
    // ASP에서 사용하는 패턴: '" & variable & "'
    const regex = /["']\s*&\s*(\w+)\s*&\s*["']/g;
    let match;
    
    while ((match = regex.exec(sql)) !== null) {
      if (!params.includes(match[1])) {
        params.push(match[1]);
      }
    }
    
    return params;
  };

  const generateMapperName = (data: ParsedAspData): string => {
    // 1. SQL에서 exec SP_Name 패턴 찾기
    const spNameFromSQL = extractSPNameFromSQL(data.sql.query);
    if (spNameFromSQL) {
      return spNameFromSQL.replace(/SP/g, 'MP');
    }
    
    // 2. 변수명에서 SP 이름 찾기
    if (data?.procedureCall?.name && data.procedureCall.name !== 'sql') {
      return data.procedureCall.name.replace(/SP/g, 'MP');
    }
    
    // 3. 기본값
    return 'ESCA_MP_DefaultSelect';
  };

  const extractTableName = (sql: string): string => {
    // FROM 절에서 테이블명 추출
    const match = sql.match(/FROM\s+(\w+)/i);
    if (match) {
      const tableName = match[1];
      // ESCB_TB_Object -> ObjectManage 형식으로 변환
      if (tableName.includes('_TB_')) {
        const parts = tableName.split('_TB_');
        if (parts.length > 1) {
          return parts[1];
        }
      }
      return tableName;
    }
    return 'ObjectManage';
  };

  const generateMyBatisXml = (data: ParsedAspData): string => {
    const mapperName = generateMapperName(data);
    const isSelectProc = data.procedureCall?.type === 'selectProc';
    
    let xml = `    <select id="${mapperName}" parameterType="jsonObject"`;
    if (isSelectProc) {
      xml += ` resultType="jsonObject"`;
    }
    xml += ` statementType="CALLABLE">\n`;
    
    // SQL 쿼리 변환
    let convertedSql = data.sql.cleanQuery;
    
    // ASP 파라미터를 MyBatis 파라미터로 변환
    data.sql.parameters.forEach(param => {
      const paramPattern = new RegExp(`["']\\s*&\\s*${param}\\s*&\\s*["']`, 'g');
      convertedSql = convertedSql.replace(paramPattern, `#{par${capitalizeFirst(param)}}`);
    });

    // SQL 정리 및 포맷팅
    convertedSql = formatSqlForMyBatis(convertedSql);
    
    xml += `        ${convertedSql}\n`;
    xml += `    </select>`;
    
    return xml;
  };

  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatSqlForMyBatis = (sql: string): string => {
    return sql
      .replace(/\bSELECT\b/gi, 'SELECT')
      .replace(/\bFROM\b/gi, 'FROM')
      .replace(/\bWHERE\b/gi, 'WHERE')
      .replace(/\bAND\b/gi, 'AND')
      .replace(/\bOR\b/gi, 'OR')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleConvert = () => {
    setError('');
    setResult(null);

    if (!input.trim()) {
      setError('ASP 코드를 입력해주세요.');
      return;
    }

    try {
      const parsed = parseAspCode(input);
      setResult(parsed);
    } catch (err) {
      setError(`변환 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConvert();
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus(index);
      setTimeout(() => setCopyStatus(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">ASP→MyBatis 변환</h1>
        <p className="text-gray-600 mb-6">ASP 코드를 MyBatis XML Mapper로 변환합니다.</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 입력 섹션 */}
          <div>
            <h2 className="text-xl font-semibold mb-3">ASP 코드 입력</h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="여기에 ASP 코드를 붙여넣으세요... (Enter로 변환)"
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleConvert}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                변환하기
              </button>
              <button
                onClick={() => {
                  setInput('');
                  setResult(null);
                  setError('');
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                초기화
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

          </div>

          {/* 결과 섹션 */}
          <div>
            <h2 className="text-xl font-semibold mb-3">변환 결과</h2>
            
            {result ? (
              <div className="space-y-4">
                {/* MyBatis XML */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-gray-700">MyBatis XML Mapper</div>
                    <button
                      onClick={() => copyToClipboard(generateMyBatisXml(result), 0)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        copyStatus === 0 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {copyStatus === 0 ? '복사됨!' : '복사'}
                    </button>
                  </div>
                  <pre className="font-mono text-sm bg-gray-50 p-4 rounded overflow-x-auto min-h-[200px] max-h-[500px] overflow-y-auto">
                    {generateMyBatisXml(result)}
                  </pre>
                </div>

              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
                ASP 코드를 입력하고 변환해주세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}