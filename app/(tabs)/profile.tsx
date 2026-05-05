import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { logout as authLogout } from '@/services/auth';
import { colors, fonts, radii, spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);

  if (!user) return null;

  async function onLogout() {
    await authLogout();
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 56 }}>🦉</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.statsRow}>
          <Stat label="XP" value={user.xp} color={colors.gold} />
          <Stat label="Streak" value={user.streak} color={colors.accent} />
          <Stat label="Gems" value={user.gems} color={colors.gem} />
        </View>

        <View style={styles.section}>
          <Pressable
            onPress={() => router.push('/subscription')}
            style={[styles.row, { borderColor: colors.gold }]}
          >
            <Ionicons name="rocket" size={22} color={colors.gold} />
            <Text style={styles.rowText}>
              {user.isSubscribed ? `Plus ${user.subscriptionTier}` : 'Upgrade to Plus'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>

          <Pressable style={styles.row}>
            <Ionicons name="language" size={22} color={colors.secondary} />
            <Text style={styles.rowText}>App language: {user.language.toUpperCase()}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>

          <Pressable style={styles.row} onPress={onLogout}>
            <Ionicons name="log-out" size={22} color={colors.danger} />
            <Text style={[styles.rowText, { color: colors.danger }]}>Log out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignSelf: 'center' },
  name: {
    textAlign: 'center',
    fontSize: fonts.size.xxl,
    fontWeight: fonts.weight.black,
    color: colors.text,
  },
  email: { textAlign: 'center', color: colors.textMuted },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
    backgroundColor: colors.bgAlt,
    borderRadius: radii.lg,
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: fonts.size.xxl, fontWeight: fonts.weight.black },
  statLabel: { color: colors.textMuted, fontSize: fonts.size.sm },
  section: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
  },
  rowText: { flex: 1, color: colors.text, fontSize: fonts.size.md, fontWeight: fonts.weight.bold },
});
