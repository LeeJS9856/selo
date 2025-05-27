// src/pages/recordTopic.tsx
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
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
  
  // 애니메이션 값들
  const scaleValue = new Animated.Value(1);
  const pulseValue = new Animated.Value(1);

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
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  // 음성 파형 애니메이션
  useEffect(() => {
    if (isRecording) {
      const animate = () => {
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 0.8,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => animate());
      };
      animate();

      // 펄스 애니메이션
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();
    }
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    console.log('녹음 시작');
  };

  const stopRecording = () => {
    setIsRecording(false);
    console.log('녹음 완료');
    // 다음 단계로 이동하거나 결과 처리
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
        <View style={tw`px-6 pt-8 pb-4 border-b border-gray-100`}>
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
            tw`bg-gray-50 rounded-xl p-6 mb-8`,
            {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }
          ]}>
            <CustomText 
              weight="500" 
              style={tw`text-primary text-base text-center leading-6`}
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
                  tw`bg-gray-200 rounded-full px-6 py-3 mb-12`,
                  {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2,
                  }
                ]}
                onPress={changeTopicHandler}
                activeOpacity={0.7}
              >
                <CustomText 
                  weight="500" 
                  style={tw`text-gray-700 text-sm`}
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
                tw`bg-red-500 rounded-full px-4 py-2 mb-12`,
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
                backgroundColor: isRecording ? '#6B54ED' : 'rgba(107, 84, 237, 0.3)',
              }
            ]}
            onPress={isRecording ? stopRecording : undefined}
            disabled={!isRecording}
            activeOpacity={0.8}
          >
            <CustomText 
              weight="600" 
              style={[
                tw`text-base`,
                { 
                  color: isRecording ? 'white' : 'rgba(107, 84, 237, 0.7)' 
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