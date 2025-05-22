// src/pages/interests.tsx
import React, { useState } from 'react';
import { View, SafeAreaView, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
// tailwind 설정 적용
const tw = create(tailwindConfig);

interface InterestsProps {
  navigation?: any; // React Navigation의 navigation prop
}

// 관심사 카테고리 데이터
const interestCategories = [
  { id: 1, title: '음악', emoji: '🎵' },
  { id: 2, title: '여행', emoji: '✈️' },
  { id: 3, title: '요리', emoji: '🍳' },
  { id: 4, title: '독서', emoji: '📚' },
  { id: 5, title: '운동', emoji: '🏃' },
  { id: 6, title: '영화', emoji: '🎬' },
  { id: 7, title: '사진', emoji: '📷' },
  { id: 8, title: '게임', emoji: '🎮' },
  { id: 9, title: '미술', emoji: '🎨' },
  { id: 10, title: '패션', emoji: '👗' },
  { id: 11, title: '기술', emoji: '💻' },
  { id: 12, title: '반려동물', emoji: '🐕' },
];

const Interests: React.FC<InterestsProps> = ({ navigation }) => {
  const { width, height } = Dimensions.get('window');
  const circleSize = width * 1.5;
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  
  const toggleInterest = (id: number) => {
    setSelectedInterests(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    // 다음 페이지로 이동 또는 완료 처리
    console.log('선택된 관심사:', selectedInterests);
    // navigation.navigate('NextPage');
  };
  
  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      {/* 상단 primary 색상 영역 */}
      <Navbar 
        title="selo"
        onHomePress={() => navigation.navigate('Home')}
        onSettingsPress={() => console.log('설정 클릭')}
        />
      
      <ScrollView 
        style={tw`flex-1 z-10`}
        contentContainerStyle={tw`px-6 pt-16 pb-8`}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={tw`mb-8`}>
          <CustomText 
            weight="700" 
            style={tw`text-3xl text-white mb-2`}
          >
            관심사를 선택해주세요
          </CustomText>
          <CustomText 
            weight="400" 
            style={tw`text-sm text-white opacity-80`}
          >
            당신의 취향에 맞는 추천을 위해 관심사를 알려주세요
          </CustomText>
        </View>
        
        {/* 관심사 그리드 */}
        <View style={tw`flex-row flex-wrap justify-between mb-8`}>
          {interestCategories.map((category) => {
            const isSelected = selectedInterests.includes(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  tw`w-[48%] p-4 rounded-2xl mb-4 items-center justify-center`,
                  {
                    backgroundColor: isSelected ? '#6B54ED' : 'white',
                    borderWidth: isSelected ? 0 : 1,
                    borderColor: '#E5E7EB',
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    minHeight: 100,
                  }
                ]}
                onPress={() => toggleInterest(category.id)}
                activeOpacity={0.8}
              >
                <CustomText 
                  weight="400" 
                  style={[
                    tw`text-2xl mb-2`,
                  ]}
                >
                  {category.emoji}
                </CustomText>
                <CustomText 
                  weight="500" 
                  style={[
                    tw`text-sm text-center`,
                    { color: isSelected ? 'white' : '#374151' }
                  ]}
                >
                  {category.title}
                </CustomText>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* 선택된 관심사 카운트 */}
        <View style={tw`items-center mb-6`}>
          <CustomText 
            weight="400" 
            style={tw`text-sm text-gray-600`}
          >
            {selectedInterests.length > 0 
              ? `${selectedInterests.length}개의 관심사를 선택했습니다`
              : '관심사를 선택해주세요'
            }
          </CustomText>
        </View>
        
        {/* 다음 버튼 */}
        <TouchableOpacity
          style={[
            tw`rounded-2xl py-4 px-8 items-center justify-center mx-4`,
            {
              backgroundColor: selectedInterests.length > 0 ? '#6B54ED' : '#E5E7EB',
            }
          ]}
          onPress={handleNext}
          disabled={selectedInterests.length === 0}
          activeOpacity={0.8}
        >
          <CustomText 
            weight="600" 
            style={[
              tw`text-base`,
              { 
                color: selectedInterests.length > 0 ? 'white' : '#9CA3AF' 
              }
            ]}
          >
            다음
          </CustomText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Interests;