// selectTopic.tsx - 네비게이션 파라미터 전달 수정
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { create } from 'twrnc';
import tailwindConfig from '../../tailwind.config.js';
import CustomText from '../utils/CustomText';
import Navbar from '../components/navbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopicCard from '../components/topicCard';
import { INTEREST_TOPICS, Topic } from '../constants/topics';

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
  
  const selectedInterest = route?.params?.selectedInterest || '정치';

  useEffect(() => {
    const topics = INTEREST_TOPICS[selectedInterest] || INTEREST_TOPICS['정치'];
    setCurrentTopics(topics);
  }, [selectedInterest]);
  
  const selectTopic = (topicId: string) => {
    setSelectedTopic(topicId === selectedTopic ? '' : topicId);
  };

  const handleNext = () => {
    const selected = currentTopics.find(topic => topic.id === selectedTopic);
    
    if (!selected) {
      console.error('선택된 토픽을 찾을 수 없습니다.');
      return;
    }

    console.log('선택된 토픽:', selected);
    console.log('선택된 관심사:', selectedInterest);
    
    // 안전한 네비게이션 파라미터 전달
    if (navigation) {
      try {
        navigation.navigate('RecordTopic', { 
          selectedTopic: {
            id: selected.id,
            title: selected.title
          }, 
          selectedInterest: selectedInterest
        });
      } catch (error) {
        console.error('네비게이션 오류:', error);
      }
    } else {
      console.error('Navigation prop이 없습니다.');
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
          onHomePress={() => {
            if (navigation) {
              navigation.navigate('Home');
            }
          }}
          onBackPress={() => {
            if (navigation) {
              navigation.goBack();
            }
          }}
        />
      </SafeAreaView>
      
      <View style={tw`flex-1 bg-white`}>
        <ScrollView 
          style={tw`flex-1`}
          contentContainerStyle={tw`px-6 pt-8 pb-32`}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`mb-8`}>
            <CustomText 
              weight="700" 
              style={tw`text-lg text-gray-900 mb-2 text-center`}
            >
              발화할 주제를 선택해 주세요.
            </CustomText>
          </View>

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
        
        <View style={tw`absolute bottom-0 left-0 right-0 p-6 bg-white`}>
          <TouchableOpacity
            style={[
              tw`rounded-full py-4 px-8 items-center justify-center`,
              {
                backgroundColor: selectedTopic.length > 0 ? '#8c0afa' : '#E5E7EB',
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