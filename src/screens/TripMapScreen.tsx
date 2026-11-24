import { useAppDialog } from '../components/AppDialog';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from 'react-native-geolocation-service';
import { Map, Camera, Marker, GeoJSONSource, Layer } from '@maplibre/maplibre-react-native';
import { PrimaryButton } from '../components';
import { Colors, Typography } from '../theme';
import { apiRequest } from '../services/api';
import { getToken } from '../services/authStorage';
import { useApp } from '../store/data';

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
  handoverRadius: number;
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
  const showDialog = useAppDialog();
  const { currentTrip } = useApp();
  const tripReference = currentTrip?.id;
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
  const [routeUnavailable, setRouteUnavailable] = useState(false);
  const [routeRetry, setRouteRetry] = useState(0);
  const [routeMetrics, setRouteMetrics] = useState<{ distanceKm: number; durationMin: number } | null>(null);
  const stepText = isPickup ? 'STEP 1 OF 2 · PICKUP' : 'STEP 2 OF 2 · DROP-OFF';
  const arrivedText = isPickup ? 'Arrived at Pickup' : 'Arrived at Drop-off';

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  //for calculation of the handover radius
  const getDistanceMeters = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number => {
    const earthRadius = 6371000;

    const toRadians = (degrees: number) =>
      (degrees * Math.PI) / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

    return earthRadius * 2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );
  };

  const distanceToDestination =
    currentLocation && activeLocation
      ? getDistanceMeters(
        currentLocation.latitude,
        currentLocation.longitude,
        activeLocation.latitude,
        activeLocation.longitude,
      )
      : null;

  const canArrive =
    distanceToDestination !== null &&
    activeLocation !== undefined &&
    Number.isFinite(activeLocation.handoverRadius) &&
    activeLocation.handoverRadius >= 0 &&
    distanceToDestination <= activeLocation.handoverRadius;

  // const BYPASS_ARRIVAL_RADIUS_FOR_TESTING = __DEV__;

  const [gpsUpdateCount, setGpsUpdateCount] = useState(0);

  // Refs that the GPS watcher closure can safely access without re-subscribing.
  const watchIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const isStartingRef = useRef(false);
  const hasPermissionRef = useRef(false);
  const backgroundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const lastLocationSentAtRef = useRef(0);

  // ---------------------------------------------------------------
  // 1. Fetch trip details
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!tripReference) {
      return;
    }
    const fetchTripDetails = async () => {
      try {
        const token = await getToken();
        if (!token) {
          console.log('No saved authentication token found.');
          return;
        }
        const response = await apiRequest<{ data: TripDetails }>(
          `/trips/${tripReference}`,
          { method: 'GET' },
          token,
        );
        setTripDetails(response.data);
        console.log('Trip details loaded:', JSON.stringify(response.data, null, 2));
      } catch (error) {
        console.error('Trip API error:', error);
        showDialog('Trip Error', 'Unable to load trip details.');
      }
    };
    fetchTripDetails();
  }, [showDialog, tripReference]);

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
            showDialog(
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
          showDialog(
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

          const { latitude, longitude, accuracy } = position.coords;

          setCurrentLocation({ latitude, longitude });
          setGpsUpdateCount(count => count + 1);
          console.log('[GPS] Updated GPS:', latitude, longitude);

          // Send a location ping at most once every 10 seconds.
          const nowMs = Date.now();
          if (!tripReference || nowMs - lastLocationSentAtRef.current < 10_000) {
            return;
          }

          lastLocationSentAtRef.current = nowMs;

          void (async () => {
            try {
              const token = await getToken();
              if (!token) return;
              console.log('[GPS] Sending location ping', {
                tripReference,
                latitude,
                longitude,
              });
              await apiRequest(
                `/trips/${tripReference}/location`,
                {
                  method: 'POST',
                  body: JSON.stringify({
                    latitude,
                    longitude,
                    accuracy: accuracy ?? null,
                  }),
                },
                token,
              );
              console.log('[GPS] Backend accepted location ping');
            } catch (error) {
              console.error('[GPS] Failed to save location:', error);
            }
          })();
        },
        error => {
          console.log('[GPS] ERROR:', error.code, error.message);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 0,            // receive every update; MockLoc friendly
          interval: 3000,
          fastestInterval: 2000,
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
  }, [showDialog]);

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
    setRouteGeometry(null);
    setRouteMetrics(null);
    setRouteUnavailable(false);
    if (!tripDetails?.pickup || !tripDetails?.dropoff) return;

    const { pickup, dropoff } = tripDetails;
    const coordinates =
      `${pickup.longitude},${pickup.latitude};${dropoff.longitude},${dropoff.latitude}`;
    const path = `/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
    const routeUrls = [
      `https://router.project-osrm.org${path}`,
      `https://routing.openstreetmap.de/routed-car${path}`,
    ];
    if (Platform.OS === 'android') {
      routeUrls.unshift(
        `http://127.0.0.1:8081/cashroute-dev/road-route?coordinates=${encodeURIComponent(coordinates)}`,
      );
    }
    let cancelled = false;
    let controller: AbortController | undefined;

    const fetchRoadRoute = async () => {
      for (const routeUrl of routeUrls) {
        if (cancelled) return;
        const request = new AbortController();
        controller = request;
        const timeout = setTimeout(() => request.abort(), 8000);

        try {
          const response = await fetch(routeUrl, { signal: request.signal });
          const result = await response.json();
          if (cancelled) return;

          if (result.code === 'NoRoute' || result.code === 'NoSegment') {
            break;
          }

          const route = result.routes?.[0];
          const geometry = route?.geometry;
          if (response.ok && result.code === 'Ok' && geometry?.type === 'LineString') {
            setRouteGeometry(geometry);
            if (Number.isFinite(route.distance) && Number.isFinite(route.duration)) {
              setRouteMetrics({ distanceKm: route.distance / 1000, durationMin: route.duration / 60 });
            }
            return;
          }
        } catch {
          // Try the alternate server address if the request fails.
        } finally {
          clearTimeout(timeout);
        }
      }

      if (!cancelled) setRouteUnavailable(true);
    };

    fetchRoadRoute();
    return () => {
      cancelled = true;
      controller?.abort();
    };
  }, [tripDetails, routeRetry]);

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
  //for arrival pickup dropoff button 
  const handleArrivedPress = () => {
    if (!currentLocation || !activeLocation) {
      showDialog(
        'Location Not Ready',
        'Please wait for your current location and destination to load.',
      );
      return;
    }

    if (!canArrive) {
      showDialog(
        isPickup ? 'Not at Pickup Location' : 'Not at Drop-off Location',
        `Please go to the ${isPickup ? 'pickup' : 'drop-off'} location before continuing.`,
      );
      return;
    }

    if (
      !tripDetails?.cashRequestId ||
      !Number.isInteger(tripDetails.cashRequestId)
    ) {
      showDialog(
        'Trip Not Ready',
        'The trip response does not contain a valid cash request database ID.',
      );
      return;
    }

    onArrived(tripDetails.cashRequestId, currentLocation);
  };
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
              id="trip-route-outline"
              type="line"
              paint={{ 'line-color': Colors.White, 'line-width': 9 }}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            />
            <Layer
              id="trip-route-line"
              type="line"
              paint={{ 'line-color': Colors.PurpleAccent, 'line-width': 5 }}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            />
          </GeoJSONSource>
        )}

        {tripDetails?.pickup && (
          <Marker lngLat={[tripDetails.pickup.longitude, tripDetails.pickup.latitude]}>
            <View style={styles.pickupMarker}>
              <Text style={[styles.markerText, styles.pickupMarkerText]}>P</Text>
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
        <TouchableOpacity onPress={onBackClick} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={styles.backArrow}>{'‹'}</Text>
        </TouchableOpacity>
        <View style={styles.locationBadge}>
          <View style={styles.greenDot} />
          <Text style={styles.locationText}>Location sharing ON</Text>
        </View>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.bottomPanel}>
        <View style={styles.infoCard}>
          <Text style={styles.stepLabel}>{stepText}</Text>
          <Text style={styles.locationName}>{locationName}</Text>
          <Text style={styles.address}>{address}</Text>
          {routeUnavailable && (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setRouteRetry(retry => retry + 1)}
            >
              <Text style={styles.address}>Road route unavailable. Tap to retry.</Text>
            </TouchableOpacity>
          )}

          <View style={styles.chipsRow}>
            {routeMetrics && (
              <>
                <InfoChip text={routeMetrics.distanceKm.toFixed(1) + ' km'} />
                <InfoChip text={Math.ceil(routeMetrics.durationMin) + ' min'} />
              </>
            )}
            {tripReference && <InfoChip text={tripReference} />}
          </View>

          {/* button */}
          <View style={{ height: 12 }} />
          <PrimaryButton
            text={arrivedText}
            onPress={handleArrivedPress}
          />

          <Text style={styles.shareNote}>
            Sharing stops automatically when the request is Completed or Cancelled.
          </Text>
        </View>
      </SafeAreaView>
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
  map: { flex: 1, backgroundColor: '#EDF0E9' },
  pickupMarker: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.PrimaryGreen,
    borderWidth: 3, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
  },
  dropoffMarker: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.PurpleAccent,
    borderWidth: 3, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
  },
  pickupMarkerText: { color: '#1A0B2E' },
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
  backButton: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1,
    borderColor: Colors.CardBorder, backgroundColor: Colors.DarkBgTop,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  backArrow: { fontSize: 26, lineHeight: 29, color: Colors.White },
  locationBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.DarkBgTop,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.CardBorder,
  },
  greenDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.PrimaryGreen, marginRight: 8,
  },
  locationText: { ...Typography.bodySmall, color: Colors.White },
  bottomPanel: { backgroundColor: Colors.DarkBgBottom },
  infoCard: {
    backgroundColor: '#2A1643', borderWidth: 1, borderColor: Colors.CardBorder,
    borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 22,
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