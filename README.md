# Durian Greenhouse IoT App

A React Native mobile application for monitoring and managing greenhouse conditions, specifically designed for durian cultivation. This app provides real-time sensor data monitoring, environmental controls, and data logging capabilities.

## 📱 Features

- **Real-time Sensor Monitoring**: Track temperature, humidity, soil moisture, and other environmental parameters
- **Dashboard Overview**: Visual representation of current greenhouse conditions
- **Weekly Records**: Historical data tracking and analysis
- **Settings Management**: Configure app preferences and greenhouse parameters
- **Push Notifications**: Alerts for critical environmental conditions
- **Cross-platform**: Available for both iOS and Android devices

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v7
- **Backend**: Firebase (Realtime Database, Firestore, Storage)
- **State Management**: React Hooks
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Notifications**: Expo Notifications

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device (for testing)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd durian-greenhouse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add your Firebase configuration:
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

4. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Realtime Database, Firestore, and Storage
   - Add your iOS/Android app configurations
   - Update the environment variables with your Firebase config

## 🏃‍♂️ Running the App

### Development Mode

```bash
# Start the Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

### Testing on Device

1. Install Expo Go on your mobile device
2. Scan the QR code displayed in the terminal or browser
3. The app will load on your device

## 📁 Project Structure

```
durian-greenhouse/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── SensorCard.tsx
│   │   └── StatusIndicator.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useGreenhouseData.ts
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   └── AppStack.tsx
│   ├── screens/            # App screens
│   │   ├── Dashboard.tsx
│   │   ├── Settings.tsx
│   │   ├── WeeklyRecords.tsx
│   │   └── WeeklyUpdate.tsx
│   ├── services/           # External services
│   │   ├── firebaseConfig.ts
│   │   └── notificationService.ts
│   └── types/              # TypeScript type definitions
│       └── navigation.ts
├── assets/                 # Static assets (images, icons)
├── App.tsx                 # Root component
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## 🔧 Configuration

### Firebase Setup

1. **Realtime Database**: Configure rules for sensor data storage
2. **Firestore**: Set up collections for user preferences and historical data
3. **Storage**: Configure for image uploads (greenhouse photos)
4. **Notifications**: Set up Firebase Cloud Messaging for push notifications

### Permissions

The app requires the following permissions:
- **Camera**: For taking greenhouse photos
- **Photo Library**: For saving and accessing images
- **Notifications**: For environmental alerts

## 📊 Data Structure

### Sensor Data Format
```typescript
interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightLevel: number;
  timestamp: string;
}
```

### Greenhouse Configuration
```typescript
interface GreenhouseConfig {
  temperatureRange: { min: number; max: number };
  humidityRange: { min: number; max: number };
  soilMoistureThreshold: number;
  alertsEnabled: boolean;
}
```

## 🔔 Notifications

The app supports push notifications for:
- Temperature alerts (too high/low)
- Humidity warnings
- Soil moisture alerts
- System connectivity issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **Firebase connection errors**: Check environment variables and network connectivity
3. **Notification not working**: Verify Firebase Cloud Messaging setup and device permissions

### Debug Mode

Enable debug mode by setting `__DEV__` flag in your environment to see detailed Firebase configuration logs.

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team

## 🚀 Deployment

### Building for Production

```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

### Expo Application Services (EAS)

For modern builds, use EAS Build:
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for production
eas build --platform all
```

---

**Happy Greenhouse Monitoring! 🌱**