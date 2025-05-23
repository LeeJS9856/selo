// src/components/TopicCard.tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Icon from 'react-native-vector-icons/Ionicons';

// tailwind 설정 적용
const tw = create(tailwindConfig);

interface TopicCardProps {
  title: string;
  onPress?: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({
  title,
  onPress
}) => {
  return (
    <TouchableOpacity
      style={[
        tw`bg-gray-50 rounded-xl p-4 mb-3 mx-4 flex-row items-center`,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
          minHeight: 80, // 카드 높이 증가
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon 
        name="mic" 
        size={24} 
        color="#6B54ED" 
        style={tw`mr-4`}
      />
      
      {/* 텍스트 내용 */}
      <View style={tw`flex`}>
        <CustomText 
          weight="500" 
          style={tw`text-gray-800 text-base leading-6`}
        >
          {title}
        </CustomText>
      </View>
    </TouchableOpacity>
  );
};

export default TopicCard;