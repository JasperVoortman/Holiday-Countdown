import type { LocationGeocodedAddress } from 'expo-location';

export type Region = 'Noord' | 'Midden' | 'Zuid';

export type HolidayKind = 'herfst' | 'kerst' | 'voorjaar' | 'mei' | 'zomer' | 'default';

export type Holiday = {
  id: string;
  name: string;
  schoolYear: string;
  region: Region;
  appliesToAllRegions: boolean;
  compulsory: boolean;
  startDate: string;
  endDate: string;
  kind: HolidayKind;
};

type SchoolHolidayResponse = {
  content?: {
    schoolyear?: string;
    vacations?: {
      type?: string;
      compulsorydates?: string;
      regions?: {
        region?: string;
        startdate?: string;
        enddate?: string;
      }[];
    }[];
  }[];
};

export const REGIONS: Region[] = ['Noord', 'Midden', 'Zuid'];

export const SCHOOL_YEARS = [
  '2024-2025',
  '2025-2026',
  '2026-2027',
  '2027-2028',
  '2028-2029',
  '2029-2030',
];

const DATA_ENDPOINT = 'https://opendata.rijksoverheid.nl/v1/infotypes/schoolholidays';
const DATE_FORMATTER = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/Amsterdam',
});

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Amsterdam',
});

export function getRegionLabel(region: Region) {
  return `Regio: ${region}`;
}

export async function fetchSchoolHolidays(schoolYear: string, region: Region): Promise<Holiday[]> {
  const response = await fetch(`${DATA_ENDPOINT}/schoolyear/${schoolYear}?output=json`);

  if (!response.ok) {
    throw new Error(`Vakantiedata ophalen mislukt (${response.status}).`);
  }

  const data = (await response.json()) as SchoolHolidayResponse;
  const content = data.content?.[0];

  if (!content?.vacations?.length) {
    throw new Error(`Geen vakantiedata gevonden voor schooljaar ${schoolYear}.`);
  }

  return content.vacations
    .map((vacation) => {
      const name = cleanText(vacation.type);
      const selectedRegion = vacation.regions?.find((item) => {
        const rawRegion = normalizeText(item.region);

        return rawRegion === normalizeText(region) || rawRegion === 'heel nederland';
      });

      if (!name || !selectedRegion?.startdate || !selectedRegion.enddate) {
        return null;
      }

      return {
        id: `${schoolYear}-${name}`,
        name,
        schoolYear,
        region,
        appliesToAllRegions: normalizeText(selectedRegion.region) === 'heel nederland',
        compulsory: vacation.compulsorydates === 'true',
        startDate: selectedRegion.startdate,
        endDate: selectedRegion.enddate,
        kind: getHolidayKind(name),
      };
    })
    .filter((holiday): holiday is Holiday => holiday !== null)
    .sort((first, second) => Date.parse(first.startDate) - Date.parse(second.startDate));
}

export function getNextHoliday(holidays: Holiday[], now = new Date()) {
  const today = startOfDay(now).getTime();

  return holidays.find((holiday) => {
    return startOfDay(new Date(holiday.endDate)).getTime() >= today;
  });
}

export function getDaysUntilHoliday(holiday: Holiday, now = new Date()) {
  const today = startOfDay(now).getTime();
  const start = startOfDay(new Date(holiday.startDate)).getTime();

  return Math.max(0, Math.ceil((start - today) / 86_400_000));
}

export function formatDateRange(holiday: Holiday) {
  return `${formatShortDate(holiday.startDate)} - ${formatShortDate(holiday.endDate)}`;
}

export function formatFullDate(value: string) {
  return FULL_DATE_FORMATTER.format(new Date(value));
}

export function formatShortDate(value: string) {
  return DATE_FORMATTER.format(new Date(value)).replace('.', '');
}

export function getHolidayVisual(kind: HolidayKind) {
  switch (kind) {
    case 'herfst':
      return {
        emoji: '🍂',
        label: 'Herfst Afbeelding',
        backgroundColor: '#FF7A00',
        cardBackgroundColor: '#FFF8EF',
        cardBorderColor: '#E6D7C5',
        accentColor: '#F97316',
      };
    case 'kerst':
      return {
        emoji: '🎄',
        label: 'Kerst Afbeelding',
        backgroundColor: '#DC2626',
        cardBackgroundColor: '#FFF1F3',
        cardBorderColor: '#E8CDD1',
        accentColor: '#DC2626',
      };
    case 'voorjaar':
      return {
        emoji: '🌷',
        label: 'Voorjaar Afbeelding',
        backgroundColor: '#FACC15',
        cardBackgroundColor: '#FFFDEB',
        cardBorderColor: '#E6E2BE',
        accentColor: '#CA8A04',
      };
    case 'mei':
      return {
        emoji: '🌿',
        label: 'Mei Afbeelding',
        backgroundColor: '#16A34A',
        cardBackgroundColor: '#EEFFF5',
        cardBorderColor: '#CCE7D6',
        accentColor: '#16A34A',
      };
    case 'zomer':
      return {
        emoji: '☀️',
        label: 'Zomer Afbeelding',
        backgroundColor: '#0EA5E9',
        cardBackgroundColor: '#EEF7FF',
        cardBorderColor: '#CAD9E8',
        accentColor: '#0284C7',
      };
    default:
      return {
        emoji: '🏖️',
        label: 'Vakantie Afbeelding',
        backgroundColor: '#2563EB',
        cardBackgroundColor: '#EFF6FF',
        cardBorderColor: '#BFDBFE',
        accentColor: '#2563EB',
      };
  }
}

export function detectRegionFromAddress(address?: LocationGeocodedAddress): Region | null {
  if (!address) {
    return null;
  }

  const province = normalizeText(address.region ?? address.subregion);
  const city = normalizeText(address.city ?? address.district ?? address.name);

  if (province === 'drenthe' || province === 'fryslan' || province === 'friesland') {
    return 'Noord';
  }

  if (province === 'groningen' || province === 'noord holland' || province === 'noord-holland') {
    return 'Noord';
  }

  if (province === 'overijssel') {
    return 'Noord';
  }

  if (province === 'flevoland') {
    return city.includes('zeewolde') ? 'Midden' : 'Noord';
  }

  if (province === 'utrecht') {
    return city.includes('eemnes') || city.includes('abcoude') ? 'Noord' : 'Midden';
  }

  if (province === 'zuid holland' || province === 'zuid-holland') {
    return 'Midden';
  }

  if (province === 'zeeland' || province === 'limburg') {
    return 'Zuid';
  }

  if (province === 'noord brabant' || province === 'noord-brabant') {
    if (matchesAny(city, ['altena', 'werkendam', 'woudrichem', 'sleeuwijk', 'nieuwendijk'])) {
      return matchesAny(city, ['hank', 'dussen']) ? 'Zuid' : 'Midden';
    }

    return 'Zuid';
  }

  if (province === 'gelderland') {
    if (city.includes('hattem')) {
      return 'Noord';
    }

    if (
      matchesAny(city, [
        'aalten',
        'apeldoorn',
        'barneveld',
        'berkelland',
        'bronckhorst',
        'brummen',
        'buren',
        'culemborg',
        'doetinchem',
        'ede',
        'elburg',
        'epe',
        'ermelo',
        'harderwijk',
        'heerde',
        'lochem',
        'nijkerk',
        'nunspeet',
        'oldebroek',
        'oost gelre',
        'oude ijsselstreek',
        'putten',
        'scherpenzeel',
        'tiel',
        'voorst',
        'wageningen',
        'west betuwe',
        'winterswijk',
        'zutphen',
      ])
    ) {
      return 'Midden';
    }

    return 'Zuid';
  }

  return null;
}

export function detectRegionFromCoordinates(latitude: number): Region {
  if (latitude >= 52.45) {
    return 'Noord';
  }

  if (latitude <= 51.65) {
    return 'Zuid';
  }

  return 'Midden';
}

function getHolidayKind(name: string): HolidayKind {
  const normalized = normalizeText(name);

  if (normalized.includes('herfst')) {
    return 'herfst';
  }

  if (normalized.includes('kerst')) {
    return 'kerst';
  }

  if (normalized.includes('voorjaar')) {
    return 'voorjaar';
  }

  if (normalized.includes('mei')) {
    return 'mei';
  }

  if (normalized.includes('zomer')) {
    return 'zomer';
  }

  return 'default';
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function cleanText(value: unknown) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeText(value: unknown) {
  return cleanText(value)
    .toLocaleLowerCase('nl-NL')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function matchesAny(value: string, options: string[]) {
  return options.some((option) => value.includes(option));
}
