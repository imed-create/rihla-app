import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/useSettingsStore';

function enabled() {
  return useSettingsStore.getState().hapticsEnabled;
}

export function hapticLight() {
  if (enabled()) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticMedium() {
  if (enabled()) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function hapticHeavy() {
  if (enabled()) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export function hapticSuccess() {
  if (enabled()) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function hapticError() {
  if (enabled()) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

export function hapticSelection() {
  if (enabled()) void Haptics.selectionAsync();
}
