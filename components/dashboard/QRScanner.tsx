import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_FRAME_SIZE = SCREEN_WIDTH * 0.7;

interface ProQRScannerProps {
  /** Called when a QR code is successfully scanned */
  onScanned: (data: string) => void;
  /** Called when the user taps close */
  onClose: () => void;
  /** Optional title shown above the viewfinder */
  title?: string;
}

export default function ProQRScanner({
  onScanned,
  onClose,
  title = 'Scan Ticket QR',
}: ProQRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation on the scan frame border
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const handleBarCodeScanned = useCallback(
    (event: { type: string; data: string }) => {
      if (scanned) return;
      setScanned(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onScanned(event.data);
    },
    [scanned, onScanned]
  );

  // No permission yet — show request screen
  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Requesting camera access…</Text>
      </View>
    );
  }

  // Permission denied — show grant prompt
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={64} color={RIHLA.mutedText} />
        <Text style={styles.deniedTitle}>Camera Access Required</Text>
        <Text style={styles.deniedSub}>
          We need camera access to scan QR tickets from travelers.
        </Text>
        <Pressable style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantBtnText}>Grant Permission</Text>
        </Pressable>
        <Pressable style={styles.closeLink} onPress={onClose}>
          <Text style={styles.closeLinkText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={torchOn}
      />

      {/* Overlay dimming */}
      <View style={styles.overlay}>
        {/* Top gradient */}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
          style={styles.topGradient}
        />

        {/* Scan frame row */}
        <View style={styles.scanRow}>
          <View style={styles.sideMask} />

          <Animated.View
            style={[
              styles.scanFrame,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            {/* Corner accents */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <Text style={styles.frameLabel}>Align QR code within frame</Text>
          </Animated.View>

          <View style={styles.sideMask} />
        </View>

        {/* Bottom gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.bottomGradient}
        >
          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Controls */}
          <View style={styles.controls}>
            <Pressable style={styles.controlBtn} onPress={onClose}>
              <Ionicons name="close" size={26} color="#FFFFFF" />
              <Text style={styles.controlLabel}>Close</Text>
            </Pressable>

            <Pressable
              style={[styles.controlBtn, styles.torchBtn]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTorchOn((p) => !p);
              }}
            >
              <Ionicons
                name={torchOn ? 'flash' : 'flash-outline'}
                size={26}
                color={torchOn ? RIHLA.highlight : '#FFFFFF'}
              />
              <Text style={[styles.controlLabel, torchOn && { color: RIHLA.highlight }]}>
                Torch
              </Text>
            </Pressable>

            <Pressable
              style={styles.controlBtn}
              onPress={() => {
                setScanned(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              disabled={!scanned}
            >
              <Ionicons
                name="refresh"
                size={26}
                color={scanned ? '#FFFFFF' : '#666666'}
              />
              <Text
                style={[
                  styles.controlLabel,
                  !scanned && { color: '#666666' },
                ]}
              >
                Rescan
              </Text>
            </Pressable>
          </View>

          {scanned && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={20} color={RIHLA.accent} />
              <Text style={styles.successText}>QR code scanned successfully</Text>
            </View>
          )}
        </LinearGradient>
      </View>
    </View>
  );
}

const CORNER_SIZE = 28;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    flex: 1,
    backgroundColor: '#fafbfc',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 32,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: 'mon-sb',
    color: RIHLA.mutedText,
  },
  deniedTitle: {
    fontSize: 20,
    fontFamily: 'mon-b',
    color: RIHLA.dark,
    marginTop: 12,
  },
  deniedSub: {
    fontSize: 14,
    fontFamily: 'mon',
    color: RIHLA.mutedText,
    textAlign: 'center',
    lineHeight: 20,
  },
  grantBtn: {
    marginTop: 8,
    backgroundColor: RIHLA.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  grantBtnText: {
    fontSize: 15,
    fontFamily: 'mon-b',
    color: '#FFFFFF',
  },
  closeLink: {
    marginTop: 4,
    padding: 10,
  },
  closeLinkText: {
    fontSize: 14,
    fontFamily: 'mon-sb',
    color: RIHLA.mutedText,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topGradient: {
    height: SCREEN_WIDTH * 0.35,
  },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    height: SCAN_FRAME_SIZE,
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 14,
  },
  frameLabel: {
    fontSize: 13,
    fontFamily: 'mon-sb',
    color: 'rgba(255,255,255,0.85)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Corner accents
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopColor: RIHLA.accent,
    borderLeftColor: RIHLA.accent,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopColor: RIHLA.accent,
    borderRightColor: RIHLA.accent,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomColor: RIHLA.accent,
    borderLeftColor: RIHLA.accent,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomColor: RIHLA.accent,
    borderRightColor: RIHLA.accent,
  },

  bottomGradient: {
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'mon-b',
    color: '#FFFFFF',
  },
  controls: {
    flexDirection: 'row',
    gap: 32,
  },
  controlBtn: {
    alignItems: 'center',
    gap: 6,
  },
  controlLabel: {
    fontSize: 12,
    fontFamily: 'mon-sb',
    color: '#FFFFFF',
  },
  torchBtn: {
    opacity: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,168,150,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: RIHLA.accent + '40',
  },
  successText: {
    fontSize: 13,
    fontFamily: 'mon-sb',
    color: RIHLA.accent,
  },
});
