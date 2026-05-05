import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { askTutor, speak, stopSpeaking, type TutorMessage } from '@/services/aiTutor';
import { getToken } from '@/services/auth';
import { useUserStore } from '@/store/userStore';
import { colors, fonts, radii, spacing } from '@/constants/theme';

const SUBJECTS = ['english', 'math', 'spanish', 'japanese', 'filipino', 'chess'];

export default function TutorScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const [subject, setSubject] = useState('english');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      role: 'assistant',
      content: `Hi ${user?.name ?? 'there'}! I'm your AI Tutor. Pick a subject and ask me anything!`,
    },
  ]);
  const scrollRef = useRef<ScrollView>(null);

  async function send() {
    const value = text.trim();
    if (!value || busy) return;
    const userTurns = messages.filter((m) => m.role === 'user').length;
    if (!user?.isSubscribed && userTurns >= 3) {
      router.push('/subscription');
      return;
    }
    const next = [...messages, { role: 'user' as const, content: value }];
    setMessages(next);
    setText('');
    setBusy(true);
    try {
      const token = (await getToken()) ?? 'dev-token';
      const reply = await askTutor({
        authToken: token,
        subject,
        language: user?.language ?? 'en',
        level: 'beginner',
        history: next,
      });
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
      speak(reply, user?.language === 'fil' ? 'fil-PH' : 'en-US');
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `Hmm, I couldn't reach my brain. ${e?.message ?? ''}` },
      ]);
    } finally {
      setBusy(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgAlt }}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Tutor</Text>
        <Pressable onPress={stopSpeaking}>
          <Ionicons name="volume-mute" size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjects}>
        {SUBJECTS.map((s) => {
          const active = s === subject;
          return (
            <Pressable
              key={s}
              onPress={() => setSubject(s)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && { color: '#fff' }]}>{s}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView ref={scrollRef} contentContainerStyle={styles.thread}>
          {messages.map((m, idx) => (
            <View
              key={idx}
              style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}
            >
              <Text style={[styles.bubbleText, m.role === 'user' && { color: '#fff' }]}>
                {m.content}
              </Text>
            </View>
          ))}
          {busy && (
            <View style={[styles.bubble, styles.bubbleAi]}>
              <Text style={styles.bubbleText}>Thinking…</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={`Ask about ${subject}…`}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
          />
          <Pressable onPress={send} style={styles.send}>
            <Ionicons name="send" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: { fontSize: fonts.size.xxl, fontWeight: fonts.weight.black, color: colors.text },
  subjects: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm, maxHeight: 44 },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    height: 36,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontWeight: fonts.weight.bold, color: colors.text, textTransform: 'capitalize' },
  thread: { padding: spacing.lg, gap: spacing.sm },
  bubble: { padding: spacing.md, borderRadius: radii.lg, maxWidth: '85%' },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: colors.secondary },
  bubbleAi: { alignSelf: 'flex-start', backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  bubbleText: { color: colors.text, fontSize: fonts.size.md, lineHeight: 22 },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgAlt,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: fonts.size.md,
    color: colors.text,
    maxHeight: 120,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
