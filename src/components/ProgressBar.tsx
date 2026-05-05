import { StyleSheet, View } from 'react-native';
import { colors, radii } from '@/constants/theme';

export default function ProgressBar({ value, color }: { value: number; color?: string }) {
  const pct = Math.min(1, Math.max(0, value));
  return (
    <View style={styles.track}>
      <View
        style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color ?? colors.primary }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 14,
    width: '100%',
    backgroundColor: colors.border,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radii.pill },
});
