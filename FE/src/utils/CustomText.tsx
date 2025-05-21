// components/CustomText.tsx
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface CustomTextProps extends TextProps {
  weight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'thin' | 'regular' | 'bold' | 'black';
  children: React.ReactNode;
}

const CustomText: React.FC<CustomTextProps> = ({ 
  weight = '400', 
  style, 
  children, 
  ...props 
}) => {
  // 폰트 무게에 따른 폰트 패밀리 결정
  let fontFamily: string;
  
  switch (weight) {
    case '100':
    case 'thin':
      fontFamily = 'Pretendard-Thin';
      break;
    case '200':
      fontFamily = 'Pretendard-ExtraLight';
      break;
    case '300':
      fontFamily = 'Pretendard-Light';
      break;
    case '400':
    case 'regular':
      fontFamily = 'Pretendard-Regular';
      break;
    case '500':
      fontFamily = 'Pretendard-Medium';
      break;
    case '600':
      fontFamily = 'Pretendard-SemiBold';
      break;
    case '700':
    case 'bold':
      fontFamily = 'Pretendard-Bold';
      break;
    case '800':
      fontFamily = 'Pretendard-ExtraBold';
      break;
    case '900':
    case 'black':
      fontFamily = 'Pretendard-Black';
      break;
    default:
      fontFamily = 'Pretendard-Regular';
  }

  return (
    <Text 
      style={[{ fontFamily }, style]} 
      {...props}
    >
      {children}
    </Text>
  );
};

export default CustomText;