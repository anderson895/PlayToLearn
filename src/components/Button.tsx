import { Pressable, StyleSheet, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { colors, fonts, radii } from '@/constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: ButtonProps) {
  const palette: Record<string, { bg: string; bgDark: string; fg: string }> = {
    primary: { bg: colors.primary, bgDark: colors.primaryDark, fg: '#fff' },
    secondary: { bg: colors.secondary, bgDark: '#0F90C7', fg: '#fff' },
    ghost: { bg: '#F0F0F0', bgDark: '#D8D8D8', fg: colors.text },
    danger: { bg: colors.danger, bgDark: '#CC3B3B', fg: '#fff' },
  };
  const c = palette[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: c.bg,
          borderBottomColor: c.bgDark,
          opacity: disabled ? 0.5 : 1,
          transform: [{ translateY: pressed ? 2 : 0 }],
          borderBottomWidth: pressed ? 2 : 4,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.fg} />
      ) : (
        <Text style={[styles.label, { color: c.fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  label: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
