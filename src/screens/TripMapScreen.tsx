import { useAppDialog } from '../components/AppDialog';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
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
import { useIsFocused } from '@react-navigation/native';
import { ApiError, apiRequest } from '../services/api';
import { getToken } from '../services/authStorage';
import { useApp } from '../store/data';

// How long to wait after the app goes to background before actually stopping GPS.
// This prevents transient state changes (permission dialogs, floating windows,
// MockLoc overlays, etc.) from killing the watcher.
const BACKGROUND_STOP_DELAY_MS = 8000;
// Keep the three colors in sync with the admin portal LiveMap.
const MAP_COLORS = { route: '#2563eb', pickup: '#15803d', dropoff: '#dc2626' };

interface TripLocation {
  name: string;
  code: string;
  address: string;
  latitude: number;
  longitude: number;
  handoverRadius: number;
  contactName?: string | null;
  contactPhone?: string | null;
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
  const { currentTrip, refreshData } = useApp();
  const isFocused = useIsFocused();
  const uploadTripReference = !isPickup && isFocused && currentTrip?.status === 'In Transit'
    ? currentTrip.id
    : null;
  const uploadTripRef = useRef<string | null>(null);

  useEffect(() => {
    uploadTripRef.current = uploadTripReference;
    return () => { uploadTripRef.current = null; };
  }, [uploadTripReference]);
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
  const [selectedStop, setSelectedStop] = useState<'pickup' | 'dropoff' | null>(null);
  const selectedLocation = selectedStop ? tripDetails?.[selectedStop] : null;
  const selectedPhone = selectedLocation?.contactPhone?.replace(/[^+\d]/g, '');
  useEffect(() => setSelectedStop(null), [tripReference, isPickup]);
  const locationName = activeLocation?.name ?? 'Loading destination...';
  const address = activeLocation?.address ?? '';
  const [routeGeometry, setRouteGeometry] = useState<RouteGeometry | null>(null);
  const [routeUnavailable, setRouteUnavailable] = useState(false);
  const [routeRetry, setRouteRetry] = useState(0);
  const [routeOrigin, setRouteOrigin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routePing, setRoutePing] = useState(0);
  const [gpsUploadFailed, setGpsUploadFailed] = useState(false);
  const lastRouteSample = useRef(0);

  useEffect(() => {
    lastRouteSample.current = 0;
    setRouteOrigin(null);
    setGpsUploadFailed(false);
  }, [tripReference, isPickup]);
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

          console.log('[GPS] Updated GPS:', latitude, longitude);

          // Send a location ping at most once every 10 seconds.
          const activeTripReference = uploadTripRef.current;
          const nowMs = Date.now();
          if (isPickup && nowMs - lastRouteSample.current >= 8000) {
            lastRouteSample.current = nowMs;
            setRouteOrigin(previous => {
              const next = { latitude: Number(latitude.toFixed(5)), longitude: Number(longitude.toFixed(5)) };
              return previous?.latitude === next.latitude && previous.longitude === next.longitude ? previous : next;
            });
          }
          if (!activeTripReference || nowMs - lastLocationSentAtRef.current < 10_000) {
            return;
          }

          lastLocationSentAtRef.current = nowMs;

          void (async () => {
            try {
              const token = await getToken();
              if (!token || uploadTripRef.current !== activeTripReference) return;
              console.log('[GPS] Sending location ping', {
                tripReference: activeTripReference,
                latitude,
                longitude,
              });
              await apiRequest(
                `/trips/${encodeURIComponent(activeTripReference)}/location`,
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
              if (uploadTripRef.current === activeTripReference) {
                setGpsUploadFailed(false);
                setRoutePing(value => value + 1);
              }
            } catch (error) {
              if (error instanceof ApiError && error.status === 409) {
                if (uploadTripRef.current === activeTripReference) {
                  void refreshData();
                }
                return;
              }
              if (uploadTripRef.current === activeTripReference) setGpsUploadFailed(true);
              console.warn('[GPS] Failed to save location:', error);
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
  }, [showDialog, refreshData, isPickup]);

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

  // Pickup uses a local GPS sample. During delivery both apps route from the
  // same position last saved by Laravel.
  useEffect(() => {
    setRouteGeometry(null);
    setRouteMetrics(null);
    setRouteUnavailable(false);
    if (!tripReference || !isFocused || !tripDetails || (isPickup && !routeOrigin)) return;

    const controller = new AbortController();
    const query = isPickup && routeOrigin
      ? '?latitude=' + routeOrigin.latitude + '&longitude=' + routeOrigin.longitude
      : '';
    const loadRoute = async () => {
      try {
        const { data } = await apiRequest<{
          data: { geometry: RouteGeometry; distance: number; duration: number } | null;
        }>('/trips/' + encodeURIComponent(tripReference) + '/route' + query, { signal: controller.signal });
        if (controller.signal.aborted || !data) return;
        setRouteGeometry(data.geometry);
        setRouteMetrics({ distanceKm: data.distance / 1000, durationMin: data.duration / 60 });
      } catch {
        if (!controller.signal.aborted) setRouteUnavailable(true);
      }
    };
    void loadRoute();
    return () => controller.abort();
  }, [tripReference, tripDetails, isFocused, isPickup, routeOrigin, routePing, routeRetry]);


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
  const arrivalPending = useRef(false);
  const [isSavingArrival, setIsSavingArrival] = useState(false);
  const handleArrivedPress = async () => {
    if (arrivalPending.current) return;
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

    arrivalPending.current = true;
    setIsSavingArrival(true);
    try {
      await apiRequest<void>(`/trips/${encodeURIComponent(tripDetails.id)}/arrival`, {
        method: 'POST',
        body: JSON.stringify({
          stage: isPickup ? 'pickup' : 'dropoff',
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        }),
      });
      if (isMountedRef.current) onArrived(tripDetails.cashRequestId, currentLocation);
    } catch (error) {
      if (isMountedRef.current) {
        showDialog('Unable to record arrival', error instanceof Error ? error.message : 'Please try again.');
      }
    } finally {
      arrivalPending.current = false;
      if (isMountedRef.current) setIsSavingArrival(false);
    }
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
              paint={{ 'line-color': MAP_COLORS.route, 'line-width': 5 }}
              layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            />
          </GeoJSONSource>
        )}

        {tripDetails?.pickup && (
          <Marker lngLat={[tripDetails.pickup.longitude, tripDetails.pickup.latitude]}
            accessibilityRole="button" accessibilityLabel={'Pickup: ' + tripDetails.pickup.name}
            onPress={() => setSelectedStop(stop => stop === 'pickup' ? null : 'pickup')}>
            <View style={styles.pickupMarker}>
              <Text style={styles.markerText}>P</Text>
            </View>
          </Marker>
        )}

        {tripDetails?.dropoff && (
          <Marker lngLat={[tripDetails.dropoff.longitude, tripDetails.dropoff.latitude]}
            accessibilityRole="button" accessibilityLabel={'Drop-off: ' + tripDetails.dropoff.name}
            onPress={() => setSelectedStop(stop => stop === 'dropoff' ? null : 'dropoff')}>
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
        {selectedLocation && (
          <Marker
            key={selectedStop}
            lngLat={[selectedLocation.longitude, selectedLocation.latitude]}
            anchor="bottom"
            offset={[0, -20]}>
            <View style={styles.pinPopup}>
              <View style={styles.popupHeader}>
                <Text style={styles.popupLabel}>{selectedStop === 'pickup' ? 'Pickup' : 'Drop-off'}</Text>
                <TouchableOpacity style={styles.popupClose} accessibilityRole="button"
                  accessibilityLabel="Close stop details" onPress={() => setSelectedStop(null)}>
                  <Text style={styles.popupTitle}>×</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.popupTitle}>{selectedLocation.name}</Text>
              <Text style={styles.popupBody}>{selectedLocation.address}</Text>
              {!!selectedLocation.contactName && <Text style={styles.popupBody}>{selectedLocation.contactName}</Text>}
              {selectedPhone && /^\+?\d+$/.test(selectedPhone) && (
                <TouchableOpacity style={styles.stopAction} accessibilityRole="button"
                  onPress={() => void Linking.openURL('tel:' + selectedPhone).catch(() =>
                    showDialog('Unable to open dialer', selectedLocation.contactPhone ?? ''))}>
                  <Text style={styles.stopActionText}>Call {selectedLocation.contactPhone}</Text>
                </TouchableOpacity>
              )}
              <View pointerEvents="none" style={styles.popupTip} />
            </View>
          </Marker>
        )}
      </Map>



      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBackClick} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={styles.backArrow}>{'‹'}</Text>
        </TouchableOpacity>
        <View style={styles.locationBadge}>
          <View style={styles.greenDot} />
          <Text style={styles.locationText}>{currentLocation ? (uploadTripReference ? (gpsUploadFailed ? 'GPS upload failed' : 'Location sharing on') : 'GPS on device') : 'Waiting for GPS'}</Text>
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
            loading={isSavingArrival}
            onPress={handleArrivedPress}
          />

          <Text style={styles.shareNote}>Tap a map pin to see stop details.</Text>
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
    width: 34, height: 34, borderRadius: 17, backgroundColor: MAP_COLORS.pickup,
    borderWidth: 3, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center',
  },
  dropoffMarker: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: MAP_COLORS.dropoff,
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
  pinPopup: {
    width: 218, paddingHorizontal: 13, paddingBottom: 11,
    borderRadius: 14, backgroundColor: Colors.White, elevation: 4,
  },
  popupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  popupClose: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: -8 },
  popupLabel: { ...Typography.labelMedium, color: '#5B218D' },
  popupTitle: { ...Typography.titleMedium, color: '#24123D', fontWeight: '700' },
  popupBody: { ...Typography.bodySmall, color: '#54436B', marginTop: 3 },
  popupTip: {
    position: 'absolute', bottom: -6, left: '50%', marginLeft: -6,
    width: 12, height: 12, transform: [{ rotate: '45deg' }], backgroundColor: Colors.White,
  },
  stopAction: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  stopActionText: { ...Typography.bodySmall, color: '#5B218D', fontWeight: '600' },
});