import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, {
  Line,
  Circle,
  Path,
  Text as SvgText,
} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { PrimaryButton, SecondaryButton } from '../components';
import { Colors, Typography } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
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
  const locationName = isPickup ? 'Orchard Branch' : 'HQ Cash Centre';
  const address = isPickup ? '238 Orchard Rd, Yangon' : '1 Raffles Quay, Yangon';
  const stepText = isPickup ? 'STEP 1 OF 2 · PICKUP' : 'STEP 2 OF 2 · DROP-OFF';
  const arrivedText = isPickup ? 'Arrived at Pickup' : 'Arrived at Drop-off';

  const w = SCREEN_WIDTH;
  const h = MAP_HEIGHT;

  // Route points
  const currentX = w * 0.25;
  const currentY = h * 0.72;
  const pointAX = w * 0.45;
  const pointAY = h * 0.48;
  const pointBX = w * 0.75;
  const pointBY = h * 0.18;

  // Cubic bezier control points for solid route
  const solidC1x = currentX + w * 0.05;
  const solidC1y = currentY - h * 0.1;
  const solidC2x = pointAX - w * 0.05;
  const solidC2y = pointAY + h * 0.1;

  // Cubic bezier control points for dashed route
  const dashC1x = pointAX + w * 0.08;
  const dashC1y = pointAY - h * 0.08;
  const dashC2x = pointBX - w * 0.08;
  const dashC2y = pointBY + h * 0.1;

  return (
    <View style={styles.container}>
      {/* Map area */}
      <Svg width={w} height={h} style={styles.map}>
        {/* Street grid - horizontal */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <Line
            key={`h${i}`}
            x1={0}
            y1={(h * i) / 9}
            x2={w}
            y2={(h * i) / 9}
            stroke="#2A1650"
            strokeWidth={1.5}
          />
        ))}
        {/* Street grid - vertical */}
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Line
            key={`v${i}`}
            x1={(w * i) / 7}
            y1={0}
            x2={(w * i) / 7}
            y2={h}
            stroke="#2A1650"
            strokeWidth={1.5}
          />
        ))}
        {/* Diagonal streets */}
        <Line x1={0} y1={h * 0.7} x2={w} y2={h * 0.15} stroke="#2A1650" strokeWidth={1.5} />
        <Line x1={0} y1={h * 0.35} x2={w * 0.7} y2={h} stroke="#2A1650" strokeWidth={1.5} />

        {/* Solid green route: current -> A */}
        <Path
          d={`M${currentX},${currentY} C${solidC1x},${solidC1y} ${solidC2x},${solidC2y} ${pointAX},${pointAY}`}
          stroke={Colors.PrimaryGreen}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />

        {/* Dashed route: A -> B */}
        <Path
          d={`M${pointAX},${pointAY} C${dashC1x},${dashC1y} ${dashC2x},${dashC2y} ${pointBX},${pointBY}`}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="16,12"
          fill="none"
        />

        {/* Current location - blue dot */}
        <Circle cx={currentX} cy={currentY} r={14} fill={Colors.BlueDot} />
        <Circle cx={currentX} cy={currentY} r={7} fill={Colors.White} />

        {/* Point A - green marker */}
        <Circle cx={pointAX} cy={pointAY} r={24} fill="rgba(150,215,76,0.2)" />
        <Circle cx={pointAX} cy={pointAY} r={20} fill="none" stroke={Colors.PrimaryGreen} strokeWidth={3} />
        <Circle cx={pointAX} cy={pointAY} r={14} fill={Colors.PrimaryGreen} />
        <SvgText
          x={pointAX}
          y={pointAY + 5}
          textAnchor="middle"
          fill={Colors.Black}
          fontSize={12}
          fontWeight="bold">
          A
        </SvgText>

        {/* Point B - purple marker */}
        <Circle cx={pointBX} cy={pointBY} r={14} fill={Colors.PurpleAccent} />
        <SvgText
          x={pointBX}
          y={pointBY + 5}
          textAnchor="middle"
          fill={Colors.White}
          fontSize={12}
          fontWeight="bold">
          B
        </SvgText>
      </Svg>

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
