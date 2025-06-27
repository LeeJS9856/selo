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
  isSelected?: boolean;
  onPress?: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({
  title,
  isSelected = false,
  onPress
}) => {
  return (
    <TouchableOpacity
      style={[
        tw`bg-gray-50 rounded-xl p-4 mb-3 mx-4 flex-row items-center`,
        isSelected && tw`bg-primary-50 border-2 border-primary`,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
          minHeight: 80,
          backgroundColor: isSelected ? '#F3F4F6' : '#F9FAFB',
          borderColor: isSelected ? '#8c0afa' : 'transparent',
          borderWidth: isSelected ? 2 : 0,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        tw`w-10 h-10 rounded-full mr-4 items-center justify-center`,
        { backgroundColor: isSelected ? '#8c0afa' : '#E5E7EB' }
      ]}>
        <Icon 
          name="mic" 
          size={20} 
          color={isSelected ? 'white' : '#6B7280'}
        />
      </View>
      
      {/* 텍스트 내용 */}
      <View style={tw`flex-1`}>
        <CustomText 
          weight="500" 
          style={[
            tw`text-base leading-6`,
            { color: isSelected ? '#374151' : '#6B7280' }
          ]}
        >
          {title}
        </CustomText>
      </View>
    </TouchableOpacity>
  );
};

export default TopicCard;