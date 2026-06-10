import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import {
  detectRegionFromAddress,
  detectRegionFromCoordinates,
  fetchSchoolHolidays,
  getDaysUntilHoliday,
  getNextHoliday,
  Holiday,
  Region,
  SCHOOL_YEARS,
} from '@/lib/holiday-data';

type LocationStatus = 'idle' | 'loading' | 'success' | 'denied' | 'unavailable' | 'error';

type HolidayContextValue = {
  availableSchoolYears: string[];
  daysUntilNextHoliday: number | null;
  detectRegionWithGps: () => Promise<void>;
  error: string | null;
  holidays: Holiday[];
  isHydrated: boolean;
  isLoadingHolidays: boolean;
  locationMessage: string | null;
  locationStatus: LocationStatus;
  nextHoliday: Holiday | undefined;
  refreshHolidays: () => void;
  region: Region;
  schoolYear: string;
  setRegion: (region: Region) => void;
  setSchoolYear: (schoolYear: string) => void;
};

const STORAGE_KEY = '@holiday-countdown/settings';
const DEFAULT_REGION: Region = 'Midden';
const DEFAULT_SCHOOL_YEAR = '2025-2026';

const HolidayContext = createContext<HolidayContextValue | null>(null);

export function HolidayProvider({ children }: PropsWithChildren) {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [schoolYear, setSchoolYear] = useState(DEFAULT_SCHOOL_YEAR);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const rawSettings = await AsyncStorage.getItem(STORAGE_KEY);

        if (rawSettings) {
          const stored = JSON.parse(rawSettings) as Partial<{
            region: Region;
            schoolYear: string;
          }>;

          if (stored.region === 'Noord' || stored.region === 'Midden' || stored.region === 'Zuid') {
            setRegion(stored.region);
          }

          if (stored.schoolYear && SCHOOL_YEARS.includes(stored.schoolYear)) {
            setSchoolYear(stored.schoolYear);
          }
        }
      } catch {
        setError('Opgeslagen instellingen konden niet worden geladen.');
      } finally {
        setIsHydrated(true);
      }
    }

    loadSettings();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ region, schoolYear })).catch(() => {
      setError('Instellingen konden niet worden opgeslagen.');
    });
  }, [isHydrated, region, schoolYear]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    let cancelled = false;

    async function loadHolidays() {
      setIsLoadingHolidays(true);
      setError(null);

      try {
        const nextHolidays = await fetchSchoolHolidays(schoolYear, region);

        if (!cancelled) {
          setHolidays(nextHolidays);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setHolidays([]);
          setError(fetchError instanceof Error ? fetchError.message : 'Vakantiedata ophalen mislukt.');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingHolidays(false);
        }
      }
    }

    loadHolidays();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, refreshToken, region, schoolYear]);

  async function detectRegionWithGps() {
    setLocationStatus('loading');
    setLocationMessage('Locatie ophalen...');

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();

      if (!servicesEnabled) {
        setLocationStatus('unavailable');
        setLocationMessage('Locatieservices staan uit op dit apparaat.');
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        setLocationStatus('denied');
        setLocationMessage('Locatietoegang is geweigerd.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const addresses = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      const detectedRegion =
        detectRegionFromAddress(addresses[0]) ??
        detectRegionFromCoordinates(position.coords.latitude);

      setRegion(detectedRegion);
      setLocationStatus('success');
      setLocationMessage(`Regio automatisch ingesteld op ${detectedRegion}.`);
    } catch {
      setLocationStatus('error');
      setLocationMessage('Regio bepalen via GPS is mislukt.');
    }
  }

  const nextHoliday = getNextHoliday(holidays);
  const daysUntilNextHoliday = nextHoliday ? getDaysUntilHoliday(nextHoliday) : null;

  return (
    <HolidayContext.Provider
      value={{
        availableSchoolYears: SCHOOL_YEARS,
        daysUntilNextHoliday,
        detectRegionWithGps,
        error,
        holidays,
        isHydrated,
        isLoadingHolidays,
        locationMessage,
        locationStatus,
        nextHoliday,
        refreshHolidays: () => setRefreshToken((value) => value + 1),
        region,
        schoolYear,
        setRegion,
        setSchoolYear,
      }}>
      {children}
    </HolidayContext.Provider>
  );
}

export function useHolidaySettings() {
  const context = useContext(HolidayContext);

  if (!context) {
    throw new Error('useHolidaySettings must be used within HolidayProvider');
  }

  return context;
}
