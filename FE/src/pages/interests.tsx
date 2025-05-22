// src/pages/interests.tsx
import React, { useState } from 'react';
import { View, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
import { SafeAreaView } from 'react-native-safe-area-context';

// tailwind 설정 적용
const tw = create(tailwindConfig);

interface InterestsProps {
  navigation?: any;
}

const Interests: React.FC<InterestsProps> = ({ navigation }) => {
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  
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
      
      {/* 메인 콘텐츠 영역 - 비워둠 */}
      <View style={tw`flex-1 bg-white`}>
        {/* 여기에 콘텐츠가 들어갈 예정 */}
      </View>
    </View>
  );
};

export default Interests;