// src/constants/result.ts

export interface AnalysisResult {
  id: string;
  title: string;
  content: string;
  filler_words: number; // 간투어
  repetitions: number; // 단어반복
  stutters: number; // 버벅임
  off_topic: number; // 주제이탈
}

// 마크다운 형식으로 표시
// 단어/ - 간투어 (Filler words)
// 단어+ - 단어반복 (Repetition)
// %[E]내용% - 주제이탈 (Off-topic)

export const SAMPLE_RESULTS: AnalysisResult[] = [
  {
    id: '1',
    title: '한국에서 커피 소비',
    content: `여러분은 하루에 커피, 음/ 몇 잔이나 드시나요? 아마도, 그/ 많은 분들이 그 테이크아웃 컵? 일회용 컵을 사용하실텐데요. 이 일회용 컵이 환경+ 커피 대부분 그냥 버려지고, 어.. 재활용도 사실 그렇게 잘 안 되는 편입니다. 한국에서만 %[E]미루 화로... 어... 한 70많은 개 컵드의% 일회용 컵이 사용되고 있다고 합니다요. 이게 이제 뭐 플라스틱 쓰레기, 뭐 그런 거라 환경에는 영향을 끼친다고, 플라스틱 문제...`,
    filler_words: 2,
    repetitions: 1,
    stutters: 0,
    off_topic: 1
  },
  {
    id: '2',
    title: '텀블러의 친환경 효과와 소재',
    content: `근데, 음/ 텀블러 하나만 있으면... 아, 이 상황이, 어/ 달라질 수도 있습니다. 텀블러는 뭐 그대로 재사용이 가능하잖아요? 그래서 뭐, 일회용 컵을 안 쓰게 되고, 어... 음/ 플라스틱 쓰레기+ 를 줄이는 거죠. 아, 그리고 요즘에는 텀블러가 그/ 스테인리스? 유리? 또... 그/ 뭐죠 실리콘 같은 것도 친환경적인 것들로 많이 나오고 있어요. 그래서, 어... %[E]생산 과정에서도 이제 뭐 더 친환경적으로 만들고 있다... 그런 화장이% 많습니다.`,
    filler_words: 5,
    repetitions: 1,
    stutters: 0,
    off_topic: 1
  },
  {
    id: '3',
    title: '텀블러 사용 장려 정책',
    content: `텀블러 또, 어... 카페 같은 데 가면 텀블러 가져가면 할인도 해주고, 포인트도 주고, 그런 거 많이들 아시죠? 아제, 음/ 환경 보호도 되고, 돈도 아낄 경제적이고... 그런 이유도 있고, 어/ 뭐랄까 %[E]정치이죠? 아...% 이런 정책들이 좋은 것 같아요.`,
    filler_words: 2,
    repetitions: 0,
    stutters: 0,
    off_topic: 1
  }
];

// 텍스트 파싱 함수 (기존 유지 - textParser.ts에서 처리)
export const parseAnalysisText = (
  text: string, 
  showFillers: boolean, 
  showRepetitions: boolean, 
  showStutters: boolean,
  showOffTopic: boolean = true
) => {
  // 이 함수는 이제 textParser.ts의 parseAnalysisText를 사용
  // 여기서는 호환성을 위해 빈 배열 반환
  return [];
};