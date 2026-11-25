import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from '../../lib/supabase';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Button, Menu, Provider as PaperProvider } from 'react-native-paper';
import { ThemedText, ThemedView } from '../../components/Themed';
import { db } from '../../lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { width } = Dimensions.get('window');
const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function NearbyDonorsScreen() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [donors, setDonors] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'donor'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log('No donor users found in the database.');
        }

        const donorList = querySnapshot.docs.map((doc) => {
          console.log('Fetched donor:', doc.data());
          return doc.data();
        });

        setDonors(donorList);
      } catch (error) {
        console.error('Error fetching donors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  const filteredDonors = donors.filter((donor) => {
    const matchGroup = selectedGroup === 'All' || donor.bloodGroup === selectedGroup;
    const matchSearch =
      donor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.city?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGroup && matchSearch;
  });

  return (
    <PaperProvider>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}>
          <ThemedText style={styles.header}>Nearby Donors</ThemedText>

          {/* 🔍 Search + Filter Toggle */}
          <ThemedView style={styles.searchRow}>
            <TextInput
              placeholder="Search by name or city"
              placeholderTextColor={isDark ? '#aaa' : '#666'}
              style={[
                styles.searchInput,
                {
                  backgroundColor: isDark ? '#333' : '#f2f2f2',
                  color: isDark ? '#fff' : '#000',
                },
              ]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={() => setShowFilter(!showFilter)}>
              <Ionicons name="filter" size={24} color="#e53935" style={styles.filterIcon} />
            </TouchableOpacity>
          </ThemedView>

          {/* 🔽 Blood Group Dropdown */}
          {showFilter && (
            <ThemedView style={{ marginBottom: 10 }}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisible(true)}
                    textColor={isDark ? '#fff' : '#000'}
                    buttonColor={isDark ? '#444' : '#f2f2f2'}
                  >
                    {selectedGroup}
                  </Button>
                }
                contentStyle={{ backgroundColor: isDark ? '#333' : '#fff' }}
              >
                {bloodGroups.map((group) => (
                  <Menu.Item
                    key={group}
                    onPress={() => {
                      setSelectedGroup(group);
                      setMenuVisible(false);
                    }}
                    title={group}
                    titleStyle={{ color: isDark ? '#fff' : '#000' }}
                  />
                ))}
              </Menu>
            </ThemedView>
          )}

          {/* 🔄 Loading / No Donors / List */}
          {loading ? (
            <ActivityIndicator size="large" color="#e53935" style={{ marginTop: 40 }} />
          ) : filteredDonors.length === 0 ? (
            <ThemedText style={styles.noDonors}>No donors found.</ThemedText>
          ) : (
            filteredDonors.map((donor, index) => (
              <ThemedView
                key={index}
                style={[
                  styles.card,
                  { backgroundColor: isDark ? '#2a2a2a' : '#fff0f0' },
                ]}
              >
                <ThemedText style={styles.name}>{donor.name}</ThemedText>
                <ThemedText>Blood Group: {donor.bloodGroup}</ThemedText>
                <ThemedText>Phone: {donor.number}</ThemedText>
                <ThemedText>City: {donor.location}</ThemedText>
                <TouchableOpacity style={styles.contactBtn}>
                  <ThemedText style={styles.btnText}>Contact</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            ))
          )}
        </ScrollView>
      </ThemedView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    color: '#e53935',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 14,
  },
  filterIcon: {
    marginLeft: 12,
  },
  card: {
    marginTop: 14,
    borderRadius: 10,
    padding: 16,
    elevation: 2,
    shadowColor: '#e53935',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactBtn: {
    marginTop: 10,
    backgroundColor: '#e53935',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  noDonors: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 15,
    color: '#888',
  },
});
