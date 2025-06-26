// src/pages/recordTopic.tsx - 깔끔하게 다시 작성
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, Easing, Alert, PermissionsAndroid, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  // 상태 관리
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioPath, setAudioPath] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  
  // 애니메이션 refs
  const scaleValue = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  
  // AudioRecorderPlayer 인스턴스
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

  // Props에서 데이터 추출
  const selectedTopic = route?.params?.selectedTopic || {
    id: 'default',
    title: '기본 발화 주제입니다.'
  };
  const selectedInterest = route?.params?.selectedInterest || '기타';

  // 컴포넌트 마운트
  useEffect(() => {
    console.log('RecordTopic 마운트 - 토픽:', selectedTopic.title);
    requestPermissions();
    
    return () => {
      // 정리
      if (isPlaying) {
        audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();
      }
      if (isRecording) {
        audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
      }
    };
  }, []);

  // 권한 요청
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: '마이크 권한 필요',
            message: '음성 녹음을 위해 마이크 권한이 필요합니다.',
            buttonPositive: '허용',
          }
        );
        return granted === 'granted';
      } catch (err) {
        console.error('권한 요청 실패:', err);
        return false;
      }
    }
    return true;
  };

  // 카운트다운 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (!isRecording && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && !isRecording) {
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

  // 애니메이션 효과
  useEffect(() => {
    if (!isRecording) return;

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

    return () => {
      scaleAnimation.stop();
      pulseAnimation.stop();
    };
  }, [isRecording]);

  // 녹음 시작
  const startRecording = async () => {
    try {
      console.log('녹음 시작');
      
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('권한 필요', '마이크 권한이 필요합니다.');
        return;
      }

      const timestamp = new Date().getTime();
      const fileName = `recording_${timestamp}.m4a`;
      const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
      
      const audioSet = {
        AudioEncoderAndroid: 3, // AAC
        AudioSourceAndroid: 7,  // MIC
        OutputFormatAndroid: 2, // MPEG_4
        AudioSampleRateAndroid: 22050,
        AudioEncodingBitRateAndroid: 96000,
        AudioChannelsAndroid: 1,

        AVEncoderAudioQualityKeyIOS: 'high',
        AVNumberOfChannelsKeyIOS: 1,
        AVFormatIDKeyIOS: 'aac',
        AVSampleRateKeyIOS: 44100,
      };

      const result = await audioRecorderPlayer.startRecorder(path, audioSet);
      console.log('녹음 시작됨:', result);
      
      setAudioPath(result || path);
      setIsRecording(true);
      setRecordingTime(0);

    } catch (error) {
      console.error('녹음 시작 실패:', error);
      Alert.alert('녹음 오류', '녹음을 시작할 수 없습니다.');
    }
  };

  // 녹음 중지
  const stopRecording = async () => {
    try {
      console.log('녹음 중지');
      setIsRecording(false);

      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      
      const finalPath = result || audioPath;
      setAudioPath(finalPath);
      
      console.log('녹음 완료:', finalPath);

      // Analysis 페이지로 이동 (업로드는 Analysis에서 처리)
      navigation.navigate('Analysis', {
        selectedTopic,
        selectedInterest,
        recordingTime,
        audioPath: finalPath
      });

    } catch (error) {
      console.error('녹음 중지 실패:', error);
      Alert.alert('오류', '녹음 중지 중 오류가 발생했습니다.');
    }
  };

  // 파일 업로드 (Analysis 페이지에서 결과 처리하도록 수정)
  const uploadAudioFile = async (filePath: string) => {
    try {
      console.log('파일 업로드 시작:', filePath);

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
      console.log('업로드 성공:', result);
      return result;

    } catch (error) {
      console.error('업로드 실패:', error);
      throw error;
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
          onHomePress={() => navigation.navigate('Home')}
          onBackPress={() => navigation.goBack()}
        />
      </SafeAreaView>
      
      <View style={tw`flex-1 bg-white`}>
        {/* 주제 표시 */}
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

        {/* 중앙 컨텐츠 */}
        <View style={tw`flex-1 items-center justify-center px-6`}>
          {!isRecording ? (
            <>
              <TouchableOpacity
                style={[
                  tw`rounded-full px-4 py-2 mb-12`,
                  {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }
                ]}
                onPress={() => navigation?.goBack()}
                activeOpacity={0.7}
              >
                <CustomText weight="500" style={tw`text-gray-600 text-sm`}>
                  주제 바꾸기
                </CustomText>
              </TouchableOpacity>

              <View style={tw`w-64 h-2 bg-gray-200 rounded-full mb-4`}>
                <View 
                  style={[
                    tw`h-full bg-primary rounded-full`,
                    { width: `${((60 - countdown) / 60) * 100}%` }
                  ]} 
                />
              </View>

              <CustomText weight="500" style={tw`text-primary text-sm`}>
                {countdown}초 뒤 시작합니다.
              </CustomText>
            </>
          ) : (
            <>
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
                <CustomText weight="600" style={tw`text-white text-sm`}>
                  녹음 중...
                </CustomText>
              </View>

              <Animated.View style={{ transform: [{ scale: pulseValue }] }}>
                <View style={[
                  tw`w-32 h-32 rounded-full items-center justify-center`,
                  { backgroundColor: 'rgba(107, 84, 237, 0.1)' }
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

              <CustomText weight="500" style={tw`text-primary text-lg mt-6`}>
                {formatTime(recordingTime)}
              </CustomText>
            </>
          )}
        </View>

        {/* 하단 버튼들 */}
        <View style={tw`px-6 pb-8`}>
          {/* 메인 녹음 버튼 */}
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
            disabled={isPlaying}
          >
            <CustomText 
              weight="600" 
              style={[
                tw`text-base`,
                { color: isRecording ? 'white' : '#6B54ED' }
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