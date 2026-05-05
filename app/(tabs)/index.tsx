import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COURSES } from '@/data';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import StatBar from '@/components/StatBar';
import { useUserStore } from '@/store/userStore';

type NodeStatus = 'done' | 'current' | 'available' | 'locked';

export default function LearnScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const course = COURSES[0];

  const onLessonPress = (lessonId: string, status: NodeStatus) => {
    if (status === 'locked') {
      router.push('/subscription');
    } else {
      router.push(`/lesson/${lessonId}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgAlt }}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi, {user?.name ?? 'friend'} 👋</Text>
        <StatBar />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.banner, { backgroundColor: course.color }]}>
          <Text style={styles.bannerEmoji}>{course.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{course.title}</Text>
            <Text style={styles.bannerSubtitle}>{course.description}</Text>
          </View>
        </View>

        {course.units.map((unit, i) => {
          const unitLocked = !unit.isFree && !user?.isSubscribed;
          const completedCount = unit.outline.filter((o) =>
            user?.completedLessons.includes(o.id),
          ).length;
          const total = unit.outline.length;
          const nextIdx = unit.outline.findIndex(
            (o) => !user?.completedLessons.includes(o.id),
          );
          const progressPct = total > 0 ? (completedCount / total) * 100 : 0;

          return (
            <View key={unit.id} style={styles.unitCard}>
              <View style={styles.unitHeader}>
                <View
                  style={[
                    styles.unitNum,
                    unitLocked && { backgroundColor: colors.textMuted },
                  ]}
                >
                  {unitLocked ? (
                    <Ionicons name="lock-closed" size={18} color="#fff" />
                  ) : (
                    <Text style={styles.unitNumText}>{i + 1}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.unitTitle}>{unit.title}</Text>
                  <Text style={styles.unitDesc} numberOfLines={2}>
                    {unitLocked ? 'Plus only' : unit.description}
                  </Text>
                </View>
                {unit.isFree && (
                  <View style={styles.freePill}>
                    <Text style={styles.freePillText}>FREE</Text>
                  </View>
                )}
              </View>

              {!unitLocked && (
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[styles.progressFill, { width: `${progressPct}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {completedCount}/{total}
                  </Text>
                </View>
              )}

              <View style={styles.lessonList}>
                {unit.outline.map((outline, idx) => {
                  const completed = !!user?.completedLessons.includes(outline.id);
                  const isNext = idx === nextIdx && !unitLocked;
                  const status: NodeStatus = unitLocked
                    ? 'locked'
                    : completed
                      ? 'done'
                      : isNext
                        ? 'current'
                        : 'available';
                  const iconName =
                    status === 'locked'
                      ? 'lock-closed'
                      : status === 'done'
                        ? 'checkmark'
                        : 'play';
                  return (
                    <Pressable
                      key={outline.id}
                      onPress={() => onLessonPress(outline.id, status)}
                      style={({ pressed }) => [
                        styles.lessonRow,
                        pressed && !unitLocked && { backgroundColor: colors.bgAlt },
                      ]}
                    >
                      <View style={[styles.lessonIcon, lessonIconStyle(status)]}>
                        <Ionicons name={iconName} size={20} color="#fff" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.lessonTitleRow}>
                          <Text style={styles.lessonNum}>
                            Lesson {idx + 1}
                          </Text>
                          {status === 'current' && (
                            <View style={styles.startPill}>
                              <Text style={styles.startPillText}>START</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.lessonTitle} numberOfLines={1}>
                          {outline.title}
                        </Text>
                      </View>
                      <View style={styles.lessonRight}>
                        <View style={styles.xpBadge}>
                          <Ionicons name="star" size={11} color={colors.gold} />
                          <Text style={styles.xpText}>+{outline.xp}</Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={colors.textMuted}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        {!user?.isSubscribed && (
          <Pressable style={styles.proCard} onPress={() => router.push('/subscription')}>
            <Ionicons name="rocket" size={28} color={colors.gold} />
            <View style={{ flex: 1 }}>
              <Text style={styles.proTitle}>Unlock all lessons with Plus</Text>
              <Text style={styles.proDesc}>
                AI-generated lessons, voice tutor, no ads, unlimited hearts.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function lessonIconStyle(status: NodeStatus) {
  switch (status) {
    case 'done':
      return { backgroundColor: colors.gold };
    case 'current':
      return { backgroundColor: colors.primary };
    case 'available':
      return { backgroundColor: colors.secondary };
    case 'locked':
      return { backgroundColor: '#CFCFCF' };
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: { fontSize: fonts.size.lg, fontWeight: fonts.weight.bold, color: colors.text },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  bannerEmoji: { fontSize: 44 },
  bannerTitle: {
    color: '#fff',
    fontWeight: fonts.weight.black,
    fontSize: fonts.size.xl,
  },
  bannerSubtitle: { color: '#fff', marginTop: 2, opacity: 0.9, fontSize: fonts.size.sm },
  unitCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitHeader: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  unitNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitNumText: { color: '#fff', fontWeight: fonts.weight.black },
  unitTitle: { fontSize: fonts.size.md, fontWeight: fonts.weight.bold, color: colors.text },
  unitDesc: { color: colors.textMuted, fontSize: fonts.size.sm, marginTop: 2 },
  freePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  freePillText: { color: '#fff', fontWeight: fonts.weight.black, fontSize: 11 },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  progressText: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.bold,
    color: colors.textMuted,
    minWidth: 28,
    textAlign: 'right',
  },
  lessonList: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.md,
  },
  lessonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lessonNum: {
    fontSize: fonts.size.xs,
    color: colors.textMuted,
    fontWeight: fonts.weight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  lessonTitle: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    marginTop: 2,
  },
  lessonRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: '#FFF8DC',
  },
  xpText: {
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.black,
    color: '#A88500',
  },
  startPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  startPillText: {
    color: '#fff',
    fontWeight: fonts.weight.black,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: '#FFFBEC',
  },
  proTitle: { fontWeight: fonts.weight.bold, fontSize: fonts.size.md, color: colors.text },
  proDesc: { color: colors.textMuted, fontSize: fonts.size.sm, marginTop: 2 },
});
