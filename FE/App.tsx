// App.tsx - 네비게이션 라이브러리 없이 간단한 페이지 전환
import React, { useState } from 'react';
import Home from './src/pages/home';
import Interests from './src/pages/interests';
import SelectTopic from './src/pages/selectTopic';
import RecordTopic from './src/pages/recordTopic';

type CurrentPage = 'Home' | 'Interests' | 'SelectTopic' | 'RecordTopic';

interface NavigationState {
  selectedInterest?: string;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('Home');
  const [navigationState, setNavigationState] = useState<NavigationState>({});

  // 네비게이션 객체 모킹
  const mockNavigation = {
    navigate: (pageName: CurrentPage, params?: any) => {
      setCurrentPage(pageName);
      if (params) {
        setNavigationState(prev => ({ ...prev, ...params }));
      }
    },
    goBack: () => {
      setCurrentPage('Home');
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'Home':
        return <Home navigation={mockNavigation} />;
      case 'Interests':
        return <Interests navigation={mockNavigation} />;
      case 'SelectTopic':
        return (
          <SelectTopic 
            navigation={mockNavigation} 
            route={{ params: navigationState }}
          />
        );
      case 'RecordTopic':
        return (
          <RecordTopic 
            navigation={mockNavigation} 
            route={{ params: navigationState }}
          />
        );
      default:
        return <Home navigation={mockNavigation} />;
    }
  };

  return renderCurrentPage();
};

export default App;