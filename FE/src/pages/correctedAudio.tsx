// src/pages/correctedAudio.tsx - 교정된 음성 비교 페이지
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

const tw = create(tailwindConfig);

interface CorrectedAudioProps {
  navigation?: any;
  route?: {
    params?: {
      selectedTopic?: {
        id: string;
        title: string;
      };
      selectedInterest?: string;
      recordingTime?: number;
      originalAudioPath?: string;
      analysisResult?: {
        topic: string;
        full_text: string;
        statistics: string;
        segments?: Array<{
          start: number;
          end: number;
          text: string;
        }>;
        audio_duration?: number;
        model?: string;
        corrected_audio_url?: string; // 새로 추가된 교정 음성 URL
        raw_response?: any;
      };
    }
  }
}

const CorrectedAudio: React.FC<CorrectedAudioProps> = ({ navigation, route }) => {
  // Props에서 데이터 추출
  const selectedTopic = route?.params?.selectedTopic;
  const selectedInterest = route?.params?.selectedInterest;
  const recordingTime = route?.params?.recordingTime || 0;
  const originalAudioPath = route?.params?.originalAudioPath;
  const analysisResult = route?.params?.analysisResult;
  const correctedAudioUrl = analysisResult?.corrected_audio_url;

  // 재생 상태 관리 - 교정된 오디오 중심으로 변경
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // AudioRecorderPlayer 인스턴스 - 교정된 오디오용만 사용
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

  useEffect(() => {
    console.log('CorrectedAudio 페이지 진입');
    console.log('원본 오디오:', originalAudioPath);
    console.log('교정된 오디오:', correctedAudioUrl);

    return () => {
      // 정리
      if (isPlaying) {
        audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();
      }
    };
  }, []);

  // 교정된 오디오 재생/일시정지
  const togglePlayback = async () => {
    if (!correctedAudioUrl) {
      Alert.alert('오류', '교정된 오디오 파일이 없습니다.');
      return;
    }

    try {
      if (isPlaying) {
        // 일시정지
        await audioRecorderPlayer.pausePlayer();
        setIsPlaying(false);
      } else {
        // 재생 시작
        await audioRecorderPlayer.startPlayer(correctedAudioUrl);
        
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
      console.error('교정된 오디오 재생 오류:', error);
      Alert.alert('재생 오류', '교정된 오디오 재생 중 오류가 발생했습니다.');
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

  // 결과 페이지로 이동
  const goToResult = async () => {
    await stopPlayback();
    
    navigation.navigate('Result', {
      selectedTopic,
      selectedInterest,
      recordingTime,
      analysisResult
    });
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
                AI가 조금 다듬어봤어요
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
              { color: '#8c0afa' }
            ]}>
              {selectedTopic?.title}
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
                { backgroundColor: '#8c0afa' }
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
          {/* 다음 버튼 */}
          <TouchableOpacity
            style={[
              tw`rounded-full py-4 px-8 items-center justify-center`,
              { backgroundColor: '#8c0afa' }
            ]}
            onPress={goToResult}
            activeOpacity={0.8}
          >
            <CustomText 
              weight="600" 
              style={tw`text-base text-white`}
            >
              다음
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CorrectedAudio;