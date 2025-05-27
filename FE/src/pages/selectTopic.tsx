// src/pages/selectTopic.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopicCard from '../components/topicCard';
import { INTEREST_TOPICS, Topic } from '../constants/topics';

// tailwind 설정 적용
const tw = create(tailwindConfig);

interface SelectTopicProps {
  navigation?: any;
  route?: {
    params?: {
      selectedInterest?: string;
    }
  }
}

const SelectTopic: React.FC<SelectTopicProps> = ({ navigation, route }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [currentTopics, setCurrentTopics] = useState<Topic[]>([]);
  
  // 전달받은 관심사 또는 기본값
  const selectedInterest = route?.params?.selectedInterest || '정치';

  useEffect(() => {
    // 선택된 관심사에 해당하는 토픽들을 설정
    const topics = INTEREST_TOPICS[selectedInterest] || INTEREST_TOPICS['정치'];
    setCurrentTopics(topics);
  }, [selectedInterest]);
  
  const selectTopic = (topicId: string) => {
    setSelectedTopic(topicId === selectedTopic ? '' : topicId);
  };

  const handleNext = () => {
    const selected = currentTopics.find(topic => topic.id === selectedTopic);
    console.log('선택된 토픽:', selected);
    // 선택된 토픽과 관심사를 RecordTopic 페이지로 전달
    navigation.navigate('RecordTopic', { 
      selectedTopic: selected, 
      selectedInterest 
    });
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
        <ScrollView 
          style={tw`flex-1`}
          contentContainerStyle={tw`px-6 pt-8 pb-32`}
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 */}
          <View style={tw`mb-8`}>
            <CustomText 
              weight="700" 
              style={tw`text-lg text-gray-900 mb-2 text-center`}
            >
              발화할 주제를 선택해 주세요.
            </CustomText>
            <CustomText 
              weight="400" 
              style={tw`text-sm text-gray-600 mb-6 text-center`}
            >
              {selectedInterest} 관련 토픽
            </CustomText>
          </View>

          {/* 토픽 카드들 */}
          <View style={tw`mb-8`}>
            {currentTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                title={topic.title}
                isSelected={selectedTopic === topic.id}
                onPress={() => selectTopic(topic.id)}
              />
            ))}
          </View>
        </ScrollView>
        
        {/* 하단 고정 버튼 */}
        <View style={tw`absolute bottom-0 left-0 right-0 p-6 bg-white`}>
          <TouchableOpacity
            style={[
              tw`rounded-full py-4 px-8 items-center justify-center`,
              {
                backgroundColor: selectedTopic.length > 0 ? '#6B54ED' : '#E5E7EB',
              }
            ]}
            onPress={handleNext}
            disabled={selectedTopic.length === 0}
            activeOpacity={0.8}
          >
            <CustomText 
              weight="600" 
              style={[
                tw`text-base`,
                { 
                  color: selectedTopic.length > 0 ? 'white' : '#9CA3AF' 
                }
              ]}
            >
              확인
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SelectTopic;