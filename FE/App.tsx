import React from 'react';
import { View } from 'react-native';
import { create } from 'twrnc';
import CustomText from './src/utils/CustomText';
import tailwindConfig from './tailwind.config';

const tw = create(tailwindConfig);

function App() {
  return (
    <View style={tw`flex-1 p-4 items-center justify-center`}>
      <CustomText weight="100" style={tw`text-xl text-primary mb-2`}>
        프리텐다드 Thin 텍스트
      </CustomText>
      
      <CustomText weight="200" style={tw`text-xl text-primary mb-2`}>
        프리텐다드 Regular 텍스트
      </CustomText>
      
      <CustomText weight="300" style={tw`text-xl text-primary mb-2`}>
        프리텐다드 Bold 텍스트
      </CustomText>
      
      <CustomText weight="900" style={tw`text-xl text-primary mb-2`}>
        프리텐다드 Black 텍스트
      </CustomText>
    </View>
  );
}

export default App;