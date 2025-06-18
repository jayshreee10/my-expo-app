import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Types for settings
interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  icon?: string;
}

const SettingsScreen: React.FC = () => {
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [faceId, setFaceId] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  // Handle different setting actions
  const handleAccountPress = () => {
    Alert.alert('Account', 'Navigate to account settings');
  };

  const handlePrivacyPress = () => {
    Alert.alert('Privacy', 'Navigate to privacy settings');
  };

  const handleAboutPress = () => {
    Alert.alert('About', 'App Version 1.0.0\nBuilt with React Native');
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout') }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => Alert.alert('Success', 'Cache cleared!') }
      ]
    );
  };

  // Settings sections configuration
  const settingsSections: SettingsSection[] = [
    {
      title: 'General',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive notifications from the app',
          type: 'toggle',
          value: notifications,
          onPress: () => setNotifications(!notifications),
        },
        {
          id: 'darkMode',
          title: 'Dark Mode',
          subtitle: 'Use dark theme',
          type: 'toggle',
          value: darkMode,
          onPress: () => setDarkMode(!darkMode),
        },
        {
          id: 'autoSync',
          title: 'Auto Sync',
          subtitle: 'Automatically sync data',
          type: 'toggle',
          value: autoSync,
          onPress: () => setAutoSync(!autoSync),
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          id: 'faceId',
          title: 'Face ID / Touch ID',
          subtitle: 'Use biometric authentication',
          type: 'toggle',
          value: faceId,
          onPress: () => setFaceId(!faceId),
        },
        {
          id: 'location',
          title: 'Location Services',
          subtitle: 'Allow location access',
          type: 'toggle',
          value: locationServices,
          onPress: () => setLocationServices(!locationServices),
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          type: 'navigation',
          onPress: handlePrivacyPress,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'account',
          title: 'Account Settings',
          subtitle: 'Manage your account',
          type: 'navigation',
          onPress: handleAccountPress,
        },
        {
          id: 'clearCache',
          title: 'Clear Cache',
          subtitle: 'Free up storage space',
          type: 'action',
          onPress: handleClearCache,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'about',
          title: 'About',
          subtitle: 'App version and info',
          type: 'navigation',
          onPress: handleAboutPress,
        },
        {
          id: 'logout',
          title: 'Logout',
          type: 'action',
          onPress: handleLogoutPress,
        },
      ],
    },
  ];

  // Render individual setting item
  const renderSettingItem = (item: SettingsItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.settingItem,
          item.id === 'logout' && styles.logoutItem
        ]}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.settingContent}>
          <Text style={[
            styles.settingTitle,
            item.id === 'logout' && styles.logoutText
          ]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        
        <View style={styles.settingControl}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onPress}
              trackColor={{ false: '#767577', true: '#3498db' }}
              thumbColor={item.value ? '#fff' : '#f4f3f4'}
            />
          )}
          {item.type === 'navigation' && (
            <Text style={styles.chevron}>›</Text>
          )}
          {item.type === 'action' && item.id !== 'logout' && (
            <Text style={styles.chevron}>›</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render settings section
  const renderSection = (section: SettingsSection) => {
    return (
      <View key={section.title} style={styles.section}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.sectionContent}>
          {section.items.map(renderSettingItem)}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {settingsSections.map(renderSection)}
        
        {/* App Version Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2025 Your App Name</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 10,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e1e8ed',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 2,
  },
  logoutText: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  settingControl: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 24,
    color: '#bdc3c7',
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 5,
  },
  copyrightText: {
    fontSize: 12,
    color: '#bdc3c7',
  },
});

export default SettingsScreen;