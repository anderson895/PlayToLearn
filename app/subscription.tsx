import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { PLANS, formatPrice } from '@/constants/subscription';
import {
  createGCashSource,
  createPaymentMethodCard,
  createSubscription,
  isDemoMode,
} from '@/services/paymongo';
import { getToken } from '@/services/auth';
import { useUserStore } from '@/store/userStore';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { SubscriptionPlan } from '@/types';

export default function SubscriptionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setSubscribed = useUserStore((s) => s.setSubscribed);

  const [plan, setPlan] = useState<SubscriptionPlan>(PLANS[1]);
  const [method, setMethod] = useState<'card' | 'gcash' | null>(null);
  const [busy, setBusy] = useState(false);
  const [card, setCard] = useState({ number: '', exp: '', cvc: '', name: '' });
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  async function activate() {
    await setSubscribed(plan.id === 'family_yearly' ? 'family' : 'plus');
    Alert.alert(
      isDemoMode ? 'Demo: Plus activated' : 'Welcome to Plus!',
      isDemoMode
        ? 'No real payment was processed. Connect PayMongo later to charge real customers.'
        : 'Your subscription is active.',
    );
    router.back();
  }

  async function payCard() {
    setBusy(true);
    try {
      let pmId: string;
      if (isDemoMode) {
        // Skip strict card validation — demo only.
        pmId = await createPaymentMethodCard({
          cardNumber: card.number || '4343434343434345',
          expMonth: 12,
          expYear: 2030,
          cvc: 123,
          cardHolderName: card.name || 'Demo User',
        });
      } else {
        const [mm, yy] = card.exp.split('/').map((s) => parseInt(s.trim(), 10));
        if (!mm || !yy) throw new Error('Invalid expiry, use MM/YY');
        pmId = await createPaymentMethodCard({
          cardNumber: card.number,
          expMonth: mm,
          expYear: 2000 + yy,
          cvc: parseInt(card.cvc, 10),
          cardHolderName: card.name,
        });
      }
      const token = (await getToken()) ?? 'dev-token';
      const result = await createSubscription({
        authToken: token,
        plan,
        paymentMethodId: pmId,
        source: 'card',
      });
      if (result.status === 'pending' && result.redirectUrl) {
        setCheckoutUrl(result.redirectUrl);
        return;
      }
      await activate();
    } catch (e: any) {
      Alert.alert('Payment failed', e?.message ?? 'Try a different card.');
    } finally {
      setBusy(false);
    }
  }

  async function payGCash() {
    setBusy(true);
    try {
      const token = (await getToken()) ?? 'dev-token';
      const { checkoutUrl } = await createGCashSource({ authToken: token, plan });
      if (checkoutUrl) {
        setCheckoutUrl(checkoutUrl);
      } else {
        // Demo mode: no real GCash redirect — go straight to success.
        await activate();
      }
    } catch (e: any) {
      Alert.alert('GCash unavailable', e?.message ?? 'Try again later.');
    } finally {
      setBusy(false);
    }
  }

  async function onCheckoutNav(navState: { url: string }) {
    if (navState.url.includes('success')) {
      setCheckoutUrl(null);
      await activate();
    } else if (navState.url.includes('failed') || navState.url.includes('cancel')) {
      setCheckoutUrl(null);
      Alert.alert('Payment cancelled');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        {isDemoMode && (
          <View style={styles.demoBanner}>
            <Ionicons name="information-circle" size={20} color={colors.secondary} />
            <Text style={styles.demoBannerText}>
              Demo mode — no real charges. Set up PayMongo later to enable real payments.
            </Text>
          </View>
        )}

        <View style={styles.hero}>
          <Text style={{ fontSize: 56 }}>🚀</Text>
          <Text style={styles.heroTitle}>{t('sub.title')}</Text>
          <Text style={styles.heroSub}>{t('sub.subtitle')}</Text>
        </View>

        <View style={{ gap: spacing.md }}>
          {PLANS.map((p) => {
            const selected = p.id === plan.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setPlan(p)}
                style={[styles.planCard, selected && styles.planCardSelected]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>{p.name}</Text>
                  <Text style={styles.planPrice}>
                    {formatPrice(p.priceCents, p.currency)} / {p.interval}
                  </Text>
                  <View style={{ marginTop: spacing.sm, gap: 4 }}>
                    {p.perks.map((perk) => (
                      <View key={perk} style={styles.perk}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                        <Text style={styles.perkText}>{perk}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Ionicons
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={selected ? colors.primary : colors.textMuted}
                />
              </Pressable>
            );
          })}
        </View>

        {!method && (
          <View style={{ gap: spacing.sm }}>
            <Button label={t('sub.gcash')} onPress={() => setMethod('gcash')} variant="secondary" />
            <Button label={t('sub.card')} onPress={() => setMethod('card')} />
          </View>
        )}

        {method === 'card' && (
          <View>
            <Text style={styles.section}>Card details</Text>
            {isDemoMode && (
              <Text style={styles.demoHint}>Any input works in demo mode.</Text>
            )}
            <TextField
              label="Card number"
              value={card.number}
              onChangeText={(v) => setCard({ ...card, number: v })}
              keyboardType="number-pad"
              placeholder="4343 4343 4343 4345"
            />
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Expiry (MM/YY)"
                  value={card.exp}
                  onChangeText={(v) => setCard({ ...card, exp: v })}
                  placeholder="12/29"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  label="CVC"
                  value={card.cvc}
                  onChangeText={(v) => setCard({ ...card, cvc: v })}
                  keyboardType="number-pad"
                  placeholder="123"
                  secureTextEntry
                />
              </View>
            </View>
            <TextField
              label="Cardholder name"
              value={card.name}
              onChangeText={(v) => setCard({ ...card, name: v })}
            />
            <Button
              label={isDemoMode ? 'Simulate payment' : t('sub.cta')}
              onPress={payCard}
              loading={busy}
            />
            <Pressable onPress={() => setMethod(null)} style={{ marginTop: spacing.sm }}>
              <Text style={{ color: colors.textMuted, textAlign: 'center' }}>Back</Text>
            </Pressable>
          </View>
        )}

        {method === 'gcash' && (
          <View style={{ gap: spacing.md }}>
            <Text style={styles.section}>GCash</Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
              {isDemoMode
                ? 'Demo: tapping continue will instantly activate Plus, no real GCash redirect.'
                : "You'll be redirected to GCash to authorize the payment."}
            </Text>
            <Button
              label={isDemoMode ? 'Simulate GCash payment' : 'Continue with GCash'}
              onPress={payGCash}
              loading={busy}
              variant="secondary"
            />
            <Pressable onPress={() => setMethod(null)}>
              <Text style={{ color: colors.textMuted, textAlign: 'center' }}>Back</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <Modal visible={checkoutUrl != null} animationType="slide" onRequestClose={() => setCheckoutUrl(null)}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setCheckoutUrl(null)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
            <Text style={styles.modalTitle}>Complete payment</Text>
            <View style={{ width: 28 }} />
          </View>
          {checkoutUrl && (
            <WebView source={{ uri: checkoutUrl }} onNavigationStateChange={onCheckoutNav} />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  demoBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: '#E0F4FE',
    borderColor: colors.secondary,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  demoBannerText: { flex: 1, color: colors.text, fontSize: fonts.size.sm, lineHeight: 18 },
  hero: { alignItems: 'center', gap: 4 },
  heroTitle: { fontSize: fonts.size.display, fontWeight: fonts.weight.black, color: colors.gold },
  heroSub: { color: colors.textMuted, textAlign: 'center' },
  planCard: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  planCardSelected: { borderColor: colors.primary, backgroundColor: '#F1FBE6' },
  planName: { fontWeight: fonts.weight.bold, fontSize: fonts.size.lg, color: colors.text },
  planPrice: { color: colors.textMuted, marginTop: 2 },
  perk: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  perkText: { color: colors.text, fontSize: fonts.size.sm },
  section: {
    fontWeight: fonts.weight.bold,
    fontSize: fonts.size.lg,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  demoHint: { color: colors.textMuted, fontSize: fonts.size.sm, marginBottom: spacing.sm },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontWeight: fonts.weight.bold, fontSize: fonts.size.lg },
});
