// src/pages/analysis.tsx - 업로드 처리 및 결과 대기
import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      audioPath?: string;
    }
  }
}

const Analysis: React.FC<AnalysisProps> = ({ navigation, route }) => {
  const selectedTopic = route?.params?.selectedTopic;
  const selectedInterest = route?.params?.selectedInterest;
  const recordingTime = route?.params?.recordingTime;
  const audioPath = route?.params?.audioPath;

  // 분석 상태
  const [analysisStatus, setAnalysisStatus] = useState('분석 중...');

  // 애니메이션 값들
  const scaleValue = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log('=== Analysis 페이지 진입 ===');
    console.log('토픽:', selectedTopic?.title);
    console.log('오디오 파일:', audioPath);
    
    // 애니메이션 시작
    startAnimations();
    
    // 업로드 시작
    if (audioPath) {
      uploadAudioFile(audioPath);
    }
    
  }, []);

  const startAnimations = () => {
    // 스케일 애니메이션
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

    // 펄스 애니메이션
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.5,
          duration: 1200,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.bezier(0.55, 0.06, 0.68, 0.19),
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
  };

  // 파일 업로드 및 분석
  const uploadAudioFile = async (filePath: string) => {
    try {
      console.log('Analysis 페이지에서 업로드 시작:', filePath);
      setAnalysisStatus('음성 파일 업로드 중...');

      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        throw new Error('파일이 존재하지 않습니다');
      }

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'audio/wav',
        name: 'audio.wav'
      } as any);

      setAnalysisStatus('서버에서 분석 중...');

      const response = await fetch('https://api.selo-ai.my/infer', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 오류: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('업로드 및 분석 완료:', result);

      setAnalysisStatus('분석 완료!');

      // 잠깐 완료 메시지 표시 후 Result 페이지로 이동
      setTimeout(() => {
        navigation.navigate('Result', {
          selectedTopic,
          selectedInterest,
          recordingTime,
          analysisResult: {
            topic: result.analysis?.topic || selectedTopic?.title || '분석된 주제',
            full_text: result.analysis?.full_text || result.text || '분석 결과 없음',
            statistics: result.analysis?.statistics || '통계 정보 없음',
            segments: result.segments || [],
            audio_duration: result.audio_duration_seconds || recordingTime,
            model: result.model || 'Unknown',
            raw_response: result
          }
        });
      }, 1000);

    } catch (error) {
      console.error('업로드 실패:', error);
      setAnalysisStatus('분석 실패');
      
      // 실패 시에도 잠깐 후 Result 페이지로 이동 (오프라인 모드)
      setTimeout(() => {
        navigation.navigate('Result', {
          selectedTopic,
          selectedInterest,
          recordingTime,
          analysisResult: {
            topic: selectedTopic?.title || '분석 실패',
            full_text: '서버 연결 실패로 분석 결과를 가져올 수 없습니다.',
            statistics: '통계 정보 없음',
            segments: [],
            audio_duration: recordingTime || 0,
            model: 'Offline',
            raw_response: null
          }
        });
      }, 2000);
    }
  };

  return (
    <View style={tw`flex-1 bg-primary`}>
      <SafeAreaView 
        edges={['top']} 
        style={tw`bg-primary`}
      >
        <Navbar 
          title="selo"
          onHomePress={() => navigation?.navigate('Home')}
          onBackPress={() => navigation?.goBack()}
        />
      </SafeAreaView>
      
      <View style={tw`flex-1 bg-gray-50 items-center justify-center`}>
        {/* 애니메이션 원 */}
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

        {/* 분석 상태 텍스트 */}
        <CustomText 
          weight="700" 
          style={tw`text-xl text-gray-800 mb-2`}
        >
          발화 내용 분석 중
        </CustomText>
        

      </View>
    </View>
  );
};

export default Analysis;