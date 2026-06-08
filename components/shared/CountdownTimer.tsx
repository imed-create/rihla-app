import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface CountdownTimerProps {
  expiresAt: string;
  onExpired?: () => void;
}

export default function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const colors = useColors();
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(diff);
      if (diff === 0 && onExpired) onExpired();
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isUrgent = remaining < 5 * 60 * 1000;
  const timerColor = isUrgent ? "#EF4444" : colors.primary;

  if (remaining === 0) {
    return (
      <View style={styles.row}>
        <Ionicons name="time-outline" size={12} color="#EF4444" />
        <Text style={[styles.text, { color: "#EF4444" }]}>Expired</Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Ionicons name="time-outline" size={12} color={timerColor} />
      <Text style={[styles.text, { color: timerColor }]}>
        Auto-cancel in {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  text: {
    fontSize: 11,
    fontFamily: "mon-sb",
  },
});
