// src/pages/interests.tsx
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
import InterestButton from '../components/interestButton';
import { SafeAreaView } from 'react-native-safe-area-context';

// tailwind 설정 적용
const tw = create(tailwindConfig);

interface InterestsProps {
  navigation?: any;
}

// 관심사 카테고리 데이터
const interestCategories = [
  '정치',
  '교육',
  '스포츠',
  '연예계',
  '음악',
  '과학',
  '기술',
];

const SelectTopic: React.FC<InterestsProps> = ({ navigation }) => {
  const [selectedInterest, setSelectedInterest] = useState<string>('');
  
  const selectInterest = (interest: string) => {
    setSelectedInterest(interest === selectedInterest ? '' : interest); // 같은 것 클릭하면 해제
  };

  const handleNext = () => {
    console.log('선택된 관심사:', selectedInterest);
    // navigation.navigate('NextPage');
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
      <View style={tw`flex-1 bg-white items-center`}>
        <ScrollView 
          style={tw`flex-1`}
          contentContainerStyle={tw`px-6 pt-8 pb-32`}
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 */}
          <View style={tw`mb-8`}>
            <CustomText 
              weight="700" 
              style={tw`text-lg text-gray-900 mb-2 text-center`}
            >
              관심사를 선택 또는 입력해 주세요.
            </CustomText>
          </View>

        </ScrollView>
      </View>
    </View>
  );
};

export default SelectTopic;