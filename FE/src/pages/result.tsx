// src/pages/result.tsx - 단어 단위로 쪼개서 밑줄 적용
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { parseAnalysisText, getActiveTypes } from '../utils/textParser';

const tw = create(tailwindConfig);

// 단어별 밑줄 컴포넌트
const WordWithUnderline = ({ word, backgroundColor, underlineColor }: {
  word: string;
  backgroundColor: string;
  underlineColor: string;
}) => (
  <View style={{ position: 'relative' }}>
    <Text style={[
      tw`text-sm leading-6 text-gray-900`,
      { backgroundColor }
    ]}>
      {word}
    </Text>
    <View 
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: underlineColor,
      }}
    />
  </View>
);

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
  const [showFillers, setShowFillers] = useState(true);
  const [showRepetitions, setShowRepetitions] = useState(true);
  const [showOffTopic, setShowOffTopic] = useState(true);

  // 기본값 또는 전달받은 분석 결과
  const analysisResult = route?.params?.analysisResult;
  
  const selectedTopic = route?.params?.selectedTopic;

  const renderAnalysisText = (text: string) => {
    const segments = parseAnalysisText(text);
    
    return (
      <View style={tw`flex-row flex-wrap`}>
        {segments.map((segment, segmentIndex) => {
          const activeTypes = getActiveTypes(
            segment.types,
            showFillers,
            showRepetitions,
            showOffTopic
          );

          // 배경색 결정
          let backgroundColor = 'transparent';
          if (activeTypes.includes('repetition')) {
            backgroundColor = '#EAB30833'; // 노란색
          } else if (activeTypes.includes('filler')) {
            backgroundColor = '#34C75933'; // 초록색
          }

          // 밑줄 색상 결정
          const isOffTopic = segment.types?.includes('off_topic') || false;
          const underlineColor = (isOffTopic && showOffTopic) ? '#EF4444' : '#FFFFFF';

          // 텍스트를 단어 단위로 분할 (공백과 구두점 고려)
          const words = segment.text.split(/(\s+|[.,!?;:])/);

          return words.map((word, wordIndex) => {
            // 빈 문자열이면 건너뛰기
            if (!word) return null;

            // 공백이나 구두점은 간단하게 처리
            if (/^\s+$/.test(word) || /^[.,!?;:]+$/.test(word)) {
              return (
                <Text 
                  key={`${segmentIndex}-${wordIndex}`}
                  style={tw`text-sm leading-6 text-gray-900`}
                >
                  {word}
                </Text>
              );
            }

            // 실제 단어는 밑줄과 함께 렌더링
            return (
              <WordWithUnderline
                key={`${segmentIndex}-${wordIndex}`}
                word={word}
                backgroundColor={backgroundColor}
                underlineColor={underlineColor}
              />
            );
          });
        })}
      </View>
    );
  };

  return (
    <View style={tw`flex-1 bg-primary`}>
      <SafeAreaView edges={['top']} style={tw`bg-primary`}>
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
                  ? { backgroundColor: '#EAB30833', borderWidth: 1, borderColor: '#EAB308' }
                  : { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#D1D5DB' }
              ]}
              onPress={() => setShowRepetitions(!showRepetitions)}
              activeOpacity={0.7}
            >
              <CustomText weight="500" style={tw`text-sm text-gray-900`}>
                단어반복/버벅임
              </CustomText>
            </TouchableOpacity>

            {/* 간투어 버튼 */}
            <TouchableOpacity
              style={[
                tw`flex-row items-center px-3 py-1.5 rounded-full mr-2 mb-2`,
                showFillers 
                  ? { backgroundColor: '#34C75933', borderWidth: 1, borderColor: '#34C759' }
                  : { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#D1D5DB' }
              ]}
              onPress={() => setShowFillers(!showFillers)}
              activeOpacity={0.7}
            >
              <CustomText weight="500" style={tw`text-sm text-gray-900`}>
                간투어
              </CustomText>
            </TouchableOpacity>

            {/* 주제이탈 버튼 */}
            <View style={{ position: 'relative' }}>
              <TouchableOpacity
                style={tw`flex-row items-center px-3 py-1.5 mb-2`}
                onPress={() => setShowOffTopic(!showOffTopic)}
                activeOpacity={0.7}
              >
                <CustomText weight="500" style={tw`text-sm text-gray-900`}>
                  주제이탈
                </CustomText>
              </TouchableOpacity>
              {showOffTopic && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: '#EF4444',
                  }}
                />
              )}
            </View>
          </View>
        </View>

        {/* 분석 결과 */}
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
                style={[tw`text-base`, { color: '#6B54ED' }]}
              >
                {analysisResult?.topic || selectedTopic?.title || '발화 주제'}
              </CustomText>
            </View>

            {/* 본문 */}
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