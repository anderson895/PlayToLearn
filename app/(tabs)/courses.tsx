import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COURSES } from '@/data';
import { useUserStore } from '@/store/userStore';
import { colors, fonts, radii, spacing } from '@/constants/theme';

export default function CoursesScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Text style={styles.header}>All courses</Text>
      <FlatList
        data={COURSES}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        renderItem={({ item }) => {
          const totalLessons = item.units.reduce((n, u) => n + u.outline.length, 0);
          const freeLessons = item.units
            .filter((u) => u.isFree)
            .reduce((n, u) => n + u.outline.length, 0);
          const firstFree = item.units.find((u) => u.isFree)?.outline[0];
          const fallback = item.units[0]?.outline[0];
          const target = firstFree ?? fallback;

          return (
            <Pressable
              style={[styles.card, { borderColor: item.color }]}
              onPress={() => target && router.push(`/lesson/${target.id}`)}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: item.color }]}>{item.title}</Text>
                <Text style={styles.desc}>{item.description}</Text>
                <Text style={styles.meta}>
                  {totalLessons} lessons · {user?.isSubscribed ? 'all unlocked' : `${freeLessons} free`}
                </Text>
              </View>
              {!user?.isSubscribed && freeLessons === 0 && (
                <Ionicons name="lock-closed" size={20} color={colors.textMuted} />
              )}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: spacing.lg,
    fontSize: fonts.size.xxl,
    fontWeight: fonts.weight.black,
    color: colors.text,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderBottomWidth: 4,
    backgroundColor: colors.card,
  },
  emoji: { fontSize: 40 },
  title: { fontSize: fonts.size.lg, fontWeight: fonts.weight.bold },
  desc: { color: colors.textMuted, marginTop: 2 },
  meta: { color: colors.textMuted, fontSize: fonts.size.xs, marginTop: 6 },
});
