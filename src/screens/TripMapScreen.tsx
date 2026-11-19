import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Map, Camera, Marker, GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { PrimaryButton, SecondaryButton } from '../components';
import { Colors, Typography } from '../theme';
import { apiRequest } from '../services/api';
import { getToken } from '../services/authStorage';
import { useApp } from '../store/data';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_HEIGHT * 0.70;

// How long to wait after the app goes to background before actually stopping GPS.
// This prevents transient state changes (permission dialogs, floating windows,
// MockLoc overlays, etc.) from killing the watcher.
const BACKGROUND_STOP_DELAY_MS = 8000;

interface TripLocation {
  name: string;
  code: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface TripDetails {
  id: string;
  cashRequestId: number;
  date: string;
  branchId: string;
  type: 'Deposit' | 'Withdrawal';
  pickup: TripLocation;
  dropoff: TripLocation;
  teamId: string;
  amount: number;
  currency: string;
  durationMin: number;
  onTime: boolean;
}

interface RouteGeometry {
  type: 'LineString';
  coordinates: [number, number][];
}

interface TripMapScreenProps {
  isPickup?: boolean;
  onBackClick: () => void;
  onArrived: (
    cashRequestId: number,
    currentLocation: { latitude: number; longitude: number } | null,
  ) => void;
}

export const TripMapScreen: React.FC<TripMapScreenProps> = ({
  isPickup = true,
  onBackClick,
  onArrived,
}) => {
  const { currentTrip } = useApp();
  useEffect(() => {
    console.log(
      '[MAP] Current assignment:',
      JSON.stringify(currentTrip, null, 2),
    );
  }, [currentTrip]);
  const cameraRef = useRef<any>(null);

  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const activeLocation = isPickup ? tripDetails?.pickup : tripDetails?.dropoff;
  const locationName = activeLocation?.name ?? 'Loading destination...';
  const address = activeLocation?.address ?? '';
  const [routeGeometry, setRouteGeometry] = useState<RouteGeometry | null>(null);
  const stepText = isPickup ? 'STEP 1 OF 2 · PICKUP' : 'STEP 2 OF 2 · DROP-OFF';
  const arrivedText = isPickup ? 'Arrived at Pickup' : 'Arrived at Drop-off';

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [gpsUpdateCount, setGpsUpdateCount] = useState(0);

  // Refs that the GPS watcher closure can safely access without re-subscribing.
  const watchIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const isStartingRef = useRef(false);
  const hasPermissionRef = useRef(false);
  const backgroundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ---------------------------------------------------------------
  // 1. Fetch trip details
  // ---------------------------------------------------------------
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const token = await getToken();
        if (!token) {
          console.log('No saved authentication token found.');
          return;
        }
        const response = await apiRequest<{ data: TripDetails }>(
          `/trips/${currentTrip.id}`,
          { method: 'GET' },
          token,
        );
        setTripDetails(response.data);
        console.log('Trip details loaded:', JSON.stringify(response.data, null, 2));
      } catch (error) {
        console.error('Trip API error:', error);
        Alert.alert('Trip Error', 'Unable to load trip details.');
      }
    };
    fetchTripDetails();
  }, [currentTrip.id]);

  // ---------------------------------------------------------------
  // 2. GPS tracking (stable refs, no AppState churn)
  // ---------------------------------------------------------------
  const stopLocationTracking = useCallback(() => {
    if (backgroundTimerRef.current) {
      clearTimeout(backgroundTimerRef.current);
      backgroundTimerRef.current = null;
    }
    if (watchIdRef.current !== null) {
      console.log('[GPS] Stopping watcher:', watchIdRef.current);
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startLocationTracking = useCallback(async () => {
    if (!isMountedRef.current || isStartingRef.current || watchIdRef.current !== null) {
      return;
    }
    isStartingRef.current = true;

    try {
      if (Platform.OS !== 'android') {
        // iOS: still request permission once via the library
        if (!hasPermissionRef.current) {
          const status = await Geolocation.requestAuthorization('whenInUse');
          if (status !== 'granted') {
            Alert.alert(
              'Location Permission Required',
              'Please allow location access to use CashRoute tracking.',
            );
            return;
          }
          hasPermissionRef.current = true;
        }
      } else if (!hasPermissionRef.current) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
        if (!isMountedRef.current) return;
        hasPermissionRef.current =
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED;
        if (!hasPermissionRef.current) {
          Alert.alert(
            'Location Permission Required',
            'Please allow location access to use CashRoute tracking.',
          );
          return;
        }
      }

      if (!isMountedRef.current) return;

      console.log('[GPS] Starting location watcher');
      watchIdRef.current = Geolocation.watchPosition(
        position => {
          if (!isMountedRef.current) return;
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setGpsUpdateCount(count => count + 1);
          console.log('[GPS] Updated GPS:', latitude, longitude);
        },
        error => {
          console.log('[GPS] ERROR:', error.code, error.message);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 0,            // receive every update; MockLoc friendly
          interval: 3000,
          fastestInterval: 2000,
          maximumAge: 5000,
          forceRequestLocation: true,
          showLocationDialog: false,    // avoid surprise system dialogs that flip AppState
        },
      );
      console.log('[GPS] Watcher started:', watchIdRef.current);
    } catch (error) {
      console.log('[GPS] Initialization error:', error);
    } finally {
      isStartingRef.current = false;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    startLocationTracking();

    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      console.log('[GPS] App state changed:', next);
      const prev = appStateRef.current;
      appStateRef.current = next;

      if (next === 'active') {
        // Cancel any pending background stop
        if (backgroundTimerRef.current) {
          clearTimeout(backgroundTimerRef.current);
          backgroundTimerRef.current = null;
          console.log('[GPS] Cancelled background stop timer');
        }
        // Ensure the watcher exists (it may have been stopped by a real background)
        startLocationTracking();
      } else if (next === 'background' && prev !== 'background') {
        // Do NOT stop immediately. Schedule a stop in case the app really stays
        // in the background. Transient events (dialogs, MockLoc overlays) will
        // flip back to 'active' before the timer fires and cancel this.
        if (backgroundTimerRef.current) {
          clearTimeout(backgroundTimerRef.current);
        }
        backgroundTimerRef.current = setTimeout(() => {
          backgroundTimerRef.current = null;
          if (appStateRef.current === 'background') {
            console.log('[GPS] App stayed in background — stopping watcher');
            stopLocationTracking();
          }
        }, BACKGROUND_STOP_DELAY_MS);
      }
    });

    return () => {
      console.log('[GPS] Cleaning up location tracking');
      isMountedRef.current = false;
      subscription.remove();
      stopLocationTracking();
    };
  }, [startLocationTracking, stopLocationTracking]);

  // ---------------------------------------------------------------
  // 3. Fetch road route from OSRM
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!tripDetails?.pickup || !tripDetails?.dropoff) return;

    const fetchRoadRoute = async () => {
      try {
        const { pickup, dropoff } = tripDetails;
        console.log('ROUTE PICKUP:', pickup.longitude, pickup.latitude);
        console.log('ROUTE DROPOFF:', dropoff.longitude, dropoff.latitude);
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${pickup.longitude},${pickup.latitude};` +
          `${dropoff.longitude},${dropoff.latitude}` +
          `?overview=full&geometries=geojson`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Routing server error: ${response.status}`);
        const result = await response.json();
        if (result.code !== 'Ok' || !result.routes?.length) {
          throw new Error(result.message || 'No road route found.');
        }
        setRouteGeometry(result.routes[0].geometry);
        console.log('Road route loaded:', result.routes[0].distance / 1000, 'km');
        console.log('Estimated driving time:', result.routes[0].duration / 60, 'minutes');
      } catch (error) {
        console.error('Road route error:', error);
        Alert.alert(
          'Route Error',
          error instanceof Error ? error.message : 'Unable to load the road route.',
        );
      }
    };
    fetchRoadRoute();
  }, [tripDetails]);

  // ---------------------------------------------------------------
  // 4. Center camera on the trip bounds when details load
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!tripDetails?.pickup || !tripDetails?.dropoff) return;
    const centerLongitude = (tripDetails.pickup.longitude + tripDetails.dropoff.longitude) / 2;
    const centerLatitude = (tripDetails.pickup.latitude + tripDetails.dropoff.latitude) / 2;
    cameraRef.current?.flyTo({
      center: [centerLongitude, centerLatitude],
      zoom: 11.5,
      duration: 1000,
    });
  }, [tripDetails]);

  useEffect(() => {
    if (!tripDetails?.pickup || !tripDetails?.dropoff) return;

    console.log('PICKUP MARKER:', {
      longitude: tripDetails.pickup.longitude,
      latitude: tripDetails.pickup.latitude,
    });

    console.log('DROPOFF MARKER:', {
      longitude: tripDetails.dropoff.longitude,
      latitude: tripDetails.dropoff.latitude,
    });

  }, [tripDetails]);
  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        androidView="texture"
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [
              tripDetails
                ? (tripDetails.pickup.longitude + tripDetails.dropoff.longitude) / 2
                : 96.1561,
              tripDetails
                ? (tripDetails.pickup.latitude + tripDetails.dropoff.latitude) / 2
                : 16.8661,
            ],
            zoom: 11.5,
          }}
        />

        {routeGeometry && (
          <GeoJSONSource id="trip-route-source" data={routeGeometry}>
            <Layer
              id="trip-route-line"
              type="line"
              paint={{ 'line-color': '#2563EB', 'line-width': 5, 'line-opacity': 0.9 }}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            />
          </GeoJSONSource>
        )}

        {tripDetails?.pickup && (
          <Marker lngLat={[tripDetails.pickup.longitude, tripDetails.pickup.latitude]}>
            <View style={styles.pickupMarker}>
              <Text style={styles.markerText}>P</Text>
            </View>
          </Marker>
        )}

        {tripDetails?.dropoff && (
          <Marker lngLat={[tripDetails.dropoff.longitude, tripDetails.dropoff.latitude]}>
            <View style={styles.dropoffMarker}>
              <Text style={styles.markerText}>D</Text>
            </View>
          </Marker>
        )}

        {currentLocation && (
          <Marker lngLat={[currentLocation.longitude, currentLocation.latitude]}>
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationDot} />
            </View>
          </Marker>
        )}
      </Map>

      <View style={styles.debugOverlay}>
        <Text style={styles.debugText}>GPS Updates: {gpsUpdateCount}</Text>
        <Text style={styles.debugText}>Lat: {currentLocation?.latitude}</Text>
        <Text style={styles.debugText}>Lng: {currentLocation?.longitude}</Text>
      </View>

      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBackClick}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <View style={styles.locationBadge}>
          <View style={styles.greenDot} />
          <Text style={styles.locationText}>Location sharing ON</Text>
        </View>
      </View>

      <View style={styles.bottomPanel}>
        <LinearGradient
          colors={['transparent', Colors.DarkBgTop, Colors.DarkBgTop]}
          style={styles.gradient}
        >
          <View style={styles.infoCard}>
            <Text style={styles.stepLabel}>{stepText}</Text>
            <Text style={styles.locationName}>{locationName}</Text>
            <Text style={styles.address}>{address}</Text>

            <View style={styles.chipsRow}>
              <InfoChip text="1.8 km" />
              <InfoChip text="6 min" />
              <InfoChip text="REQ-1048" />
            </View>

            {/* <View style={{ height: 17 }} /> */}
            {/* <SecondaryButton text="Open Directions" onPress={onOpenDirections} /> */}
            <View style={{ height: 8 }} />
            <PrimaryButton
              text={arrivedText}
              onPress={() => {
                if (
                  !tripDetails?.cashRequestId ||
                  !Number.isInteger(tripDetails.cashRequestId)
                ) {
                  Alert.alert(
                    'Trip Not Ready',
                    'The trip response does not contain a valid cash request database ID. Please refresh the trip.',
                  );
                  return;
                }

                onArrived(tripDetails.cashRequestId, currentLocation);
              }}
            />

            <Text style={styles.shareNote}>
              Sharing stops automatically when the request is Completed or Cancelled.
            </Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const InfoChip: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.DarkBgTop },
  map: { position: 'absolute', top: 0, left: 0, right: 0, height: MAP_HEIGHT },
  pickupMarker: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#16A34A',
    borderWidth: 3, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
  },
  dropoffMarker: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#E53935',
    borderWidth: 3, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
  },
  markerText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  currentLocationMarker: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(52, 152, 219, 0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  currentLocationDot: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: '#2196F3',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  topBar: {
    position: 'absolute', top: 56, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  backArrow: { fontSize: 24, color: Colors.White, marginRight: 16 },
  locationBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.CardSurface,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  greenDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.PrimaryGreen, marginRight: 8,
  },
  locationText: { ...Typography.bodySmall, color: Colors.White },
  bottomPanel: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  gradient: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 40 },
  infoCard: {
    backgroundColor: 'rgba(30, 11, 58, 0.9)', borderWidth: 1, borderColor: Colors.CardBorder,
    borderRadius: 20, padding: 20,
  },
  stepLabel: { ...Typography.labelMedium, color: Colors.PrimaryGreen, letterSpacing: 1.5 },
  locationName: {
    ...Typography.headlineLarge, color: Colors.White, fontWeight: '700', marginTop: 8,
  },
  address: { ...Typography.bodyMedium, color: Colors.TextSecondary },
  chipsRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  chip: { backgroundColor: Colors.CardSurface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  chipText: { ...Typography.bodySmall, color: Colors.TextSecondary },
  shareNote: { ...Typography.bodySmall, color: Colors.TextDim, marginTop: 8 },
  debugOverlay: {
    position: 'absolute', top: 110, left: 16, backgroundColor: '#000',
    padding: 8, borderRadius: 8,
  },
  debugText: { color: '#fff' },
});