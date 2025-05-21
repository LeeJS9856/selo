// src/pages/home.tsx
import React from 'react';
import { View, SafeAreaView, Dimensions } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';

// tailwind 설정 적용
const tw = create(tailwindConfig);

const Home: React.FC = () => {
  const { width, height } = Dimensions.get('window');
  const circleSize = width*2; // 지름이 화면의 가로 길이
  
  return (
    <SafeAreaView style={tw`flex-1 bg-white items-center justify-center`}>
      {/* 상단 절반 primary 색상 */}
      <View 
        style={[
          tw`absolute top-0 left-0 right-0 bg-primary z-0`,
          { height: height / 2 }
        ]} 
      />
      
      {/* primary 색상 원 - 왼쪽 하단에 위치 */}
      <View 
        style={[
          tw`absolute bg-primary z-0`,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            bottom: -5,
            right: -5,
          }
        ]} 
      />
      
      {/* 콘텐츠 */}
      <View style={tw`items-center justify-center z-10`}>
        <CustomText 
            weight="700" 
            style={tw`text-5xl text-white mb-4`}
            >
            selo
        </CustomText>
        <CustomText 
          weight="400" 
          style={tw`text-sm text-white text-center px-10 opacity-80`}
        >
          Enim tortor lacus purus urna pharetra 
        </CustomText>
        <CustomText 
          weight="400" 
          style={tw`text-sm text-white text-center px-10 opacity-80`}
        >
          tincidunt feugiat.
        </CustomText>
      </View>
    </SafeAreaView>
  );
};

export default Home;