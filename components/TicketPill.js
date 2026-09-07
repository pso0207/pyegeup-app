import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, type } from '../constants/theme';
import { useApp } from '../store/useApp';

export default function TicketPill({ style }) {
  const tickets = useApp((s) => s.tickets);
  return (
    <View style={[s.pill, style]}>
      <Ionicons name="ticket" size={13} color={colors.ticket} />
      <Text style={[type.mono, { color: colors.ticket }]}>{tickets}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.ticketSoft,
    borderWidth: 1,
    borderColor: colors.ticket,
  },
});
