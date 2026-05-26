export interface KartTrack {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  region: string;
  thingspeak?: {
    channelId: number;
    readApiKey: string;
  };
}

export const USA_KART_TRACKS: KartTrack[] = [
  // Midwest
  {
    id: "kart-circuit-autobahn",
    name: "Kart Circuit Autobahn",
    city: "Joliet",
    state: "IL",
    latitude: 41.5244,
    longitude: -88.1789,
    region: "Midwest",
  },
  {
    id: "badger-kart-club",
    name: "Badger Kart Club",
    city: "Dousman",
    state: "WI",
    latitude: 43.0667,
    longitude: -88.4333,
    region: "Midwest",
  },
  {
    id: "motorsports-country-club-cincinnati",
    name: "Motorsports Country Club of Cincinnati",
    city: "Lebanon",
    state: "OH",
    latitude: 39.4372,
    longitude: -84.2061,
    region: "Midwest",
  },
  {
    id: "newcastle-motorsports-park",
    name: "Newcastle Motorsports Park",
    city: "Spiceland",
    state: "IN",
    latitude: 40.1667,
    longitude: -85.3667,
    region: "Midwest",
  },
  {
    id: "norway-motorsports-park",
    name: "Norway Motorsports Park",
    city: "Sheridan",
    state: "IL",
    latitude: 41.7831,
    longitude: -88.5678,
    region: "Midwest",
    thingspeak: {
      channelId: 3318650,
      readApiKey: "SWYBUWF7NBBLQP3E",
    },
  },
  {
    id: "road-america",
    name: "Road America",
    city: "Elkhart Lake",
    state: "WI",
    latitude: 43.8667,
    longitude: -88.3333,
    region: "Midwest",
  },
  {
    id: "gateway-kartplex",
    name: "Gateway Kartplex",
    city: "Madison",
    state: "IL",
    latitude: 42.5833,
    longitude: -89.2667,
    region: "Midwest",
  },
  {
    id: "mid-state-kart-club",
    name: "Mid-State Kart Club",
    city: "Springfield",
    state: "IL",
    latitude: 39.7817,
    longitude: -89.6501,
    region: "Midwest",
  },
  {
    id: "mosport-karting-centre",
    name: "Mosport Karting Centre",
    city: "Bowmanville",
    state: "ON",
    latitude: 43.9167,
    longitude: -79.0333,
    region: "Northeast",
  },
  {
    id: "mont-tremblant-karting-track",
    name: "Mont-Tremblant Karting Track",
    city: "Mont-Tremblant",
    state: "QC",
    latitude: 46.1667,
    longitude: -74.6167,
    region: "Northeast",
  },
  {
    id: "hamilton-karting-complex",
    name: "Hamilton Karting Complex",
    city: "Hamilton",
    state: "ON",
    latitude: 43.2557,
    longitude: -79.8711,
    region: "Northeast",
  },

  // Southeast
  {
    id: "charlotte-karting-track",
    name: "Charlotte Karting Track",
    city: "Charlotte",
    state: "NC",
    latitude: 35.2271,
    longitude: -80.8431,
    region: "Southeast",
  },
  {
    id: "jacksonville-103rd-street-sports-complex",
    name: "Jacksonville 103rd Street Sports Complex",
    city: "Jacksonville",
    state: "FL",
    latitude: 30.2672,
    longitude: -81.7255,
    region: "Southeast",
  },
  {
    id: "miami-karting-track",
    name: "Miami Karting Track",
    city: "Miami",
    state: "FL",
    latitude: 25.7617,
    longitude: -80.1918,
    region: "Southeast",
  },
  {
    id: "orlando-karting-track",
    name: "Orlando Karting Track",
    city: "Orlando",
    state: "FL",
    latitude: 28.5421,
    longitude: -81.3723,
    region: "Southeast",
  },

  // South
  {
    id: "greg-moore-raceway",
    name: "Greg Moore Raceway",
    city: "Salado",
    state: "TX",
    latitude: 31.1833,
    longitude: -97.5333,
    region: "South",
  },
  {
    id: "north-texas-karters",
    name: "North Texas Karters",
    city: "Mansfield",
    state: "TX",
    latitude: 32.5633,
    longitude: -97.1583,
    region: "South",
  },
  {
    id: "pitt-race-international-kart-track",
    name: "Pitt Race International Kart Track",
    city: "Alvin",
    state: "TX",
    latitude: 29.4333,
    longitude: -95.2667,
    region: "South",
  },
  {
    id: "trackhouse-motorplex",
    name: "Trackhouse Motorplex",
    city: "Concord",
    state: "NC",
    latitude: 35.3392,
    longitude: -80.6758,
    region: "South",
  },

  // Southwest
  {
    id: "phoenix-karting-track",
    name: "Phoenix Karting Track",
    city: "Phoenix",
    state: "AZ",
    latitude: 33.4484,
    longitude: -112.0742,
    region: "Southwest",
  },

  // West
  {
    id: "k1-circuit-ca",
    name: "K1 Circuit-CA",
    city: "Vallejo",
    state: "CA",
    latitude: 38.1041,
    longitude: -122.2708,
    region: "West",
  },
  {
    id: "k1-circuit-in",
    name: "K1 Circuit-IN",
    city: "Whiteland",
    state: "IN",
    latitude: 39.6167,
    longitude: -86.3667,
    region: "Midwest",
  },
  {
    id: "sonoma-karting-track",
    name: "Sonoma Karting Track",
    city: "Sonoma",
    state: "CA",
    latitude: 38.2919,
    longitude: -122.4580,
    region: "West",
  },
  {
    id: "speedsportz-racing-park",
    name: "Speedsportz Racing Park",
    city: "Las Vegas",
    state: "NV",
    latitude: 36.1699,
    longitude: -115.1398,
    region: "Southwest",
  },
];

export function getTracksByRegion(region: string): KartTrack[] {
  return USA_KART_TRACKS.filter((track) => track.region === region);
}

export function getTracksByState(state: string): KartTrack[] {
  return USA_KART_TRACKS.filter((track) => track.state === state);
}

export function getTrackById(id: string): KartTrack | undefined {
  return USA_KART_TRACKS.find((track) => track.id === id);
}

export function getTrackByName(name: string): KartTrack | undefined {
  return USA_KART_TRACKS.find((track) => track.name === name);
}

export function getAllRegions(): string[] {
  const regions = new Set(USA_KART_TRACKS.map((track) => track.region));
  return Array.from(regions).sort();
}

export function getAllStates(): string[] {
  const states = new Set(USA_KART_TRACKS.map((track) => track.state));
  return Array.from(states).sort();
}

export function getAllTracks(): KartTrack[] {
  return USA_KART_TRACKS.sort((a, b) => a.name.localeCompare(b.name));
}
