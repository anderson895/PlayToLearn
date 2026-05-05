import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { authErrorMessage, login, setToken, useGoogleAuth } from '@/services/auth';
import { useUserStore } from '@/store/userStore';
import { colors, fonts, radii, spacing } from '@/constants/theme';

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const setUser = useUserStore((s) => s.setUser);
  const { signIn: signInWithGoogle } = useGoogleAuth();

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!email.trim()) next.email = 'Please enter your email.';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Please enter your password.';
    return next;
  }

  async function onLogin() {
    setFormError(null);
    const fieldErrors = validate();
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      const { token, user } = await login(email.trim(), password);
      await setToken(token);
      await setUser(user);
      router.replace('/(tabs)');
    } catch (e) {
      const code = (e as { code?: string })?.code;
      const message = authErrorMessage(e);
      if (code === 'auth/invalid-email') {
        setErrors((prev) => ({ ...prev, email: message }));
      } else if (
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-credential'
      ) {
        setFormError(message);
      } else {
        setFormError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setFormError(null);
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result) return; // user cancelled
      await setUser(result.user);
      router.replace('/(tabs)');
    } catch (e) {
      setFormError(authErrorMessage(e));
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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>🦉</Text>
          <Text style={styles.title}>{t('app.name')}</Text>
          <Text style={styles.tagline}>{t('app.tagline')}</Text>

          <View style={{ height: spacing.xl }} />

          {formError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{formError}</Text>
            </View>
          )}

          <TextField
            label={t('auth.email')}
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@email.com"
          />
          <TextField
            label={t('auth.password')}
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            secureTextEntry
            autoComplete="password"
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
  errorBanner: {
    backgroundColor: '#FFE6E6',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  errorBannerText: {
    color: colors.danger,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
  },
});
