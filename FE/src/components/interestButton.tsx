// src/components/InterestButton.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';

// tailwind 설정 적용
const tw = create(tailwindConfig);

interface InterestButtonProps {
  title: string;
  isSelected: boolean;
  onPress: () => void;
}

const InterestButton: React.FC<InterestButtonProps> = ({
  title,
  isSelected,
  onPress
}) => {
  return (
    <TouchableOpacity
      style={[
        tw`px-5 py-3 rounded-full mr-3 mb-3`,
        {
          backgroundColor: isSelected ? '#6B54ED' : 'transparent',
          borderWidth: 1,
          borderColor: isSelected ? '#6B54ED' : '#D1D5DB',
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <CustomText 
        weight="500" 
        style={[
          tw`text-sm`,
          { color: isSelected ? 'white' : '#6B7280' }
        ]}
      >
        {title}
      </CustomText>
    </TouchableOpacity>
  );
};

export default InterestButton;