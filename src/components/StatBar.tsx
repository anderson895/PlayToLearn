import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';

export default function StatBar() {
  const user = useUserStore((s) => s.user);
  if (!user) return null;
  return (
    <View style={styles.row}>
      <Stat icon="flame" color={colors.accent} bg="#FFF1E0" value={user.streak} />
      <Stat icon="diamond" color={colors.gem} bg="#E5F6FE" value={user.gems} />
      <Stat
        icon="heart"
        color={colors.heart}
        bg="#FFE6E6"
        value={user.isSubscribed ? '∞' : user.hearts}
      />
    </View>
  );
}

function Stat({
  icon,
  color,
  bg,
  value,
}: {
  icon: 'flame' | 'diamond' | 'heart';
  color: string;
  bg: string;
  value: string | number;
}) {
  return (
    <View style={[styles.stat, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  value: { fontWeight: fonts.weight.black, fontSize: fonts.size.sm },
});
