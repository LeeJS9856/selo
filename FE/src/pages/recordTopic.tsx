// src/pages/recordTopic.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, Easing } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
import { SafeAreaView } from 'react-native-safe-area-context';

// tailwind 설정 적용
const tw = create(tailwindConfig);

interface RecordTopicProps {
  navigation?: any;
  route?: {
    params?: {
      selectedTopic?: {
        id: string;
        title: string;
      };
      selectedInterest?: string;
    }
  }
}

const RecordTopic: React.FC<RecordTopicProps> = ({ navigation, route }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxRecordingTime] = useState(180); // 3분 = 180초
  
  // 애니메이션 값들 - useRef로 관리
  const scaleValue = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  // 전달받은 토픽 정보
  const selectedTopic = route?.params?.selectedTopic;
  const selectedInterest = route?.params?.selectedInterest;

  // 카운트다운 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (!isRecording && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && !isRecording) {
      // 자동으로 녹음 시작
      startRecording();
    }

    return () => clearInterval(interval);
  }, [countdown, isRecording]);

  // 녹음 시간 카운터
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev + 1 >= maxRecordingTime) {
            // 3분이 지나면 자동으로 녹음 종료
            stopRecording();
            return maxRecordingTime;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording, maxRecordingTime]);

  // 음성 파형 애니메이션 (무한 반복)
  useEffect(() => {
    let scaleAnimation: Animated.CompositeAnimation;
    let pulseAnimation: Animated.CompositeAnimation;

    if (isRecording) {
      // 스케일 애니메이션 - 사인파 형태로 자연스럽게
      scaleAnimation = Animated.loop(
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
      pulseAnimation = Animated.loop(
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
    }
    // 컴포넌트 언마운트 시 애니메이션 정리
    return () => {
      if (scaleAnimation) {
        scaleAnimation.stop();
      }
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
  }, [isRecording, scaleValue, pulseValue]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    console.log('녹음 시작');
  };

  const stopRecording = () => {
    setIsRecording(false);
    console.log('녹음 완료');
    // 분석 페이지로 이동
    navigation.navigate('Analysis', {
      selectedTopic,
      selectedInterest,
      recordingTime
    });
  };

  const changeTopicHandler = () => {
    // 토픽 선택 페이지로 돌아가기
    navigation.goBack();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      
      {/* 메인 콘텐츠 영역 */}
      <View style={tw`flex-1 bg-white`}>
        {/* 헤더 */}
        <View style={tw`px-6 pt-8 pb-4`}>
          <CustomText 
            weight="700" 
            style={tw`text-lg text-gray-900 text-center mb-2`}
          >
            오늘의 발화 주제
          </CustomText>
        </View>

        {/* 토픽 카드 */}
        <View style={tw`px-6 pt-6`}>
          <View style={[
            tw`rounded-xl p-6 mb-8`,
            {
              backgroundColor: 'rgba(107, 84, 237, 0.05)',
              borderWidth: 1,
              borderColor: 'rgba(107, 84, 237, 0.2)',
            }
          ]}>
            <CustomText 
              weight="700" 
              style={[
                tw`text-lg text-center leading-7`,
                {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  color: '#6B54ED',
                }
              ]}
            >
              {selectedTopic?.title || '텀블러의 사용 실태와 텀블러가 환경과 경제에 미치는 영향을 설명하세요.'}
            </CustomText>
          </View>
        </View>

        {/* 중앙 컨텐츠 영역 */}
        <View style={tw`flex-1 items-center justify-center px-6`}>
          {!isRecording ? (
            // 녹음 시작 전 상태
            <>
              {/* 주제 바꾸기 버튼 */}
              <TouchableOpacity
                style={[
                  tw`rounded-full px-4 py-2 mb-12`,
                  {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }
                ]}
                onPress={changeTopicHandler}
                activeOpacity={0.7}
              >
                <CustomText 
                  weight="500" 
                  style={tw`text-gray-600 text-sm`}
                >
                  주제 바꾸기
                </CustomText>
              </TouchableOpacity>

              {/* 진행바 */}
              <View style={tw`w-64 h-2 bg-gray-200 rounded-full mb-4`}>
                <View 
                  style={[
                    tw`h-full bg-primary rounded-full`,
                    { width: `${((60 - countdown) / 60) * 100}%` }
                  ]} 
                />
              </View>

              {/* 카운트다운 텍스트 */}
              <CustomText 
                weight="500" 
                style={tw`text-primary text-sm`}
              >
                {countdown}초 뒤 시작합니다.
              </CustomText>
            </>
          ) : (
            // 녹음 중 상태
            <>
              {/* 녹음 중 표시 */}
              <View style={[
                tw`bg-red-500 rounded-full px-4 py-1 mb-12`,
                {
                  shadowColor: '#EF4444',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }
              ]}>
                <CustomText 
                  weight="600" 
                  style={tw`text-white text-sm`}
                >
                  녹음 중...
                </CustomText>
              </View>

              {/* 음성 파형 애니메이션 */}
              <Animated.View style={{ transform: [{ scale: pulseValue }] }}>
                <View style={[
                  tw`w-32 h-32 rounded-full items-center justify-center`,
                  {
                    backgroundColor: 'rgba(107, 84, 237, 0.1)',
                  }
                ]}>
                  <Animated.View 
                    style={[
                      tw`w-20 h-20 rounded-full items-center justify-center`,
                      {
                        backgroundColor: 'rgba(107, 84, 237, 0.3)',
                        transform: [{ scale: scaleValue }]
                      }
                    ]}
                  >
                    <View style={[
                      tw`w-12 h-12 rounded-full`,
                      { backgroundColor: '#6B54ED' }
                    ]} />
                  </Animated.View>
                </View>
              </Animated.View>

              {/* 녹음 시간 */}
              <CustomText 
                weight="500" 
                style={tw`text-primary text-lg mt-6`}
              >
                {formatTime(recordingTime)}
              </CustomText>
            </>
          )}
        </View>

        {/* 하단 버튼 */}
        <View style={tw`px-6 pb-8`}>
          <TouchableOpacity
            style={[
              tw`rounded-full py-4 px-8 items-center justify-center`,
              {
                backgroundColor: isRecording ? '#6B54ED' : 'transparent',
                borderWidth: isRecording ? 0 : 1,
                borderColor: isRecording ? 'transparent' : '#6B54ED',
              }
            ]}
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.8}
          >
            <CustomText 
              weight="600" 
              style={[
                tw`text-base`,
                { 
                  color: isRecording ? 'white' : '#6B54ED'
                }
              ]}
            >
              {isRecording ? '발화 끝내기' : '바로 시작하기'}
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RecordTopic;