// src/pages/interests.tsx
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
import InterestButton from '../components/interestButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { INTEREST_CATEGORIES } from '../constants/topics';

// tailwind 설정 적용
const tw = create(tailwindConfig);

interface InterestsProps {
  navigation?: any;
}

const Interests: React.FC<InterestsProps> = ({ navigation }) => {
  const [selectedInterest, setSelectedInterest] = useState<string>('');
  
  const selectInterest = (interest: string) => {
    setSelectedInterest(interest === selectedInterest ? '' : interest); // 같은 것 클릭하면 해제
  };

  const handleNext = () => {
    console.log('선택된 관심사:', selectedInterest);
    // 선택된 관심사를 SelectTopic 페이지로 전달
    navigation.navigate('SelectTopic', { selectedInterest });
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
          
          {/* 관심사 버튼들 */}
          <View style={tw`flex-row flex-wrap mb-12 justify-center`}>
            {INTEREST_CATEGORIES.map((interest, index) => (
              <InterestButton
                key={index}
                title={interest}
                isSelected={selectedInterest === interest}
                onPress={() => selectInterest(interest)}
              />
            ))}
          </View>
        </ScrollView>
        
        {/* 하단 고정 버튼 */}
        <View style={tw`absolute bottom-0 left-0 right-0 p-6 bg-white`}>
          <TouchableOpacity
            style={[
              tw`rounded-full py-4 px-8 items-center justify-center`,
              {
                backgroundColor: selectedInterest.length > 0 ? '#6B54ED' : '#E5E7EB',
              }
            ]}
            onPress={handleNext}
            disabled={selectedInterest.length === 0}
            activeOpacity={0.8}
          >
            <CustomText 
              weight="600" 
              style={[
                tw`text-base`,
                { 
                  color: selectedInterest.length > 0 ? 'white' : '#9CA3AF' 
                }
              ]}
            >
              확인
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Interests