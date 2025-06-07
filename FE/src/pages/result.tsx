// src/pages/result.tsx - 새로운 서버 응답 형식 적용
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

const tw = create(tailwindConfig);

interface ResultProps {
  navigation?: any;
  route?: {
    params?: {
      selectedTopic?: {
        id: string;
        title: string;
      };
      selectedInterest?: string;
      recordingTime?: number;
      analysisResult?: {
        full_text: string;
        topic: string;
        statistics: string;
        segments?: Array<{
          start: number;
          end: number;
          text: string;
        }>;
        audio_duration?: number;
        model?: string;
        raw_response?: any;
      };
    }
  }
}

const Result: React.FC<ResultProps> = ({ navigation, route }) => {
  const [showFillers, setShowFillers] = useState(true); // 간투어 (/)
  const [showRepetitions, setShowRepetitions] = useState(true); // 단어반복/버벅임 (+)
  const [showOffTopic, setShowOffTopic] = useState(true); // 주제이탈 (%...%[E])

  // 전달받은 분석 결과
  const analysisResult = route?.params?.analysisResult;
  const selectedTopic = route?.params?.selectedTopic;
  
  console.log('=== Result 페이지 데이터 ===');
  console.log('분석 결과:', analysisResult);

  // 텍스트 파싱 및 스타일링 함수
  const parseAndStyleText = (text: string) => {
    if (!text) return [{ text: '분석 결과가 없습니다.', type: 'normal' }];

    const segments: Array<{ text: string; type: 'normal' | 'filler' | 'repetition' | 'off_topic' }> = [];
    let currentIndex = 0;

    // 정규식 패턴들
    const offTopicPattern = /%([^%]*?)%\s*\[E\]/g; // %...%[E] 주제이탈
    const fillerPattern = /(\S+)\/(?!\s*\[)/g; // 단어/ (간투어)
    const repetitionPattern = /(\S+)\+/g; // 단어+ (반복/버벅임)

    // 먼저 주제이탈 부분 찾기
    const offTopicMatches: Array<{ start: number; end: number; content: string }> = [];
    let match;
    
    while ((match = offTopicPattern.exec(text)) !== null) {
      offTopicMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1]
      });
    }

    // 텍스트를 순서대로 처리
    let processedText = text;
    const allMatches: Array<{ start: number; end: number; type: string; content: string }> = [];

    // 주제이탈 매치 추가
    offTopicMatches.forEach(item => {
      allMatches.push({
        start: item.start,
        end: item.end,
        type: 'off_topic',
        content: item.content
      });
    });

    // 간투어 매치 추가
    const fillerMatches = [...text.matchAll(fillerPattern)];
    fillerMatches.forEach(match => {
      if (match.index !== undefined) {
        // 주제이탈 구간과 겹치지 않는 경우만 추가
        const isInOffTopic = offTopicMatches.some(ot => 
          match.index! >= ot.start && match.index! < ot.end
        );
        if (!isInOffTopic) {
          allMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            type: 'filler',
            content: match[1]
          });
        }
      }
    });

    // 단어반복 매치 추가
    const repetitionMatches = [...text.matchAll(repetitionPattern)];
    repetitionMatches.forEach(match => {
      if (match.index !== undefined) {
        // 주제이탈 구간과 겹치지 않는 경우만 추가
        const isInOffTopic = offTopicMatches.some(ot => 
          match.index! >= ot.start && match.index! < ot.end
        );
        if (!isInOffTopic) {
          allMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            type: 'repetition',
            content: match[1]
          });
        }
      }
    });

    // 매치를 위치순으로 정렬
    allMatches.sort((a, b) => a.start - b.start);

    // 텍스트를 세그먼트로 분할
    let lastIndex = 0;
    
    allMatches.forEach(match => {
      // 이전 텍스트 추가
      if (match.start > lastIndex) {
        const normalText = text.substring(lastIndex, match.start);
        if (normalText.trim()) {
          segments.push({
            text: normalText,
            type: 'normal'
          });
        }
      }

      // 매치된 부분 추가 (토글 상태에 따라)
      const shouldShow = 
        (match.type === 'filler' && showFillers) ||
        (match.type === 'repetition' && showRepetitions) ||
        (match.type === 'off_topic' && showOffTopic);

      if (shouldShow) {
        segments.push({
          text: match.type === 'off_topic' ? match.content : match.content,
          type: match.type as any
        });
      } else {
        // 토글이 꺼져있으면 일반 텍스트로 표시
        segments.push({
          text: match.type === 'off_topic' ? match.content : match.content,
          type: 'normal'
        });
      }

      lastIndex = match.end;
    });

    // 남은 텍스트 추가
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText.trim()) {
        segments.push({
          text: remainingText,
          type: 'normal'
        });
      }
    }

    return segments;
  };

  const renderAnalysisText = (text: string) => {
    const segments = parseAndStyleText(text);
    
    return (
      <Text style={tw`text-sm leading-6 text-gray-900`}>
        {segments.map((segment, index) => {
          let style: any = {};
          
          if (segment.type === 'filler') {
            style = { backgroundColor: '#34C75933' }; // 간투어 - 연한 빨간색
          } else if (segment.type === 'repetition') {
            style = { backgroundColor: '#EAB30833' }; // 단어반복 - 연한 노란색
          } else if (segment.type === 'off_topic') {
            style = { 
              borderBottomWidth: 2,
              borderBottomColor: '#EF4444' // 주제이탈 - 빨간색 밑줄
            };
          }

          return (
            <Text key={index} style={style}>
              {segment.text}
            </Text>
          );
        })}
      </Text>
    );
  };

  return (
    <View style={tw`flex-1 bg-primary`}>
      <SafeAreaView 
        edges={['top']} 
        style={tw`bg-primary`}
      >
        <Navbar 
          title="selo"
          onHomePress={() => navigation?.navigate('Home')}
          onBackPress={() => navigation?.goBack()}
        />
      </SafeAreaView>
      
      <View style={tw`flex-1 bg-white`}>
        {/* 페이지 헤더 */}
        <View style={tw`flex-row items-center px-4 py-4`}>
          <Icon name="align-left" size={24} color="#374151" style={tw`mr-2`} />
          <CustomText weight="700" style={tw`text-lg text-gray-900`}>
            발화 내용
          </CustomText>
        </View>


        {/* 토글 버튼들 */}
        <View style={tw`px-4 py-3`}>
          <View style={tw`flex-row flex-wrap`}>
            {/* 단어반복/버벅임 버튼 */}
            <TouchableOpacity
              style={[
                tw`flex-row items-center px-3 py-1.5 rounded-full mr-2 mb-2`,
                showRepetitions 
                  ? { 
                      backgroundColor: '#EAB30833',
                      borderWidth: 1,
                      borderColor: '#EAB308'
                    }
                  : { 
                      backgroundColor: 'transparent',
                      borderWidth: 1,
                      borderColor: '#D1D5DB'
                    }
              ]}
              onPress={() => setShowRepetitions(!showRepetitions)}
              activeOpacity={0.7}
            >
              <CustomText 
                weight="500" 
                style={tw`text-sm text-gray-900`}
              >
                단어반복/버벅임
              </CustomText>
            </TouchableOpacity>

            {/* 간투어 버튼 */}
            <TouchableOpacity
              style={[
                tw`flex-row items-center px-3 py-1.5 rounded-full mr-2 mb-2`,
                showFillers 
                  ? { 
                      backgroundColor: '#34C75933',
                      borderWidth: 1,
                      borderColor: '#34C759'
                    }
                  : { 
                      backgroundColor: 'transparent',
                      borderWidth: 1,
                      borderColor: '#D1D5DB'
                    }
              ]}
              onPress={() => setShowFillers(!showFillers)}
              activeOpacity={0.7}
            >
              <CustomText 
                weight="500" 
                style={tw`text-sm text-gray-900`}
              >
                간투어
              </CustomText>
            </TouchableOpacity>

            {/* 주제이탈 버튼 */}
            <TouchableOpacity
              style={[
                tw`flex-row items-center px-3 py-1.5 mb-2`,
                {
                  backgroundColor: 'transparent',
                  borderBottomWidth: 2,
                  borderBottomColor: showOffTopic ? '#EF4444' : '#9CA3AF',
                }
              ]}
              onPress={() => setShowOffTopic(!showOffTopic)}
              activeOpacity={0.7}
            >
              <CustomText 
                weight="500" 
                style={tw`text-sm text-gray-900`}
              >
                주제이탈
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 분석 결과 스크롤 뷰 */}
        <ScrollView
          style={tw`flex-1`}
          contentContainerStyle={tw`px-4 py-4`}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`mb-6`}>
            {/* 제목 */}
            <View style={tw`mb-3`}>
              <CustomText 
                weight="600" 
                style={[
                  tw`text-base`,
                  { color: '#6B54ED' }
                ]}
              >
                {analysisResult.topic}
              </CustomText>
            </View>

            {/* 본문 - 새로운 파싱 방식으로 렌더링 */}
            {analysisResult?.full_text ? (
              renderAnalysisText(analysisResult.full_text)
            ) : (
              <CustomText style={tw`text-sm text-gray-500`}>
                분석 결과가 없습니다.
              </CustomText>
            )}
          </View>

        </ScrollView>
      </View>
    </View>
  );
};

export default Result;