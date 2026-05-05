import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { register, setToken, useGoogleAuth } from '@/services/auth';
import { useUserStore } from '@/store/userStore';
import { colors, fonts, spacing } from '@/constants/theme';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const setUser = useUserStore((s) => s.setUser);
  const { signIn: signInWithGoogle } = useGoogleAuth();

  async function onGoogle() {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result) return;
      await setUser(result.user);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Google sign-in failed', e?.message ?? 'Try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function onRegister() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      Alert.alert('Check your details', 'Name, email, and a 6+ char password are required.');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await register(name.trim(), email.trim(), password);
      await setToken(token);
      await setUser(user);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Sign up failed', e?.message ?? 'Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Create your account</Text>
          <View style={{ height: spacing.lg }} />
          <TextField label={t('auth.name')} value={name} onChangeText={setName} />
          <TextField
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextField
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button label={t('auth.signup')} onPress={onRegister} loading={loading} />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>{t('auth.or')}</Text>
            <View style={styles.line} />
          </View>

          <Button
            label={t('auth.google')}
            onPress={onGoogle}
            loading={googleLoading}
            variant="ghost"
          />

          <View style={styles.footer}>
            <Text style={{ color: colors.textMuted }}>{t('auth.haveAccount')} </Text>
            <Link href="/(auth)/login" style={{ color: colors.secondary, fontWeight: '700' }}>
              {t('auth.login')}
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.xl, paddingTop: spacing.xxl, gap: spacing.sm },
  title: {
    fontSize: fonts.size.xxl,
    fontWeight: fonts.weight.black,
    color: colors.text,
    textAlign: 'center',
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.textMuted, opacity: 0.3 },
  dividerText: { color: colors.textMuted, fontSize: fonts.size.sm },
});
