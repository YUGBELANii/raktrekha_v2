import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname } from 'expo-router';
import { View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReceiverLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // ✅ Check if current route is the request page
  const isRequestPage = pathname.includes('/receiver/request');

  return (
    <>
      {/* ✅ Invisible Header (applies dark/light mode) */}
      {!isRequestPage && (
        <View
          style={{
            height: 40,
            backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          }}
        />
      )}

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: '#aaa',
          tabBarStyle: {
            height: 60 + insets.bottom,   // ✅ Extra safe area bottom padding
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            backgroundColor: '#e53935',
            borderTopWidth: 0,
          },
          tabBarLabelStyle: { fontSize: 12 },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="request"
          options={{
            title: 'Request',
            tabBarIcon: ({ color, size }) => <Ionicons name="medkit" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="nearbydonor"
          options={{
            title: 'Donors',
            tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
          }}
        />

        {/* Hidden Screens */}
        <Tabs.Screen name="advance-request" options={{ href: null }} />
        <Tabs.Screen name="match" options={{ href: null }} />
        <Tabs.Screen name="request-history" options={{ href: null }} />
        <Tabs.Screen name="privacy" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="loading" options={{ href: null }} />
      </Tabs>
    </>
  );
}
