// src/pages/analysis.tsx
import React from 'react';
import { View } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
import { SafeAreaView } from 'react-native-safe-area-context';

// tailwind 설정 적용
const tw = create(tailwindConfig);

interface AnalysisProps {
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

const Analysis: React.FC<AnalysisProps> = ({ navigation, route }) => {
  const selectedTopic = route?.params?.selectedTopic;
  const selectedInterest = route?.params?.selectedInterest;
  const recordingTime = route?.params?.recordingTime;

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
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <CustomText 
          weight="700" 
          style={tw`text-2xl text-gray-900 mb-4`}
        >
          분석 중...
        </CustomText>
        <CustomText 
          weight="400" 
          style={tw`text-gray-600 text-center px-6`}
        >
          발화 분석 결과를 준비하고 있습니다.
        </CustomText>
        
        {/* 디버그 정보 (개발용) */}
        {__DEV__ && (
          <View style={tw`mt-8 p-4 bg-gray-100 rounded-lg`}>
            <CustomText weight="500" style={tw`text-sm text-gray-700 mb-2`}>
              선택된 관심사: {selectedInterest}
            </CustomText>
            <CustomText weight="500" style={tw`text-sm text-gray-700 mb-2`}>
              선택된 토픽: {selectedTopic?.title}
            </CustomText>
            <CustomText weight="500" style={tw`text-sm text-gray-700`}>
              녹음 시간: {recordingTime}초
            </CustomText>
          </View>
        )}
      </View>
    </View>
  );
};

export default Analysis;