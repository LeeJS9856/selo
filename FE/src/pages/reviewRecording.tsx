// src/pages/reviewRecording.tsx - 녹음 재생 페이지
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Platform, Alert } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

const tw = create(tailwindConfig);

interface ReviewRecordingProps {
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

const ReviewRecording: React.FC<ReviewRecordingProps> = ({ navigation, route }) => {
  // Props에서 데이터 추출
  const selectedTopic = route?.params?.selectedTopic;
  const selectedInterest = route?.params?.selectedInterest;
  const recordingTime = route?.params?.recordingTime || 0;
  const audioPath = route?.params?.audioPath;

  // 상태 관리
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(recordingTime);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AudioRecorderPlayer 인스턴스
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

  useEffect(() => {
    console.log('ReviewRecording 페이지 진입');
    console.log('오디오 파일:', audioPath);
    
    // 컴포넌트 마운트 시 분석 시작
    if (audioPath) {
      startAnalysis();
    }

    return () => {
      // 정리
      if (isPlaying) {
        audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();
      }
    };
  }, []);

  // 백엔드 분석 시작
  const startAnalysis = async () => {
    if (!audioPath) return;

    try {
      setIsAnalyzing(true);
      console.log('백엔드 분석 시작:', audioPath);

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? `file://${audioPath}` : audioPath,
        type: 'audio/m4a',
        name: 'audio.m4a'
      } as any);

      const response = await fetch('https://api.selo-ai.my/infer', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const result = await response.json();
      console.log('분석 완료:', result);

      setAnalysisResult({
        topic: result.analysis?.topic || selectedTopic?.title || '분석된 주제',
        full_text: result.analysis?.full_text || result.text || '분석 결과 없음',
        statistics: result.analysis?.statistics || '통계 정보 없음',
        segments: result.segments || [],
        audio_duration: result.audio_duration_seconds || recordingTime,
        model: result.model || 'Unknown',
        raw_response: result
      });

      setIsAnalysisComplete(true);
      setIsAnalyzing(false);

    } catch (error) {
      console.error('분석 실패:', error);
      setIsAnalyzing(false);
      
      // 실패 시 기본 결과 설정
      setAnalysisResult({
        topic: selectedTopic?.title || '분석 실패',
        full_text: '서버 연결 실패로 분석 결과를 가져올 수 없습니다.',
        statistics: '통계 정보 없음',
        segments: [],
        audio_duration: recordingTime || 0,
        model: 'Offline',
        raw_response: null
      });
      setIsAnalysisComplete(true);
    }
  };

  // 재생/일시정지 토글
  const togglePlayback = async () => {
    if (!audioPath) {
      Alert.alert('오류', '재생할 오디오 파일이 없습니다.');
      return;
    }

    try {
      if (isPlaying) {
        // 일시정지
        await audioRecorderPlayer.pausePlayer();
        setIsPlaying(false);
      } else {
        // 재생 시작
        await audioRecorderPlayer.startPlayer(audioPath);
        
        audioRecorderPlayer.addPlayBackListener((e) => {
          const currentSeconds = Math.floor(e.currentPosition / 1000);
          const durationSeconds = Math.floor(e.duration / 1000);
          
          setCurrentTime(currentSeconds);
          setDuration(durationSeconds);

          // 재생 완료 시
          if (e.currentPosition >= e.duration) {
            setIsPlaying(false);
            setCurrentTime(0);
            audioRecorderPlayer.removePlayBackListener();
          }
        });

        setIsPlaying(true);
      }
    } catch (error) {
      console.error('재생 오류:', error);
      Alert.alert('재생 오류', '오디오 재생 중 오류가 발생했습니다.');
    }
  };

  // 재생 중지
  const stopPlayback = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
      setCurrentTime(0);
    } catch (error) {
      console.error('정지 오류:', error);
    }
  };

  // 다음 버튼 클릭 (핵심 로직)
  const handleNext = async () => {
    // 재생 중이면 먼저 정지
    if (isPlaying) {
      await stopPlayback();
    }

    if (isAnalysisComplete && analysisResult) {
      // 분석이 완료된 경우 바로 Result 페이지로 이동
      navigation.navigate('Result', {
        selectedTopic,
        selectedInterest,
        recordingTime,
        analysisResult
      });
    } else {
      // 분석이 완료되지 않은 경우 Analysis 페이지로 이동
      navigation.navigate('Analysis', {
        selectedTopic,
        selectedInterest,
        recordingTime,
        audioPath,
        analysisResult: analysisResult // 부분 결과가 있으면 전달
      });
    }
  };

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={tw`flex-1 bg-primary`}>
      <SafeAreaView edges={['top']} style={tw`bg-primary`}>
        <Navbar 
          title="selo"
          onHomePress={() => navigation?.navigate('Home')}
          onBackPress={() => navigation?.goBack()}
        />
      </SafeAreaView>
      
      <View style={tw`flex-1 bg-white`}>
        <View style={tw`px-6 pt-8 pb-4`}>
            <CustomText weight="700" style={tw`text-lg text-gray-900 text-center mb-2`}>
                오늘의 발화 주제
            </CustomText>
        </View>

        <View style={tw`px-6 pt-6`}>
          <View style={[
            tw`rounded-xl p-6 mb-8`,
            {
              backgroundColor: 'rgba(107, 84, 237, 0.05)',
              borderWidth: 1,
              borderColor: 'rgba(107, 84, 237, 0.2)',
            }
          ]}>
            <CustomText weight="800" style={[
              tw`text-2xl text-center leading-10`,
              { color: '#6B54ED' }
            ]}>
              {selectedTopic.title}
            </CustomText>
          </View>
        </View>

        {/* 재생 컨트롤 */}
        <View style={tw`flex-1 items-center justify-center px-6`}>
          {/* 재생 시간 표시 */}
          <View style={tw`mb-8`}>
            {/* 진행 바 */}
            <View style={tw`w-72 h-2 bg-gray-200 rounded-full mb-2`}>
              <View 
                style={[
                  tw`h-full bg-primary rounded-full`,
                  { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }
                ]} 
              />
            </View>
            <View style={tw`flex-row justify-between items-center`}>
              <CustomText weight="500" style={tw`text-sm text-gray-600`}>
                {formatTime(currentTime)}
              </CustomText>
              <CustomText weight="500" style={tw`text-sm text-gray-600`}>
                {formatTime(duration)}
              </CustomText>
            </View>
          </View>

          {/* 재생 버튼들 */}
          <View style={tw`flex-row items-center justify-center mb-8`}>
            {/* 재생/일시정지 버튼 */}
            <TouchableOpacity
              style={[
                tw`w-16 h-16 rounded-full items-center justify-center mr-4`,
                { backgroundColor: '#6B54ED' }
              ]}
              onPress={togglePlayback}
              activeOpacity={0.8}
            >
              <Icon 
                name={isPlaying ? 'pause' : 'play'} 
                size={24} 
                color="white" 
                style={isPlaying ? {} : { marginLeft: 2 }}
              />
            </TouchableOpacity>

            {/* 정지 버튼 */}
            <TouchableOpacity
              style={[
                tw`w-12 h-12 rounded-full items-center justify-center`,
                { backgroundColor: '#E5E7EB' }
              ]}
              onPress={stopPlayback}
              activeOpacity={0.8}
            >
              <Icon name="square" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

        </View>

        {/* 하단 버튼들 */}
        <View style={tw`px-6 pb-8`}>
          {/* 다시 녹음하기 버튼 */}
          <TouchableOpacity
            style={[
              tw`rounded-full py-3 px-8 items-center justify-center mb-3`,
              {
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: '#D1D5DB',
              }
            ]}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.8}
          >
            <CustomText weight="500" style={tw`text-base text-gray-600`}>
              다시 녹음하기
            </CustomText>
          </TouchableOpacity>

          {/* 다음 버튼 */}
          <TouchableOpacity
            style={[
              tw`rounded-full py-4 px-8 items-center justify-center`,
              { backgroundColor: '#6B54ED' }
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <CustomText weight="600" style={tw`text-base text-white`}>
              다음
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ReviewRecording;