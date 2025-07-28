import React, { useState } from 'react';

// v2->v3 Grid값 변환
export const metadata = {
  id: 'grid-v2-to-v3-converter',
  title: 'v2->v3 Grid값 변환',
  description: 'v2 Grid XML을 v3 Grid 설정으로 변환하는 도구',
  type: 'react' as const,
  tags: ['converter', 'grid', 'v2', 'v3', 'xml'],
  category: 'development',
  createdAt: new Date('2025-07-28').toISOString(),
  updatedAt: new Date('2025-07-28').toISOString(),
};

interface GridColumn {
  text: string;
  colid: string;
  align?: string;
  display?: string;
  width?: number;
  col?: number;
}

interface ConvertedColumn {
  value: string;
  id: string;
  textAlign?: string;
  dataType?: string;
  width?: number;
  colIndex?: number;
  originalColid?: string;
  originalAlign?: string;
  originalDisplay?: string;
  originalWidth?: number;
}

export default function GridV2ToV3Converter() {
  const [xmlInput, setXmlInput] = useState('');
  const [convertedColumns, setConvertedColumns] = useState<ConvertedColumn[]>([]);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [useModernIdFormat, setUseModernIdFormat] = useState(false);

  const parseXML = (xmlString: string): GridColumn[] => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      // 파싱 에러 체크
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('XML 파싱 에러: ' + parseError.textContent);
      }

      const columns: GridColumn[] = [];
      
      // width 정보 가져오기
      const colElements = xmlDoc.querySelectorAll('columns col');
      const widths: { [key: number]: number } = {};
      colElements.forEach((col, index) => {
        const width = col.getAttribute('width');
        if (width) {
          widths[index] = parseInt(width);
        }
      });

      // head 정보 가져오기
      const headCells = xmlDoc.querySelectorAll('head cell');
      const headInfo: { [key: number]: string } = {};
      headCells.forEach(cell => {
        const col = parseInt(cell.getAttribute('col') || '0');
        const text = cell.getAttribute('text') || '';
        headInfo[col] = text;
      });

      // body 정보 가져오기
      const bodyCells = xmlDoc.querySelectorAll('body cell');
      bodyCells.forEach(cell => {
        const col = parseInt(cell.getAttribute('col') || '0');
        const colid = cell.getAttribute('colid') || '';
        
        if (colid) {
          columns.push({
            text: headInfo[col] || '',
            colid: colid,
            align: cell.getAttribute('align') || undefined,
            display: cell.getAttribute('display') || undefined,
            width: widths[col] || undefined,
            col: col
          });
        }
      });

      return columns;
    } catch (e) {
      throw new Error('XML 파싱 중 오류가 발생했습니다: ' + (e as Error).message);
    }
  };

  const convertToModernIdFormat = (id: string): string => {
    // id가 언더스코어로 구분된 경우 처리
    if (id.includes('_')) {
      const parts = id.split('_');
      return parts.map((part, index) => {
        if (index === 0) {
          // 첫 번째 파트는 모두 대문자
          return part.toUpperCase();
        } else {
          // 나머지 파트는 첫 글자만 대문자
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }
      }).join('_');
    }
    // 언더스코어가 없는 경우 그대로 반환
    return id;
  };

  const getAutoTextAlign = (id: string): string => {
    const upperCaseId = id.toUpperCase();
    
    // DS로 시작하는 경우 left
    if (upperCaseId.startsWith('DS')) return 'left';
    
    // DT로 시작하는 경우 center
    if (upperCaseId.startsWith('DT')) return 'center';
    
    // AM, RT 또는 숫자 관련 필드는 right
    if (upperCaseId.startsWith('AM') || upperCaseId.startsWith('RT') || 
        upperCaseId.includes('AMT') || upperCaseId.includes('QTY') || 
        upperCaseId.includes('CNT') || upperCaseId.includes('PRICE') ||
        upperCaseId.includes('COST') || upperCaseId.includes('SUM')) {
      return 'right';
    }
    
    // 기본값은 center
    return 'center';
  };

  const getAutoDataType = (id: string, displayType?: string): string => {
    const upperCaseId = id.toUpperCase();
    
    // display type이 이미 지정되어 있으면 그대로 사용
    if (displayType && displayType !== 'text') return displayType;
    
    // DT로 시작하는 경우 date
    if (upperCaseId.startsWith('DT') || upperCaseId.includes('DATE')) return 'date';
    
    // 숫자 관련 필드
    if (upperCaseId.startsWith('AM') || upperCaseId.startsWith('RT') || 
        upperCaseId.includes('AMT') || upperCaseId.includes('QTY') || 
        upperCaseId.includes('CNT') || upperCaseId.includes('NO')) {
      return 'number';
    }
    
    // 금액이나 비율 관련 필드는 float
    if (upperCaseId.includes('PRICE') || upperCaseId.includes('COST') || 
        upperCaseId.includes('RATE') || upperCaseId.includes('PERCENT')) {
      return 'float';
    }
    
    // 기본값은 text
    return 'text';
  };

  const adjustWidth = (width?: number): number | undefined => {
    if (!width) return undefined;
    
    // 20 추가
    let adjusted = width + 20;
    
    // 10의 자리로 반올림
    adjusted = Math.round(adjusted / 10) * 10;
    
    return adjusted;
  };

  const convertColumns = (columns: GridColumn[]): ConvertedColumn[] => {
    return columns.map(col => {
      const converted: ConvertedColumn = {
        value: col.text,
        id: useModernIdFormat ? convertToModernIdFormat(col.colid) : col.colid,
        colIndex: col.col,
        originalColid: col.colid, // 원본 저장
        originalAlign: col.align,
        originalDisplay: col.display,
        originalWidth: col.width
      };

      // align -> textAlign 변환 (값이 없으면 자동 설정)
      converted.textAlign = col.align || getAutoTextAlign(col.colid);

      // display -> dataType 변환 (값이 없으면 자동 설정)
      converted.dataType = getAutoDataType(col.colid, col.display);

      // width 조정
      converted.width = adjustWidth(col.width);

      return converted;
    });
  };

  const handleConvert = (modernFormat = false) => {
    setError('');
    setConvertedColumns([]);
    setUseModernIdFormat(modernFormat);
    
    if (!xmlInput.trim()) {
      setError('XML을 입력해주세요.');
      return;
    }

    try {
      const parsed = parseXML(xmlInput);
      const converted = convertColumns(parsed);
      setConvertedColumns(converted);
      
      if (converted.length === 0) {
        setError('변환할 컬럼을 찾을 수 없습니다. XML 형식을 확인해주세요.');
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConvert(true); // 엔터키는 최신 형식 변환
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const isValueChanged = (col: ConvertedColumn, property: string): boolean => {
    switch (property) {
      case 'id':
        return col.originalColid !== undefined && col.originalColid !== col.id;
      case 'textAlign':
        return !col.originalAlign && col.textAlign !== undefined;
      case 'dataType':
        return (!col.originalDisplay || col.originalDisplay === 'text') && col.dataType !== 'text';
      case 'width':
        return col.originalWidth !== undefined && col.width !== col.originalWidth;
      default:
        return false;
    }
  };

  const getPropertyValues = (property: keyof ConvertedColumn) => {
    return convertedColumns.map(col => {
      const value = col[property];
      if (value === undefined) return '';
      return value.toString();
    }).filter(v => v !== '').join('\n');
  };
  
  const getPropertyValuesWithNumbers = (property: keyof ConvertedColumn) => {
    let index = 1;
    return convertedColumns.map(col => {
      const value = col[property];
      if (value === undefined) return null;
      return { 
        number: index++, 
        value: value.toString(),
        changed: isValueChanged(col, property)
      };
    }).filter(item => item !== null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">v2→v3 Grid값 변환</h1>
        <p className="text-gray-600 mb-6">v2 Grid XML 형식을 v3 Grid 설정으로 변환합니다.</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* 입력 영역 */}
          <div>
            <h2 className="text-xl font-semibold mb-3">XML 입력</h2>
            <textarea
              value={xmlInput}
              onChange={(e) => setXmlInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="여기에 XML을 붙여넣으세요... (Enter로 변환)"
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleConvert(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                변환하기
              </button>
              
              <button
                onClick={() => handleConvert(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                원본 형식 유지
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {/* 사용 설명서 */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
              <h3 className="font-semibold text-gray-700 mb-2">사용 안내</h3>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Enter 키</strong>: XML 입력 후 Enter로 바로 변환 (ID 최신 형식 적용)</li>
                <li>• <strong>변환하기</strong>: ID를 최신 형식으로 변환 (예: cd_auth → CD_Auth)</li>
                <li>• <strong>원본 형식 유지</strong>: ID 형식을 변경하지 않고 변환</li>
              </ul>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-1">자동 변환 규칙</h4>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>textAlign</strong>: DS (left), DT (center), AM/RT/숫자 (right)</li>
                  <li>• <strong>dataType</strong>: DT/DATE (date), AM/RT/QTY (number), PRICE/RATE (float)</li>
                  <li>• <strong>width</strong>: 기본값 +20 후 10단위로 반올림</li>
                  <li>• <strong className="text-blue-600">파란색 표시</strong>: 자동 변환으로 변경된 값</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* 결과 영역 */}
          <div>
            <h2 className="text-xl font-semibold mb-3">변환 결과</h2>
            
            {convertedColumns.length > 0 ? (
              <div className="space-y-4">
                {/* value (text) */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-700 mb-2">value (text)</div>
                      <div className="flex">
                        <div className="text-gray-400 text-sm font-mono pr-3">
                          <div className="py-3">
                            {getPropertyValuesWithNumbers('value').map((item, idx) => (
                              <div key={idx} className="h-6 leading-6">{item?.number}.</div>
                            ))}
                          </div>
                        </div>
                        <div className="font-mono text-sm bg-gray-50 p-3 rounded flex-1">
                          {getPropertyValuesWithNumbers('value').map((item, idx) => (
                            <div key={idx} className={`h-6 leading-6 ${item?.changed ? 'text-blue-600' : ''}`}>
                              {item?.value}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(getPropertyValues('value'), 0)}
                      className={`ml-3 px-3 py-1 text-sm rounded transition-colors ${
                        copiedIndex === 0
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {copiedIndex === 0 ? '복사됨!' : '복사'}
                    </button>
                  </div>
                </div>

                {/* id (colid) */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-700 mb-2">id (colid)</div>
                      <div className="flex">
                        <div className="text-gray-400 text-sm font-mono pr-3">
                          <div className="py-3">
                            {getPropertyValuesWithNumbers('id').map((item, idx) => (
                              <div key={idx} className="h-6 leading-6">{item?.number}.</div>
                            ))}
                          </div>
                        </div>
                        <div className="font-mono text-sm bg-gray-50 p-3 rounded flex-1">
                          {getPropertyValuesWithNumbers('id').map((item, idx) => (
                            <div key={idx} className={`h-6 leading-6 ${item?.changed ? 'text-blue-600' : ''}`}>
                              {item?.value}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(getPropertyValues('id'), 1)}
                      className={`ml-3 px-3 py-1 text-sm rounded transition-colors ${
                        copiedIndex === 1
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {copiedIndex === 1 ? '복사됨!' : '복사'}
                    </button>
                  </div>
                </div>

                {/* textAlign (align) */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-700 mb-2">textAlign (align)</div>
                      <div className="flex">
                        <div className="text-gray-400 text-sm font-mono pr-3">
                          <div className="py-3">
                            {getPropertyValuesWithNumbers('textAlign').map((item, idx) => (
                              <div key={idx} className="h-6 leading-6">{item?.number}.</div>
                            ))}
                          </div>
                        </div>
                        <div className="font-mono text-sm bg-gray-50 p-3 rounded flex-1">
                          {getPropertyValuesWithNumbers('textAlign').map((item, idx) => (
                            <div key={idx} className={`h-6 leading-6 ${item?.changed ? 'text-blue-600' : ''}`}>
                              {item?.value}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(getPropertyValues('textAlign'), 2)}
                      className={`ml-3 px-3 py-1 text-sm rounded transition-colors ${
                        copiedIndex === 2
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {copiedIndex === 2 ? '복사됨!' : '복사'}
                    </button>
                  </div>
                </div>

                {/* dataType (display) */}
                {convertedColumns.some(col => col.dataType) && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-700 mb-2">dataType (display)</div>
                        <div className="flex">
                          <div className="text-gray-400 text-sm font-mono pr-3">
                            <div className="py-3">
                              {getPropertyValuesWithNumbers('dataType').map((item, idx) => (
                                <div key={idx} className="h-6 leading-6">{item?.number}.</div>
                              ))}
                            </div>
                          </div>
                          <div className="font-mono text-sm bg-gray-50 p-3 rounded flex-1">
                            {getPropertyValuesWithNumbers('dataType').map((item, idx) => (
                              <div key={idx} className={`h-6 leading-6 ${item?.changed ? 'text-blue-600' : ''}`}>
                                {item?.value}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(getPropertyValues('dataType'), 3)}
                        className={`ml-3 px-3 py-1 text-sm rounded transition-colors ${
                          copiedIndex === 3
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {copiedIndex === 3 ? '복사됨!' : '복사'}
                      </button>
                    </div>
                  </div>
                )}

                {/* width */}
                {convertedColumns.some(col => col.width) && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-700 mb-2">width</div>
                        <div className="flex">
                          <div className="text-gray-400 text-sm font-mono pr-3">
                            <div className="py-3">
                              {getPropertyValuesWithNumbers('width').map((item, idx) => (
                                <div key={idx} className="h-6 leading-6">{item?.number}.</div>
                              ))}
                            </div>
                          </div>
                          <div className="font-mono text-sm bg-gray-50 p-3 rounded flex-1">
                            {getPropertyValuesWithNumbers('width').map((item, idx) => (
                              <div key={idx} className={`h-6 leading-6 ${item?.changed ? 'text-blue-600' : ''}`}>
                                {item?.value}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(getPropertyValues('width'), 4)}
                        className={`ml-3 px-3 py-1 text-sm rounded transition-colors ${
                          copiedIndex === 4
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {copiedIndex === 4 ? '복사됨!' : '복사'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-500">
                변환 결과가 여기에 표시됩니다
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}