import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Image, TextInput } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Svg, { Path } from 'react-native-svg';
import { AuraBackground, GlassCard, TopBar, PrimaryButton } from '../components';
import { Colors, Typography } from '../theme';
import { useApp } from '../store/data';
import { useAnimatedMount } from '../hooks/useAnimatedMount';
import { apiRequest } from '../services/api';

type DeliveryPhoto = { uri: string; name: string; type: string };
const MAX_PHOTOS = 3;

interface ProofOfDeliveryScreenProps {
  onBackClick: () => void;
  onSubmitProof: () => void;
}

export const ProofOfDeliveryScreen: React.FC<ProofOfDeliveryScreenProps> = ({
  onBackClick,
  onSubmitProof,
}) => {
  const { currentTrip } = useApp();
  const [confirmed, setConfirmed] = useState(false);
  const [photos, setPhotos] = useState<DeliveryPhoto[]>([]);
  const [receiver, setReceiver] = useState('');
  const [error, setError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [paths, setPaths] = useState<string[]>([]);
  const signature = useRef<Svg>(null);
  const submitting = useRef(false);

  const card1Anim = useAnimatedMount(0, 350);
  const card3Anim = useAnimatedMount(160, 350);
  const card4Anim = useAnimatedMount(240, 350);

  const canSubmit = confirmed && photos.length > 0 && !isCapturing && !isSubmitting && !drawing;

  const takePhoto = async () => {
    setError('');
    setIsCapturing(true);
    try {
      const result = await launchCamera({ mediaType: 'photo', maxWidth: 1600, maxHeight: 1600, quality: 0.8, assetRepresentationMode: 'compatible' });
      if (result.didCancel) return;
      const photo = result.assets?.[0];
      if (!photo?.uri || !photo.type) throw new Error(result.errorMessage || 'Could not capture a photo.');
      if ((photo.fileSize ?? 0) > 4 * 1024 * 1024) throw new Error('Photo exceeds 4 MB. Please retake it.');
      const captured = { uri: photo.uri, type: photo.type, name: photo.fileName ?? 'delivery.jpg' };
      setPhotos(previous => [...previous, captured].slice(0, MAX_PHOTOS));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not open the camera.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !currentTrip || submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    setError('');
    try {
      const body = new FormData();
      body.append('confirmed_amount', currentTrip.amount.replace(/,/g, ''));
      if (receiver.trim()) body.append('receiver_name', receiver.trim());
      for (const photo of photos) body.append('photos[]', photo as unknown as Blob);
      if (paths.length) {
        const canvas = signature.current;
        if (!canvas) throw new Error('Could not capture the receiver signature.');
        const png = await new Promise<string>(resolve => canvas.toDataURL(resolve));
        if (!png) throw new Error('Could not capture the receiver signature.');
        body.append('signature_png', png);
      }
      await apiRequest(`/requests/${encodeURIComponent(currentTrip.id)}/proof-of-delivery`, { method: 'POST', body });
      onSubmitProof();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not submit proof. Please try again.');
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  if (!currentTrip) {
    return (
      <AuraBackground>
        <Text style={styles.greenLabel}>No active assignment.</Text>
        <PrimaryButton text="Go back" onPress={onBackClick} />
      </AuraBackground>
    );
  }

  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar title="Proof of delivery" onBackClick={onBackClick} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} scrollEnabled={!drawing} keyboardShouldPersistTaps="handled">
          <View style={{ height: 12 }} />

          <Animated.View style={card1Anim}>
            <GlassCard>
              <View style={styles.cardContent}>
                <Text style={styles.greenLabel}>CONFIRM RECEIVED AMOUNT</Text>
                <Text style={styles.amount}>{currentTrip.currency} {currentTrip.amount}</Text>
                <TouchableOpacity
                  style={styles.checkRow}
                  onPress={() => setConfirmed(!confirmed)}
                  activeOpacity={0.7}>
                  <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
                    {confirmed && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={styles.confirmText}>
                    I confirm the full amount was handed over
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 12 }} />

          <Animated.View style={card3Anim}>
            <GlassCard>
              <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                  <Text style={styles.sectionTitle}>Photo</Text>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
                </View>
                <View style={{ height: 12 }} />
                <View style={styles.photoRow}>
                  {photos.map((photo, index) => (
                    <View key={photo.uri}>
                      <Image source={{ uri: photo.uri }} style={styles.preview} accessibilityLabel={`Delivery photo ${index + 1}`} />
                      <TouchableOpacity disabled={isSubmitting} onPress={() => setPhotos(items => items.filter((_, i) => i !== index))}>
                        <Text style={styles.addPhotoText}>Remove photo {index + 1}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <TouchableOpacity
                      style={styles.photo2}
                      disabled={isCapturing || isSubmitting}
                      onPress={takePhoto}
                      activeOpacity={0.7}>
                      <Text style={styles.cameraIcon}>📷</Text>
                      <Text style={styles.addPhotoText}>Take photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 12 }} />

          <Animated.View style={card4Anim}>
            <GlassCard>
              <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                  <Text style={styles.sectionTitle}>Receiver signature</Text>
                  <View style={styles.optionalBadge}>
                    <Text style={styles.optionalText}>Optional</Text>
                  </View>
                </View>
                <View style={{ height: 12 }} />
                <TextInput
                  accessibilityLabel="Receiver name"
                  placeholder="Receiver name"
                  placeholderTextColor={Colors.TextSecondary}
                  value={receiver}
                  editable={!isSubmitting}
                  onChangeText={setReceiver}
                  maxLength={120}
                  style={styles.receiverInput}
                />
                <View
                  style={styles.signatureBox}
                  onStartShouldSetResponder={() => !isSubmitting}
                  onResponderGrant={({ nativeEvent: { locationX, locationY } }) => {
                    setDrawing(true);
                    setPaths(previous => [...previous, `M ${locationX} ${locationY} l 0.01 0`]);
                  }}
                  onResponderMove={({ nativeEvent: { locationX, locationY } }) => {
                    setPaths(previous => [...previous.slice(0, -1), `${previous.at(-1)} L ${locationX} ${locationY}`]);
                  }}
                  onResponderRelease={() => setDrawing(false)}
                  onResponderTerminate={() => setDrawing(false)}>
                  <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <Svg ref={signature} width="100%" height="100%">
                      {paths.map((path, index) => <Path key={index} d={path} stroke="#171717" strokeWidth={2.5} strokeLinecap="round" fill="none" />)}
                    </Svg>
                  </View>
                  {paths.length === 0 && <View pointerEvents="none"><Text style={styles.signText}>Sign here</Text></View>}
                </View>
                {paths.length > 0 && <TouchableOpacity disabled={isSubmitting} onPress={() => setPaths([])}>
                  <Text style={styles.addPhotoText}>Clear signature</Text>
                </TouchableOpacity>}
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 24 }} />
        </ScrollView>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          text={isSubmitting ? 'Submitting...' : 'Submit Proof'}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!canSubmit}
          style={{ marginBottom: 24 }}
        />
      </View>
    </AuraBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  scroll: {
    flex: 1,
  },
  cardContent: {
    padding: 20,
  },
  greenLabel: {
    ...Typography.labelMedium,
    color: Colors.PrimaryGreen,
    letterSpacing: 1.5,
  },
  amount: {
    ...Typography.displayLarge,
    color: Colors.White,
    fontWeight: '700',
    fontSize: 36,
    marginTop: 8,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.CardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: Colors.PrimaryGreen,
    borderColor: Colors.PrimaryGreen,
  },
  checkMark: {
    color: Colors.Black,
    fontSize: 14,
    fontWeight: '700',
  },
  confirmText: {
    ...Typography.bodyMedium,
    color: Colors.White,
    flex: 1,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Colors.White,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requiredBadge: {
    backgroundColor: Colors.CardSurface,
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  requiredText: {
    ...Typography.labelLarge,
    color: Colors.AccentRed,
  },
  optionalBadge: {
    backgroundColor: Colors.CardSurface,
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  optionalText: {
    ...Typography.labelLarge,
    color: Colors.TextSecondary,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photo2: {
    width: 150,
    height: 150,
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    borderRadius: 16,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  addPhotoText: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
  },
  signatureBox: {
    height: 120,
    backgroundColor: Colors.White,
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    borderRadius: 12,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signText: {
    ...Typography.bodyMedium,
    color: Colors.TextDim,
  },
  preview: { width: 104, height: 104, borderRadius: 12 },
  receiverInput: { color: Colors.White, marginBottom: 8 },
  error: { color: Colors.AccentRed, marginBottom: 8 },
});
