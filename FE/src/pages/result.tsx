// src/pages/result.tsx
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SAMPLE_RESULTS, parseAnalysisText } from '../constants/result';
import Icon from 'react-native-vector-icons/Ionicons';

// tailwind 설정 적용
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
    }
  }
}

const Result: React.FC<ResultProps> = ({ navigation, route }) => {
  const [showFillers, setShowFillers] = useState(true); // 간투어
  const [showRepetitions, setShowRepetitions] = useState(true); // 단어반복
  const [showStutters, setShowStutters] = useState(true); // 버벅임

  // 샘플 데이터 사용 (실제로는 분석 결과를 받아야 함)
  const analysisResults = SAMPLE_RESULTS;

  const renderAnalysisText = (text: string) => {
    const segments = parseAnalysisText(text, showFillers, showRepetitions, showStutters);
    
    return (
      <Text style={tw`text-sm leading-6 text-gray-900`}>
        {segments.map((segment, index) => {
          let bgColor = 'transparent';
          
          if (segment.type === 'filler') {
            bgColor = '#D1F4E0'; // 연한 초록색
          } else if (segment.type === 'repetition') {
            bgColor = '#FFE4B5'; // 연한 주황색
          } else if (segment.type === 'stutter') {
            bgColor = '#E6E6FA'; // 연한 보라색
          }

          return (
            <Text
              key={index}
              style={{ backgroundColor: bgColor }}
            >
              {segment.text}
            </Text>
          );
        })}
      </Text>
    );
  };

  return (
    <View style={tw`flex-1 bg-primary`}>
      {/* 상태바 영역을 primary 색상으로 */}
      <SafeAreaView 
        edges={['top']} 
        style={tw`bg-primary`}
      >
        <Navbar 
          title="selo"
          onHomePress={() => navigation.navigate('Home')}
          onSettingsPress={() => console.log('설정 클릭')}
        />
      </SafeAreaView>
      
      {/* 메인 콘텐츠 영역 */}
      <View style={tw`flex-1 bg-white`}>
        {/* 페이지 헤더 */}
        <View style={tw`flex-row items-center px-4 py-3`}>
          <Icon name="list" size={24} color="#374151" style={tw`mr-2`} />
          <CustomText weight="600" style={tw`text-lg text-gray-900`}>
            발화 내용
          </CustomText>
        </View>

        {/* 토글 버튼들 */}
        <View style={tw`px-4 py-3`}>
          <View style={tw`flex-row`}>
            {/* 단어반복 버튼 */}
            <TouchableOpacity
              style={[
                tw`flex-row items-center px-3 py-1.5 rounded-full mr-2`,
                showRepetitions 
                  ? { 
                      backgroundColor: '#FFE4B5',
                      borderWidth: 1,
                      borderColor: '#F59E0B'
                    }
                  : { 
                      backgroundColor: '#F3F4F6',
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
                단어반복
              </CustomText>
            </TouchableOpacity>

            {/* 간투어 버튼 */}
            <TouchableOpacity
              style={[
                tw`flex-row items-center px-3 py-1.5 rounded-full mr-2`,
                showFillers 
                  ? { 
                      backgroundColor: '#D1F4E0',
                      borderWidth: 1,
                      borderColor: '#10B981'
                    }
                  : { 
                      backgroundColor: '#F3F4F6',
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

            {/* 버벅임 버튼 */}
            <TouchableOpacity
              style={[
                tw`flex-row items-center px-3 py-1.5 rounded-full`,
                showStutters 
                  ? { 
                      backgroundColor: '#E6E6FA',
                      borderWidth: 1,
                      borderColor: '#9333EA'
                    }
                  : { 
                      backgroundColor: '#F3F4F6',
                      borderWidth: 1,
                      borderColor: '#D1D5DB'
                    }
              ]}
              onPress={() => setShowStutters(!showStutters)}
              activeOpacity={0.7}
            >
              <CustomText 
                weight="500" 
                style={tw`text-sm text-gray-900`}
              >
                버벅임
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
          {analysisResults.map((result, index) => (
            <View key={result.id} style={tw`mb-6`}>
              {/* 제목 */}
              <View style={tw`mb-3`}>
                <CustomText 
                  weight="600" 
                  style={[
                    tw`text-base`,
                    { color: '#6B54ED' }
                  ]}
                >
                  {result.title}
                </CustomText>
              </View>

              {/* 본문 - 하나의 Text 컴포넌트로 렌더링 */}
              {renderAnalysisText(result.content)}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default Result;