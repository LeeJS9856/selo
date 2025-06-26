// App.tsx - ReviewRecording 페이지 추가
import React, { useState } from 'react';
import Home from './src/pages/home';
import Interests from './src/pages/interests';
import SelectTopic from './src/pages/selectTopic';
import RecordTopic from './src/pages/recordTopic';
import ReviewRecording from './src/pages/reviewRecording';
import Analysis from './src/pages/analysis';
import Result from './src/pages/result';

type CurrentPage = 'Home' | 'Interests' | 'SelectTopic' | 'RecordTopic' | 'ReviewRecording' | 'Analysis' | 'Result';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('Home');
  const [navigationParams, setNavigationParams] = useState<any>({});

  // 네비게이션 객체 모킹
  const mockNavigation = {
    navigate: (pageName: CurrentPage, params?: any) => {
      setCurrentPage(pageName);
      if (params) {
        setNavigationParams(params);
      }
    },
    goBack: () => {
      // 간단한 뒤로가기 로직
      switch (currentPage) {
        case 'Interests':
          setCurrentPage('Home');
          break;
        case 'SelectTopic':
          setCurrentPage('Interests');
          break;
        case 'RecordTopic':
          setCurrentPage('SelectTopic');
          break;
        case 'ReviewRecording':
          setCurrentPage('RecordTopic');
          break;
        case 'Analysis':
          setCurrentPage('ReviewRecording');
          break;
        case 'Result':
          setCurrentPage('Home');
          break;
        default:
          setCurrentPage('Home');
      }
    }
  };

  const renderCurrentPage = () => {
    const route = { params: navigationParams };
    
    switch (currentPage) {
      case 'Home':
        return <Home navigation={mockNavigation} />;
      case 'Interests':
        return <Interests navigation={mockNavigation} />;
      case 'SelectTopic':
        return <SelectTopic navigation={mockNavigation} route={route} />;
      case 'RecordTopic':
        return <RecordTopic navigation={mockNavigation} route={route} />;
      case 'ReviewRecording':
        return <ReviewRecording navigation={mockNavigation} route={route} />;
      case 'Analysis':
        return <Analysis navigation={mockNavigation} route={route} />;
      case 'Result':
        return <Result navigation={mockNavigation} route={route} />;
      default:
        return <ReviewRecording navigation={mockNavigation} />;
    }
  };

  return renderCurrentPage();
};

export default App;