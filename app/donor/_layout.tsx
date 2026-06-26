import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DonorLayout() {
  const insets = useSafeAreaInsets();        // ✅ Safe area values
  const scheme = useColorScheme();           // ✅ Detect dark/light mode
  const backgroundColor = scheme === 'dark' ? '#000' : '#fff'; // ✅ Global background

  return (
    <View style={{ flex: 1, backgroundColor }}>
      {/* ✅ Hidden Header Spacer so content doesn't overlap with status bar */}
      <View style={{ height: insets.top, backgroundColor }} />

      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,               // ✅ Keep headers hidden
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#eee',
          tabBarStyle: {
            backgroundColor: '#e53935',
            paddingBottom: Math.max(insets.bottom, 6), // ✅ respects device safe area
            height: 60 + insets.bottom,
          },
          lazy: true,
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;
            switch (route.name) {
              case 'home':
                iconName = 'home';
                break;
              case 'request':
                iconName = 'medkit';
                break;
              case 'camps':
                iconName = 'map';
                break;
              case 'settings':
                iconName = 'settings';
                break;
              default:
                iconName = 'ellipse-outline';
            }
            return <Ionicons name={iconName} color={color} size={size} />;
          },
        })}
      >
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="request" options={{ title: 'Nearby Request' }} />
        <Tabs.Screen name="camps" options={{ title: 'Nearby Camps' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />

        {/* Hidden Screens */}
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="privacy" options={{ href: null }} />
        <Tabs.Screen name="availabilty" options={{ href: null }} />
        <Tabs.Screen name="donationhistory" options={{ href: null }} />
        <Tabs.Screen name="confirm" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
