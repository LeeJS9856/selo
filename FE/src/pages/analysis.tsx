// src/pages/analysis.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
import { SafeAreaView } from 'react-native-safe-area-context';

// tailwind 설정 적용
const tw = create(tailwindConfig);

interface AnalysisProps {
  navigation?: any;
  route?: {
    params?: {
      selectedTopic?: {
        id: string;
        title: string;
      };
      selectedInterest?: string;
      recordingTime?: number;
    }
  }
}

const Analysis: React.FC<AnalysisProps> = ({ navigation, route }) => {
  const selectedTopic = route?.params?.selectedTopic;
  const selectedInterest = route?.params?.selectedInterest;
  const recordingTime = route?.params?.recordingTime;

  // 애니메이션 값들 - recordTopic과 동일
  const scaleValue = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 5초 후에 결과 페이지로 이동
    const timer = setTimeout(() => {
      navigation.navigate('Result', {
        selectedTopic,
        selectedInterest,
        recordingTime
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation, selectedTopic, selectedInterest, recordingTime]);

  useEffect(() => {
    // 음성 파형 애니메이션 (녹음 페이지와 동일)
    // 스케일 애니메이션 - 사인파 형태로 자연스럽게
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.3,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 펄스 애니메이션 - 더 부드러운 곡선
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.5,
          duration: 1200,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // ease-out-quad
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.bezier(0.55, 0.06, 0.68, 0.19), // ease-in-quad
          useNativeDriver: true,
        }),
      ])
    );

    scaleAnimation.start();
    pulseAnimation.start();

    // 컴포넌트 언마운트 시 애니메이션 정리
    return () => {
      scaleAnimation.stop();
      pulseAnimation.stop();
    };
  }, [scaleValue, pulseValue]);

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
          onBackPress={() => navigation.goBack()}
        />
      </SafeAreaView>
      
      {/* 메인 콘텐츠 영역 */}
      <View style={tw`flex-1 bg-gray-50 items-center justify-center`}>
        {/* 음성 파형 애니메이션 - 크기를 키운 버전 */}
        <Animated.View style={{ transform: [{ scale: pulseValue }] }}>
          <View style={[
            tw`w-48 h-48 rounded-full items-center justify-center mb-12`,
            {
              backgroundColor: 'rgba(107, 84, 237, 0.1)',
            }
          ]}>
            <Animated.View 
              style={[
                tw`w-32 h-32 rounded-full items-center justify-center`,
                {
                  backgroundColor: 'rgba(107, 84, 237, 0.3)',
                  transform: [{ scale: scaleValue }]
                }
              ]}
            >
              <View style={[
                tw`w-20 h-20 rounded-full`,
                { backgroundColor: '#6B54ED' }
              ]} />
            </Animated.View>
          </View>
        </Animated.View>

        {/* 텍스트 */}
        <CustomText 
          weight="500" 
          style={tw`text-gray-700 text-base`}
        >
          분석 중입니다...
        </CustomText>
      </View>
    </View>
  );
};

export default Analysis;