import { StyleSheet, Text, TextInput, View, TextInputProps } from 'react-native';
import { colors, fonts, radii, spacing } from '@/constants/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export default function TextField({ label, error, style, ...rest }: Props) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: fonts.size.sm,
    color: colors.textMuted,
    marginBottom: 6,
    fontWeight: fonts.weight.bold,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 14,
    fontSize: fonts.size.md,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, marginTop: 4, fontSize: fonts.size.xs },
});
