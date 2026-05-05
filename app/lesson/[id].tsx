import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { findOutline } from '@/data';
import { useUserStore } from '@/store/userStore';
import { getOrGenerateLesson } from '@/services/aiContent';
import { getToken } from '@/services/auth';
import ProgressBar from '@/components/ProgressBar';
import QuestionCard from '@/components/QuestionCard';
import Button from '@/components/Button';
import { colors, fonts, spacing } from '@/constants/theme';
import type { Lesson } from '@/types';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const found = useMemo(() => (id ? findOutline(id) : null), [id]);
  const completeLesson = useUserStore((s) => s.completeLesson);
  const loseHeart = useUserStore((s) => s.loseHeart);
  const user = useUserStore((s) => s.user);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const isLocked = !!found && !found.unit.isFree && !user?.isSubscribed;

  useEffect(() => {
    if (!found || isLocked) return;
    let cancelled = false;
    (async () => {
      try {
        const token = (await getToken()) ?? 'dev-token';
        const result = await getOrGenerateLesson({
          authToken: token,
          subject: found.course.id,
          language: found.course.contentLanguage ?? 'en',
          outline: found.outline,
        });
        if (!cancelled) setLesson(result);
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message ?? 'Could not load this lesson.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [found, isLocked]);

  if (!found) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>Lesson not found.</Text>
        <Button label="Go back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (isLocked) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: '#FFFBEC' }]}>
        <View style={styles.lockedWrap}>
          <Ionicons name="lock-closed" size={64} color={colors.gold} />
          <Text style={styles.lockedTitle}>This lesson is for Plus members</Text>
          <Text style={styles.lockedDesc}>
            Unlock all units across {found.course.title}, get AI-generated lessons, voice tutor, and unlimited hearts.
          </Text>
          <Button label="Upgrade to Plus" onPress={() => router.replace('/subscription')} />
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: colors.textMuted, marginTop: spacing.md }}>Maybe later</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.lockedWrap}>
          <Ionicons name="cloud-offline" size={48} color={colors.danger} />
          <Text style={styles.lockedTitle}>Couldn't load lesson</Text>
          <Text style={styles.lockedDesc}>{loadError}</Text>
          <Button label="Go back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.lockedWrap}>
          <ActivityIndicator size="large" color={found.course.color} />
          <Text style={styles.lockedTitle}>Generating your lesson…</Text>
          <Text style={styles.lockedDesc}>
            AI tutor is preparing fresh practice for "{found.outline.title}".
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const total = lesson.questions.length;
  const current = lesson.questions[idx];

  async function onResult(correct: boolean) {
    if (!lesson) return;
    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      await loseHeart();
      if (user && !user.isSubscribed && user.hearts <= 1) {
        Alert.alert(
          'Out of hearts',
          'Upgrade to Plus for unlimited hearts, or wait to refill.',
          [
            { text: 'Later', style: 'cancel', onPress: () => router.back() },
            { text: 'Upgrade', onPress: () => router.replace('/subscription') },
          ],
        );
        return;
      }
    }
    if (idx + 1 >= total) {
      await completeLesson(lesson.id, lesson.xp);
      setDone(true);
    } else {
      setIdx((i) => i + 1);
    }
  }

  if (done) {
    const accuracy = Math.round((correctCount / total) * 100);
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: found.course.color }]}>
        <View style={styles.complete}>
          <Text style={styles.bigEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>Lesson complete!</Text>
          <View style={styles.summary}>
            <SummaryItem label="XP" value={`+${lesson.xp}`} />
            <SummaryItem label="Accuracy" value={`${accuracy}%`} />
          </View>
          <Button label="Continue" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={28} color={colors.textMuted} />
        </Pressable>
        <View style={{ flex: 1, marginHorizontal: spacing.md }}>
          <ProgressBar value={(idx + 1) / total} color={found.course.color} />
        </View>
        <View style={styles.heartRow}>
          <Ionicons name="heart" size={20} color={colors.heart} />
          <Text style={styles.heartText}>{user?.isSubscribed ? '∞' : user?.hearts ?? 0}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <QuestionCard key={current.id} question={current} onResult={onResult} />
      </View>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
  heartRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heartText: { fontWeight: fonts.weight.black, color: colors.heart, fontSize: fonts.size.md },
  body: { flex: 1, padding: spacing.lg },
  complete: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  bigEmoji: { fontSize: 80 },
  completeTitle: {
    color: '#fff',
    fontSize: fonts.size.display,
    fontWeight: fonts.weight.black,
    textAlign: 'center',
  },
  summary: { flexDirection: 'row', gap: spacing.md, width: '100%' },
  summaryItem: {
    flex: 1,
    backgroundColor: '#ffffff22',
    borderColor: '#ffffff44',
    borderWidth: 2,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  summaryValue: { fontSize: fonts.size.xxl, fontWeight: fonts.weight.black, color: '#fff' },
  summaryLabel: { color: '#fff', opacity: 0.85 },
  error: { color: colors.danger, padding: spacing.xl, textAlign: 'center' },
  lockedWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  lockedTitle: { fontSize: fonts.size.xl, fontWeight: fonts.weight.black, textAlign: 'center', color: colors.text },
  lockedDesc: { color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
