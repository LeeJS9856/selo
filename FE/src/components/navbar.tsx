// components/Navbar.tsx
import React from 'react';  
import { View, TouchableOpacity, Image  } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import Icon from 'react-native-vector-icons/Octicons';

// tailwind 설정 적용
const tw = create(tailwindConfig);

interface NavbarProps {
  title?: string;
  onHomePress?: () => void;
  onBackPress?: () => void;
  showHomeIcon?: boolean;
  showBackIcon?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onHomePress,
  onBackPress,
  showHomeIcon = true,
  showBackIcon = true
}) => {
  return (
    <>      
      <View style={tw`bg-primary py-4 px-4 flex-row items-center justify-between`}>
        {/* 왼쪽 홈 아이콘 */}
        <View style={tw`w-8 h-8 items-center justify-center`}>
          {showBackIcon && (
            <TouchableOpacity
              onPress={onBackPress}
              activeOpacity={0.7}
              style={tw`w-full h-full items-center justify-center`}
            >
              <Icon 
                name="arrow-left" 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
          )}
        </View>

        <View>
          <Image 
            source={require('../../assets/logo/logo_x.png')}
            style={{
              width: 100,
              height: 24,
              resizeMode: 'contain'
            }}
          />
        </View>

        <View style={tw`w-8 h-8 items-center justify-center`}>
          {showHomeIcon && (
            <TouchableOpacity
              onPress={onHomePress}
              activeOpacity={0.7}
              style={tw`w-full h-full items-center justify-center`}
            >
              <Icon 
                name="home" 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};

export default Navbar;