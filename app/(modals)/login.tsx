import Colors from '@/constants/Colors';
import { useOAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { defaultStyles } from '@/constants/Styles';
import { useApp } from '@/context/AppContext';

enum Strategy {
  Google = 'oauth_google',
  Apple = 'oauth_apple',
  Facebook = 'oauth_facebook',
}

export default function LoginScreen() {
  useWarmUpBrowser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUser } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: 'oauth_apple' });
  const { startOAuthFlow: facebookAuth } = useOAuth({ strategy: 'oauth_facebook' });

  const onSelectAuth = async (strategy: Strategy) => {
    const selectedAuth = {
      [Strategy.Google]: googleAuth,
      [Strategy.Apple]: appleAuth,
      [Strategy.Facebook]: facebookAuth,
    }[strategy];

    try {
      setLoading(true);
      const { createdSessionId, setActive } = await selectedAuth();

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.back();
      }
    } catch (err) {
      console.error('OAuth error', err);
      // Fallback for developers if Clerk is not configured or fails
      Alert.alert(
        'Demo Mode',
        'OAuth failed or is not configured. Would you like to continue in Demo Mode?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => {
              updateUser({ email: `${strategy.split('_')[1]}@demo.com`, name: 'Demo User' });
              router.back();
            },
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!email) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return;
    }
    setLoading(true);
    // Log in locally
    setTimeout(() => {
      updateUser({ email, name: email.split('@')[0] });
      setLoading(false);
      router.back();
    }, 500);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* Close button in header */}
      <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
        <Ionicons name="close-outline" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.welcomeText}>Welcome to TourDZ</Text>

      <TextInput
        autoCapitalize="none"
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={[defaultStyles.inputField, { marginBottom: 20 }]}
      />

      <TouchableOpacity style={defaultStyles.btn} onPress={handleContinue} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={defaultStyles.btnText}>Continue</Text>
        )}
      </TouchableOpacity>

      <View style={styles.seperatorView}>
        <View style={styles.line} />
        <Text style={styles.seperator}>or</Text>
        <View style={styles.line} />
      </View>

      <View style={{ gap: 16 }}>
        <TouchableOpacity style={styles.btnOutline} onPress={() => {
          // Phone demo login
          updateUser({ email: 'phone@demo.com', name: 'Demo User' });
          router.back();
        }}>
          <Ionicons name="call-outline" size={20} style={defaultStyles.btnIcon} color="#000" />
          <Text style={styles.btnOutlineText}>Continue with Phone</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnOutline} onPress={() => onSelectAuth(Strategy.Apple)}>
          <Ionicons name="logo-apple" size={20} style={defaultStyles.btnIcon} color="#000" />
          <Text style={styles.btnOutlineText}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnOutline} onPress={() => onSelectAuth(Strategy.Google)}>
          <Ionicons name="logo-google" size={20} style={defaultStyles.btnIcon} color="#000" />
          <Text style={styles.btnOutlineText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnOutline} onPress={() => onSelectAuth(Strategy.Facebook)}>
          <Ionicons name="logo-facebook" size={20} style={defaultStyles.btnIcon} color="#1877F2" />
          <Text style={styles.btnOutlineText}>Continue with Facebook</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 26,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 22,
    fontFamily: 'mon-b',
    color: '#000',
    marginBottom: 24,
  },
  seperatorView: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginVertical: 24,
  },
  seperator: {
    fontFamily: 'mon-sb',
    color: Colors.grey,
    fontSize: 16,
  },
  line: {
    flex: 1,
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  btnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.grey,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  btnOutlineText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'mon-sb',
  },
});
