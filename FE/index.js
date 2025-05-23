/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
// index.js 파일 상단에 추가
import { LogBox } from 'react-native';

// 모든 로그 경고 비활성화
LogBox.ignoreAllLogs();

// 특정 경고만 비활성화하려면:
// LogBox.ignoreLogs(['Warning: ...']);
AppRegistry.registerComponent(appName, () => App);
