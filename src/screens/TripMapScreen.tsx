import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Map, Camera, Marker } from '@maplibre/maplibre-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { PrimaryButton, SecondaryButton } from '../components';
import { Colors, Typography } from '../theme';

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_HEIGHT * 0.55;

interface TripMapScreenProps {
  isPickup?: boolean;
  onBackClick: () => void;
  onOpenDirections: () => void;
  onArrived: () => void;
}

export const TripMapScreen: React.FC<TripMapScreenProps> = ({
  isPickup = true,
  onBackClick,
  onOpenDirections,
  onArrived,
}) => {
  const cameraRef = useRef(null);
  const locationName = isPickup ? 'Orchard Branch' : 'HQ Cash Centre';
  const address = isPickup ? '238 Orchard Rd, Yangon' : '1 Raffles Quay, Yangon';
  const stepText = isPickup ? 'STEP 1 OF 2 · PICKUP' : 'STEP 2 OF 2 · DROP-OFF';
  const arrivedText = isPickup ? 'Arrived at Pickup' : 'Arrived at Drop-off';

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);


  useEffect(() => {
    let watchId: number | null = null;
    let isMounted = true;

    const initializeLocation = async () => {
      if (Platform.OS !== 'android') {
        return;
      }

      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        const fineLocation =
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

        const coarseLocation =
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];

        const hasPermission =
          fineLocation === PermissionsAndroid.RESULTS.GRANTED ||
          coarseLocation === PermissionsAndroid.RESULTS.GRANTED;

        if (!hasPermission) {
          Alert.alert(
            'Location Permission Required',
            'Please allow location access to use CashRoute tracking.',
          );
          return;
        }

        console.log('Location permission granted');

        watchId = Geolocation.watchPosition(
          position => {
            if (!isMounted) return;

            const { latitude, longitude } = position.coords;

            setCurrentLocation({ latitude, longitude });

            console.log('Updated GPS:', latitude, longitude);
          },
          error => {
            console.log('GPS Error:', error.code, error.message);
          },
          {
            enableHighAccuracy: true,
            distanceFilter: 5,
            interval: 3000,
            fastestInterval: 2000,
            maximumAge: 5000,
            forceRequestLocation: true,
            showLocationDialog: true,
          },
        );
      } catch (error) {
        console.log('Location initialization error:', error);
      }
    };

    initializeLocation();

    return () => {
      isMounted = false;

      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);


  useEffect(() => {
    if (!currentLocation) return;

    cameraRef.current?.flyTo({
      center: [
        currentLocation.longitude,
        currentLocation.latitude,
      ],
      zoom: 15,
      duration: 800,
    });

  }, [currentLocation]);

  return (
    <View style={styles.container}>
      {/* Map area */}
      <Map
        style={styles.map}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        androidView="texture"
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [96.1561, 16.8661],
            zoom: 12,
          }}
        />
        {currentLocation && (
          <Marker
            lngLat={[
              currentLocation.longitude,
              currentLocation.latitude,
            ]}
          >
            <View style={styles.currentLocationMarker}>
              <View style={styles.currentLocationDot} />
            </View>
          </Marker>
        )}
      </Map>

      {/* Top bar overlay */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBackClick}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <View style={styles.locationBadge}>
          <View style={styles.greenDot} />
          <Text style={styles.locationText}>Location sharing ON</Text>
        </View>
      </View>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        <LinearGradient
          colors={['transparent', Colors.DarkBgTop, Colors.DarkBgTop]}
          style={styles.gradient}>
          <View style={styles.infoCard}>
            <Text style={styles.stepLabel}>{stepText}</Text>
            <Text style={styles.locationName}>{locationName}</Text>
            <Text style={styles.address}>{address}</Text>

            <View style={styles.chipsRow}>
              <InfoChip text="1.8 km" />
              <InfoChip text="6 min" />
              <InfoChip text="REQ-1048" />
            </View>

            <View style={{ height: 20 }} />
            <SecondaryButton text="Open Directions" onPress={onOpenDirections} />
            <View style={{ height: 12 }} />
            <PrimaryButton text={arrivedText} onPress={onArrived} />

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
  container: {
    flex: 1,
    backgroundColor: Colors.DarkBgTop,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: MAP_HEIGHT,
  },
  currentLocationMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(52, 152, 219, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  currentLocationDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  topBar: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: Colors.White,
    marginRight: 16,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.CardSurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.PrimaryGreen,
    marginRight: 8,
  },
  locationText: {
    ...Typography.bodySmall,
    color: Colors.White,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradient: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 40,
  },
  infoCard: {
    backgroundColor: 'rgba(30, 11, 58, 0.9)',
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    borderRadius: 20,
    padding: 20,
  },
  stepLabel: {
    ...Typography.labelMedium,
    color: Colors.PrimaryGreen,
    letterSpacing: 1.5,
  },
  locationName: {
    ...Typography.headlineLarge,
    color: Colors.White,
    fontWeight: '700',
    marginTop: 8,
  },
  address: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
  },
  chipsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.CardSurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
  },
  shareNote: {
    ...Typography.bodySmall,
    color: Colors.TextDim,
    marginTop: 8,
  },
});
