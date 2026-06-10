import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useHolidaySettings } from '@/contexts/holiday-context';
import { getRegionLabel } from '@/lib/holiday-data';

type HolidayHeaderProps = {
  subtitle?: string;
  title: string;
};

export function HolidayHeader({ subtitle, title }: HolidayHeaderProps) {
  const { region } = useHolidaySettings();
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <View style={[styles.header, isLandscape && styles.headerLandscape]}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.regionBadge}>
        <MaterialIcons name="location-on" size={13} color="#FFFFFF" />
        <Text style={styles.regionBadgeText}>{getRegionLabel(region)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 70,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLandscape: {
    minHeight: 60,
    paddingVertical: 10,
  },
  copy: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 26,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  regionBadge: {
    borderRadius: 4,
    backgroundColor: '#1D4ED8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  regionBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
