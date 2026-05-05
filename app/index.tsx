import { Redirect } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function Index() {
  const user = useUserStore((s) => s.user);
  const hydrated = useUserStore((s) => s.hydrated);
  if (!hydrated) return null;
  return <Redirect href={user ? '/(tabs)' : '/(auth)/login'} />;
}
