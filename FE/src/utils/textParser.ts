// src/utils/textParser.ts - 개선된 버전
export interface TextSegment {
    text: string;
    types: string[];
  }
  
  export interface ParsedRange {
    start: number;
    end: number;
  }
  
  /**
   * 텍스트에서 발화 분석 마커들을 파싱하여 스타일링된 세그먼트로 변환
   * @param text 원본 텍스트 (마커 포함)
   * @returns 파싱된 세그먼트 배열
   */
  export const parseAnalysisText = (text: string): TextSegment[] => {
    if (!text) return [{ text: '분석 결과가 없습니다.', types: [] }];
  
    console.log('=== 파싱할 원본 텍스트 ===');
    console.log(text);
  
    // 1단계: 주제이탈 마커 제거하면서 위치 기록
    const offTopicRanges: ParsedRange[] = [];
    let cleanText = '';
    
    const offTopicPattern = /%([^%]*?)%\s*\[E\]/g;
    let match;
    let lastEnd = 0;
  
    while ((match = offTopicPattern.exec(text)) !== null) {
      // 이전 일반 텍스트 추가
      const beforeText = text.substring(lastEnd, match.index);
      cleanText += beforeText;
      
      // 주제이탈 내용 추가
      const content = match[1];
      const cleanStart = cleanText.length;
      cleanText += content;
      const cleanEnd = cleanText.length;
      
      offTopicRanges.push({ start: cleanStart, end: cleanEnd });
      lastEnd = match.index + match[0].length;
    }
    
    // 남은 텍스트 추가
    cleanText += text.substring(lastEnd);
  
    console.log('정리된 텍스트:', cleanText);
    console.log('주제이탈 범위:', offTopicRanges);
  
    // 2단계: 간투어와 단어반복 찾기 (주제이탈 영역 포함)
    const fillerRanges: ParsedRange[] = [];
    const repetitionRanges: ParsedRange[] = [];
  
    // 간투어 패턴 찾기 - 모든 영역에서
    const fillerPattern = /(\S+?)\//g;
    while ((match = fillerPattern.exec(cleanText)) !== null) {
      fillerRanges.push({
        start: match.index,
        end: match.index + match[1].length
      });
      console.log(`간투어 발견: "${match[1]}" 위치: ${match.index}~${match.index + match[1].length}`);
    }
  
    // 단어반복 패턴 찾기 - 모든 영역에서
    const repetitionPattern = /(\S+?)\+/g;
    while ((match = repetitionPattern.exec(cleanText)) !== null) {
      repetitionRanges.push({
        start: match.index,
        end: match.index + match[1].length
      });
      console.log(`단어반복 발견: "${match[1]}" 위치: ${match.index}~${match.index + match[1].length}`);
    }
  
    // 3단계: 마커 제거하면서 범위 위치 조정
    const markersToRemove = [];
    
    // '/' 마커들의 위치 수집
    let markerMatch;
    const slashPattern = /\//g;
    while ((markerMatch = slashPattern.exec(cleanText)) !== null) {
      markersToRemove.push({ position: markerMatch.index, type: '/' });
    }
    
    // '+' 마커들의 위치 수집
    const plusPattern = /\+/g;
    while ((markerMatch = plusPattern.exec(cleanText)) !== null) {
      markersToRemove.push({ position: markerMatch.index, type: '+' });
    }
    
    // 위치순으로 정렬 (뒤에서부터 제거하기 위해 역순)
    markersToRemove.sort((a, b) => b.position - a.position);
    
    // 마커 제거하면서 범위들 조정
    markersToRemove.forEach(marker => {
      // 각 범위들에서 마커 이후 위치들을 1칸씩 앞으로 이동
      const adjustRanges = (ranges: ParsedRange[]) => {
        ranges.forEach(range => {
          if (range.start > marker.position) range.start--;
          if (range.end > marker.position) range.end--;
        });
      };
      
      adjustRanges(offTopicRanges);
      adjustRanges(fillerRanges);
      adjustRanges(repetitionRanges);
    });
    
    // 마커 제거
    cleanText = cleanText.replace(/\//g, '').replace(/\+/g, '');
  
    console.log('최종 정리된 텍스트:', cleanText);
    console.log('간투어 범위 (조정됨):', fillerRanges);
    console.log('단어반복 범위 (조정됨):', repetitionRanges);
    console.log('주제이탈 범위 (조정됨):', offTopicRanges);
  
    // 4단계: 단어 기반 세그먼트 생성
    return createWordBasedSegments(cleanText, offTopicRanges, fillerRanges, repetitionRanges);
  };
  
  /**
   * 단어 기반으로 세그먼트를 생성하는 함수
   */
  const createWordBasedSegments = (
    text: string,
    offTopicRanges: ParsedRange[],
    fillerRanges: ParsedRange[],
    repetitionRanges: ParsedRange[]
  ): TextSegment[] => {
    const segments: TextSegment[] = [];
    
    // 단어와 공백/구두점으로 분할
    const parts = text.split(/(\s+|[.,!?;:])/);
    let currentPosition = 0;
  
    parts.forEach(part => {
      if (!part) return;
  
      const partStart = currentPosition;
      const partEnd = currentPosition + part.length;
  
      // 이 부분에 적용되는 타입들 찾기
      const types: string[] = [];
      
      // 부분적으로라도 겹치는지 확인 (더 정확한 검사)
      if (hasOverlap(partStart, partEnd, offTopicRanges)) {
        types.push('off_topic');
      }
      
      if (hasOverlap(partStart, partEnd, fillerRanges)) {
        types.push('filler');
      }
      
      if (hasOverlap(partStart, partEnd, repetitionRanges)) {
        types.push('repetition');
      }
  
      segments.push({
        text: part,
        types: types
      });
  
      currentPosition = partEnd;
    });
  
    console.log('최종 세그먼트들:', segments);
    return segments;
  };
  
  /**
   * 두 범위가 겹치는지 확인하는 함수
   */
  const hasOverlap = (start: number, end: number, ranges: ParsedRange[]): boolean => {
    return ranges.some(range => {
      // 겹치는 조건: start < range.end && end > range.start
      return start < range.end && end > range.start;
    });
  };
  
  /**
   * 긴 텍스트를 적절한 길이로 나누는 함수 (기존 유지)
   */
  const splitLongText = (text: string, maxLength: number = 15): string[] => {
    if (text.length <= maxLength) return [text];
    
    const words = text.split(' ');
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const word of words) {
      if ((currentChunk + ' ' + word).length <= maxLength) {
        currentChunk = currentChunk ? currentChunk + ' ' + word : word;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = word;
        } else {
          chunks.push(word);
        }
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  };
  
  /**
   * 특정 위치에서 적용되는 타입들 확인 (기존 유지)
   */
  const getTypesAtPosition = (
    position: number,
    offTopicRanges: ParsedRange[],
    fillerRanges: ParsedRange[],
    repetitionRanges: ParsedRange[]
  ): string[] => {
    const types: string[] = [];
    
    if (isPositionInRanges(position, offTopicRanges)) {
      types.push('off_topic');
    }
    
    if (isPositionInRanges(position, fillerRanges)) {
      types.push('filler');
    }
    
    if (isPositionInRanges(position, repetitionRanges)) {
      types.push('repetition');
    }
  
    return types;
  };
  
  /**
   * 특정 위치가 범위들 중 하나에 포함되는지 확인 (기존 유지)
   */
  const isPositionInRanges = (position: number, ranges: ParsedRange[]): boolean => {
    return ranges.some(range => position >= range.start && position < range.end);
  };
  
  /**
   * 토글 상태에 따라 활성화된 타입들만 필터링 (기존 유지)
   */
  export const getActiveTypes = (
    types: string[],
    showFillers: boolean,
    showRepetitions: boolean,
    showOffTopic: boolean
  ): string[] => {
    return types.filter(type => {
      if (type === 'filler') return showFillers;
      if (type === 'repetition') return showRepetitions;
      if (type === 'off_topic') return showOffTopic;
      return true;
    });
  };
  
  /**
   * 타입들을 바탕으로 스타일 객체 생성 (기존 유지)
   */
  export const createStyleFromTypes = (activeTypes: string[]): any => {
    const style: any = {};
  
    if (activeTypes.includes('repetition')) {
      style.backgroundColor = '#EAB30833';
    } else if (activeTypes.includes('filler')) {
      style.backgroundColor = '#34C75933';
    }
  
    return style;
  };