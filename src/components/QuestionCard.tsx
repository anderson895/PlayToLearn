import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { QuizQuestion } from '@/types';
import Button from './Button';

interface Props {
  question: QuizQuestion;
  onResult: (correct: boolean) => void;
}

export default function QuestionCard({ question, onResult }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const correctAnswer = Array.isArray(question.answer)
    ? question.answer[0]
    : question.answer;

  function check() {
    if (selected == null) return;
    const ok = selected === correctAnswer;
    setRevealed(true);
    Haptics.notificationAsync(
      ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    );
    setTimeout(() => {
      setRevealed(false);
      setSelected(null);
      onResult(ok);
    }, 900);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.prompt}>{question.prompt}</Text>
      <View style={styles.choices}>
        {(question.choices ?? []).map((choice) => {
          const isSelected = selected === choice;
          const isCorrect = revealed && choice === correctAnswer;
          const isWrong = revealed && isSelected && choice !== correctAnswer;
          return (
            <Pressable
              key={choice}
              onPress={() => !revealed && setSelected(choice)}
              style={[
                styles.choice,
                isSelected && styles.choiceSelected,
                isCorrect && styles.choiceCorrect,
                isWrong && styles.choiceWrong,
              ]}
            >
              <Text
                style={[
                  styles.choiceText,
                  (isCorrect || isWrong) && { color: '#fff' },
                ]}
              >
                {choice}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Button label="Check" onPress={check} disabled={selected == null || revealed} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  prompt: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    lineHeight: 30,
  },
  choices: { gap: spacing.md },
  choice: {
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderRadius: radii.md,
    padding: spacing.lg,
    backgroundColor: colors.card,
  },
  choiceSelected: { borderColor: colors.secondary, backgroundColor: '#E0F4FE' },
  choiceCorrect: { borderColor: colors.primaryDark, backgroundColor: colors.primary },
  choiceWrong: { borderColor: '#CC3B3B', backgroundColor: colors.danger },
  choiceText: { fontSize: fonts.size.md, fontWeight: fonts.weight.bold, color: colors.text },
});
