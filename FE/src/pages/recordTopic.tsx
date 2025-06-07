// src/pages/recordTopic.tsx - 실제 오디오 녹음 및 업로드
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
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxRecordingTime] = useState(180);
  const [isUploading, setIsUploading] = useState(false);
  const [audioPath, setAudioPath] = useState<string>('');
  
  // 애니메이션 값들
  const scaleValue = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  
  // AudioRecorderPlayer 인스턴스
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

  // 안전한 Props 추출
  const selectedTopic = route?.params?.selectedTopic || {
    id: 'default',
    title: '기본 발화 주제입니다.'
  };
  const selectedInterest = route?.params?.selectedInterest || '기타';

  // 개선된 권한 요청 (저장소 권한 없이도 작동하도록)
  const requestPermissions = async () => {
    try {
      console.log('=== 권한 확인 시작 ===');
      
      if (Platform.OS === 'android') {
        // 현재 권한 상태 먼저 확인
        const recordAudioStatus = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        
        console.log('현재 녹음 권한 상태:', recordAudioStatus);
        
        // 녹음 권한만 확인 (저장소 권한은 필수가 아님)
        if (!recordAudioStatus) {
          console.log('녹음 권한 요청 중...');
          
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: '마이크 권한 필요',
              message: '음성 녹음을 위해 마이크 권한이 필요합니다.',
              buttonNeutral: '나중에',
              buttonNegative: '거부',
              buttonPositive: '허용',
            }
          );
          
          console.log('녹음 권한 요청 결과:', granted);
          
          if (granted !== 'granted') {
            Alert.alert(
              '녹음 권한 필요', 
              '앱에서 음성을 녹음하려면 마이크 권한이 필요합니다.\n\n설정 > 앱 > Selo > 권한에서 마이크 권한을 허용해주세요.'
            );
            return false;
          }
        }
        
        console.log('✅ 녹음 권한 확인 완료');
        return true;
      }
      
      // iOS의 경우
      return true;
      
    } catch (err) {
      console.error('권한 요청 중 오류:', err);
      Alert.alert('권한 오류', '권한 요청 중 오류가 발생했습니다.');
      return false;
    }
  };

  useEffect(() => {
    console.log('RecordTopic 컴포넌트 마운트됨');
    console.log('받은 토픽 ID:', selectedTopic?.id);
    console.log('받은 토픽 제목:', selectedTopic?.title);
    console.log('받은 관심사:', selectedInterest);
    
    // 권한 요청
    requestPermissions();
  }, []);

  // 카운트다운 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (!isRecording && countdown > 0 && !isUploading) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && !isRecording && !isUploading) {
      startRecording();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [countdown, isRecording, isUploading]);

  // 녹음 시간 카운터
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev + 1 >= maxRecordingTime) {
            stopRecording();
            return maxRecordingTime;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording, maxRecordingTime]);

  // 애니메이션 효과
  useEffect(() => {
    let scaleAnimation: Animated.CompositeAnimation;
    let pulseAnimation: Animated.CompositeAnimation;

    if (isRecording) {
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

      pulseAnimation = Animated.loop(
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
    }

    return () => {
      if (scaleAnimation) {
        scaleAnimation.stop();
      }
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
  }, [isRecording, scaleValue, pulseValue]);

  // 실제 오디오 파일 업로드 함수 (Python requests와 동일한 방식)
  const uploadAudioFile = async (filePath: string) => {
    try {
      console.log('=== 실제 오디오 파일 업로드 시작 ===');
      console.log('파일 경로:', filePath);

      // 1. 파일 존재 여부 확인
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        throw new Error(`파일이 존재하지 않습니다: ${filePath}`);
      }

      // 2. 파일 정보 확인
      const fileInfo = await RNFS.stat(filePath);
      console.log('파일 크기:', fileInfo.size, 'bytes');
      
      if (fileInfo.size === 0) {
        throw new Error('녹음 파일이 비어있습니다.');
      }

      // 3. FormData 생성 - Python requests와 정확히 동일한 형식
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'audio/wav',
        name: 'audio.wav'
      } as any);

      console.log('FormData 생성 완료');

      // 4. fetch로 업로드 (Python requests.post와 동일)
      const response = await fetch('https://api.selo-ai.my/infer', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('응답 상태:', response.status);
      console.log('응답 헤더:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('서버 오류 응답:', errorText);
        throw new Error(`서버 오류: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('=== 업로드 성공! 서버 응답 ===');
      console.log(JSON.stringify(result, null, 2));
      
      return result;

    } catch (error) {
      console.error('=== 파일 업로드 실패 ===');
      console.error('오류:', error);
      throw error;
    }
  };

  // 녹음 시작 (올바른 Android 오디오 설정 사용)
  const startRecording = async () => {
    try {
      console.log('=== 녹음 시작 준비 ===');
      
      // 권한 재확인 (녹음 권한만)
      console.log('녹음 권한 확인 중...');
      const hasPermission = await requestPermissions();
      
      if (!hasPermission) {
        console.log('❌ 녹음 권한이 없어서 중단');
        return;
      }
      
      console.log('✅ 권한 확인 완료');

      // 녹음 파일 경로 설정 (앱 내부 저장소만 사용)
      const timestamp = new Date().getTime();
      const fileName = `recording_${timestamp}.wav`;
      
      // 캐시 디렉토리 사용 (권한 불필요)
      const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
      
      console.log('📁 녹음 파일 경로:', path);

      // 디렉토리 존재 확인
      const dirExists = await RNFS.exists(RNFS.CachesDirectoryPath);
      console.log('📂 캐시 디렉토리 존재:', dirExists);

      // 올바른 Android 오디오 설정 (숫자 상수 사용)
      const audioSet = {
        AudioEncoderAndroid: 3, // AAC = 3
        AudioSourceAndroid: 1,  // MIC = 1  
        OutputFormatAndroid: 2, // MPEG_4 = 2
        AVEncoderAudioQualityKeyIOS: 'high',
        AVNumberOfChannelsKeyIOS: 1,
        AVFormatIDKeyIOS: 'wav',
      };

      console.log('🎙️ 녹음 시작 시도...');
      console.log('오디오 설정:', JSON.stringify(audioSet, null, 2));

      // 녹음 시작
      const result = await audioRecorderPlayer.startRecorder(path, audioSet);
      
      console.log('🎉 녹음 시작 성공!');
      console.log('녹음 결과 경로:', result);
      
      setAudioPath(result || path); // result가 실제 경로를 반환할 수 있음
      setIsRecording(true);
      setRecordingTime(0);

      // 녹음 진행 상황 리스너 (5초마다 로그)
      audioRecorderPlayer.addRecordBackListener((e) => {
        const seconds = Math.floor(e.currentPosition / 1000);
        if (seconds % 5 === 0 && seconds > 0) {
          console.log(`🎙️ 녹음 진행: ${seconds}초`);
        }
      });

    } catch (error) {
      console.error('❌ 녹음 시작 실패:');
      console.error('- 오류 타입:', error.constructor?.name || 'Unknown');
      console.error('- 오류 메시지:', error.message || error.toString());
      console.error('- 전체 오류:', error);
      
      Alert.alert(
        '녹음 오류', 
        `녹음을 시작할 수 없습니다.\n\n오류: ${error.message || 'Unknown error'}\n\n해결 방법:\n1. 다른 앱에서 마이크 사용 중인지 확인\n2. 앱을 완전히 종료 후 재시작\n3. 기기 재부팅`
      );
    }
  };

  // 녹음 중지 및 업로드
  const stopRecording = async () => {
    try {
      console.log('녹음 중지 중...');
      setIsRecording(false);
      setIsUploading(true);

      // 녹음 중지
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      
      console.log('녹음 완료. 파일 경로:', result);
      console.log('저장된 오디오 경로:', audioPath);

      // 실제 파일 업로드 시도
      try {
        const uploadResult = await uploadAudioFile(result || audioPath);
        
        console.log('=== 최종 서버 응답 ===');
        console.log('업로드 성공!');
        console.log('결과:', uploadResult);
        
        // 성공 시 분석 페이지로 이동
        navigation.navigate('Analysis', {
          selectedTopic,
          selectedInterest,
          recordingTime,
          analysisResult: uploadResult,
          uploadMethod: 'success'
        });

      } catch (uploadError) {
        console.error('업로드 실패:', uploadError);
        setIsUploading(false);
        
        Alert.alert(
          '업로드 실패',
          `파일 업로드에 실패했습니다.\n오류: ${uploadError.message}`,
          [
            {
              text: '다시 시도',
              onPress: () => {
                if (audioPath) {
                  console.log('다시 업로드 시도:', audioPath);
                  uploadAudioFile(audioPath);
                }
              }
            },
            {
              text: '취소',
              onPress: () => {
                setIsRecording(false);
                setRecordingTime(0);
                setCountdown(60);
              }
            }
          ]
        );
      }

    } catch (error) {
      console.error('녹음 중지 실패:', error);
      setIsUploading(false);
      Alert.alert('오류', '녹음 중지 중 오류가 발생했습니다.');
    }
  };

  const changeTopicHandler = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      
      <View style={tw`flex-1 bg-white`}>
        <View style={tw`px-6 pt-8 pb-4`}>
          <CustomText 
            weight="700" 
            style={tw`text-lg text-gray-900 text-center mb-2`}
          >
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
            <CustomText 
              weight="800" 
              style={[
                tw`text-2xl text-center leading-10`,
                { color: '#6B54ED' }
              ]}
            >
              {selectedTopic.title}
            </CustomText>
          </View>
        </View>

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

              <View style={tw`w-64 h-2 bg-gray-200 rounded-full mb-4`}>
                <View 
                  style={[
                    tw`h-full bg-primary rounded-full`,
                    { width: `${((60 - countdown) / 60) * 100}%` }
                  ]} 
                />
              </View>

              <CustomText 
                weight="500" 
                style={tw`text-primary text-sm`}
              >
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
                <CustomText 
                  weight="600" 
                  style={tw`text-white text-sm`}
                >
                  녹음 중...
                </CustomText>
              </View>

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

              <CustomText 
                weight="500" 
                style={tw`text-primary text-lg mt-6`}
              >
                {formatTime(recordingTime)}
              </CustomText>
            </>
          )}
        </View>

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
            disabled={isUploading}
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
              {isUploading ? '업로드 중...' : (isRecording ? '발화 끝내기' : '바로 시작하기')}
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RecordTopic;