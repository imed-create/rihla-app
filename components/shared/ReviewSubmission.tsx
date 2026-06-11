/**
 * RIHLA — Review Submission Component
 * ───────────────────────────────────
 * Star rating (1-5) + text review input.
 * Shown after completing a booking to collect traveler feedback.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RIHLA } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import { showToast } from '@/components/Toast';

interface ReviewSubmissionProps {
  visible: boolean;
  bookingId: string;
  providerName: string;
  onClose: () => void;
}

export default function ReviewSubmission({ visible, bookingId, providerName, onClose }: ReviewSubmissionProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { addReview } = useApp();

  const handleSubmit = () => {
    if (rating === 0) {
      showToast('Please select a star rating', 'info');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addReview({
      bookingId,
      providerName,
      rating,
      text,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setText('');
      onClose();
    }, 1500);
  };

  const displayRating = hoveredStar || rating;

  const ratingLabels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          {submitted ? (
            <View style={styles.successState}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>Thank you!</Text>
              <Text style={styles.successSub}>Your review helps other travelers</Text>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Rate your experience</Text>
              <Text style={styles.subtitle}>How was {providerName}?</Text>

              {/* Star Rating */}
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRating(star); }}
                    onPressIn={() => setHoveredStar(star)}
                    onPressOut={() => setHoveredStar(0)}
                    activeOpacity={0.6}
                    style={styles.starBtn}
                  >
                    <Ionicons
                      name={star <= displayRating ? 'star' : 'star-outline'}
                      size={36}
                      color={star <= displayRating ? '#FFD166' : '#E2E8F0'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {displayRating > 0 && (
                <Text style={styles.ratingLabel}>{ratingLabels[displayRating]}</Text>
              )}

              {/* Text Review */}
              <TextInput
                style={styles.textInput}
                placeholder="Tell others about your experience..."
                placeholderTextColor="#94A3B8"
                value={text}
                onChangeText={setText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, rating === 0 && { opacity: 0.5 }]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitBtnText}>Submit Review</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.65)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28, width: '100%', maxWidth: 380, gap: 8 },
  title: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 14, fontFamily: 'mon', color: '#64748B', textAlign: 'center', marginBottom: 8 },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 12 },
  starBtn: { padding: 4 },
  ratingLabel: { fontSize: 14, fontFamily: 'mon-b', color: '#F59E0B', textAlign: 'center', marginBottom: 4 },
  textInput: {
    backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0',
    padding: 14, fontSize: 14, fontFamily: 'mon', color: '#0F172A', minHeight: 100, marginBottom: 8,
  },
  btnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 14, fontFamily: 'mon-sb', color: '#64748B' },
  submitBtn: { flex: 2, height: 48, borderRadius: 14, backgroundColor: RIHLA.primary, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { fontSize: 14, fontFamily: 'mon-b', color: '#FFFFFF' },
  successState: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  successIcon: { marginBottom: 8 },
  successTitle: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A' },
  successSub: { fontSize: 14, fontFamily: 'mon', color: '#64748B' },
});
