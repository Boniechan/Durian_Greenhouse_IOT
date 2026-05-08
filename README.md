# 🌱 Durian Greenhouse IoT App

[![React Native](https://img.shields.io/badge/React%20Native-0.73+-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-FFA500?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

A modern React Native mobile application for monitoring and controlling greenhouse environmental conditions, specifically designed for durian cultivation. Track real-time sensor data, manage environmental controls, and receive intelligent alerts—all from your mobile device.

## ✨ Features

- 📊 **Real-time Sensor Monitoring** — Track temperature, humidity, soil moisture, and light levels
- 🎯 **Smart Dashboard** — Visual representation of current greenhouse conditions at a glance
- 📈 **Historical Analytics** — Weekly records and trend analysis
- ⚙️ **Smart Settings** — Configure greenhouse parameters and alert thresholds
- 🔔 **Push Notifications** — Instant alerts for critical environmental events
- 📱 **Cross-platform** — Native iOS and Android support via Expo

## 🚀 Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v7
- **Backend**: Firebase (Realtime Database, Firestore, Storage, Cloud Messaging)
- **State Management**: React Hooks
- **UI**: NativeWind (Tailwind CSS for React Native)
- **Charts**: react-native-chart-kit

## 📋 Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn**
- **Expo CLI** — `npm install -g @expo/cli`
- **Expo Go** app on your mobile device (for testing)

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/durian-greenhouse.git
cd durian-greenhouse
npm install
```

### 2. Configure Firebase

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Get these values from the [Firebase Console](https://console.firebase.google.com/).

### 3. Start Developing

```bash
npm start                    # Start Expo dev server
npm run android            # Run on Android
npm run ios                # Run on iOS (macOS only)
npm run web                # Run on web
```

Scan the QR code with Expo Go to test on your device.

## 📁 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── SensorCard.tsx
│   ├── SimpleLineChart.tsx
│   └── StatusIndicator.tsx
├── hooks/                   # Custom React hooks
│   └── useGreenhouseData.ts
├── navigation/              # Navigation setup
│   ├── AppNavigator.tsx
│   └── AppStack.tsx
├── screens/                 # App screens
│   ├── Dashboard.tsx
│   ├── SensorAnalytics.tsx
│   ├── WeeklyRecords.tsx
│   ├── Settings.tsx
│   └── FanRecords.tsx, MistingRecords.tsx, etc.
├── services/                # External services & API
│   ├── firebaseConfig.ts
│   ├── analyticsService.ts
│   ├── notificationService.ts
│   └── fanService.ts, mistingService.ts, waterPumpService.ts
└── types/                   # TypeScript definitions
    ├── mistingFan.ts
    ├── waterPump.ts
    └── navigation.ts

App.tsx                       # Root component
app.json                      # Expo configuration
tsconfig.json                 # TypeScript config
```

## 🔧 Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable: Realtime Database, Firestore, Storage, Cloud Messaging
3. Add iOS & Android app configurations
4. Update `.env` with your Firebase credentials
5. Set up Firestore rules for data access control

## 📊 Core Data Models

```typescript
interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightLevel: number;
  timestamp: string;
}

interface GreenhouseConfig {
  temperatureRange: { min: number; max: number };
  humidityRange: { min: number; max: number };
  soilMoistureThreshold: number;
  alertsEnabled: boolean;
}
```

## 🔔 Alert System

Automatic notifications for:
- 🌡️ Temperature threshold violations
- 💧 Humidity warnings
- 🌍 Soil moisture alerts
- 📡 Connectivity issues

## 🛠️ Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Build and run on Android
npm run ios        # Build and run on iOS (macOS only)
npm run web        # Run web version
npm run build      # Production build
npm run lint       # TypeScript type checking
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Metro bundler errors | Run `expo start -c` to clear cache |
| Firebase connection fails | Verify `.env` variables and network connectivity |
| Notifications not working | Check Firebase Cloud Messaging setup and device permissions |
| Android build issues | Clear Android cache: `cd android && ./gradlew clean` |

## 📦 Production Build

### Using EAS Build (Recommended)

```bash
npm install -g @expo/eas-cli
eas build:configure
eas build --platform all
```

### Local Build

```bash
expo build:android
expo build:ios
```

## 🙋 Support & Questions

- 🐛 Found a bug? [Create an issue](../../issues)
- 💡 Have a suggestion? [Start a discussion](../../discussions)

---

<div align="center">

**[⭐ Star this repo if it helped you!](../../)**

Made with 🌱 for durian growers everywhere

</div>
