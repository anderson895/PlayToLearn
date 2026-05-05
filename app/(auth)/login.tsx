import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { login, setToken, useGoogleAuth } from '@/services/auth';
import { useUserStore } from '@/store/userStore';
import { colors, fonts, spacing } from '@/constants/theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const setUser = useUserStore((s) => s.setUser);
  const { signIn: signInWithGoogle } = useGoogleAuth();

  async function onLogin() {
    setLoading(true);
    try {
      const { token, user } = await login(email.trim(), password);
      await setToken(token);
      await setUser(user);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Login failed', e?.message ?? 'Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result) return; // user cancelled
      await setUser(result.user);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Google sign-in failed', e?.message ?? 'Try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.logo}>🦉</Text>
          <Text style={styles.title}>{t('app.name')}</Text>
          <Text style={styles.tagline}>{t('app.tagline')}</Text>

          <View style={{ height: spacing.xl }} />
          <TextField
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@email.com"
          />
          <TextField
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
          <Button label={t('auth.login')} onPress={onLogin} loading={loading} />

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
            <Text style={{ color: colors.textMuted }}>{t('auth.noAccount')} </Text>
            <Link href="/(auth)/register" style={{ color: colors.secondary, fontWeight: '700' }}>
              {t('auth.signup')}
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
  logo: { fontSize: 64, textAlign: 'center' },
  title: {
    textAlign: 'center',
    fontSize: fonts.size.xxl,
    fontWeight: fonts.weight.black,
    color: colors.primary,
  },
  tagline: { textAlign: 'center', color: colors.textMuted, marginTop: 4 },
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
