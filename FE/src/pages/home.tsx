// src/pages/home.tsx
import React from 'react';
import { View, Dimensions, TouchableOpacity, Image } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// tailwind 설정 적용
const tw = create(tailwindConfig);

interface HomeProps {
  navigation?: any; // React Navigation의 navigation prop
}

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const { width, height } = Dimensions.get('window');
  const circleSize = width*2; // 지름이 화면의 가로 길이
  
  const handlePress = () => {
    // interests 페이지로 이동
    if (navigation) {
      navigation.navigate('Interests');
    }
  };
  
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
      
      {/* 클릭 가능한 콘텐츠 */}
      <TouchableOpacity 
        style={tw`items-center justify-center z-10`}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* PNG 로고 */}
        <View>
          <Image 
            source={require('../../assets/logo/logo_y.png')}
            style={{
              width: 300,
              height: 300,
              resizeMode: 'contain'
            }}
          />
        </View>
        <CustomText 
          weight="400" 
          style={tw`text-sm text-white text-center px-10 opacity-80`}
        >
          뚝딱이는 말 버릇,
        </CustomText>
        <CustomText 
          weight="400" 
          style={tw`text-sm text-white text-center px-10 opacity-80`}
        >
          이제 스피치 헬퍼 selo와 함께하세요
        </CustomText>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;