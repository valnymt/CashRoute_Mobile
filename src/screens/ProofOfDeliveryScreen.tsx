import React, { useEffect, useRef, useState } from 'react';
import {
  Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View, type GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera } from 'react-native-image-picker';
import Svg, { Path } from 'react-native-svg';
import { AuraBackground, GlassCard, PrimaryButton, TopBar } from '../components';
import { apiRequest } from '../services/api';
import { useApp } from '../store/data';
import { Colors, Typography } from '../theme';

type DeliveryPhoto = { uri: string; name: string; type: string };
type Point = { x: number; y: number };
const SIGNATURE_SIZE = 320;

interface ProofOfDeliveryScreenProps {
  onBackClick: () => void;
  onSubmitProof: () => void;
}

export function ProofOfDeliveryScreen({ onBackClick, onSubmitProof }: ProofOfDeliveryScreenProps) {
  const { currentTrip } = useApp();
  const [confirmed, setConfirmed] = useState(false);
  const [photo, setPhoto] = useState<DeliveryPhoto | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [receiver, setReceiver] = useState('');
  const [error, setError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [signaturePath, setSignaturePath] = useState('');
  const [activePath, setActivePath] = useState('');
  const signature = useRef<Svg>(null);
  const padWidth = useRef(SIGNATURE_SIZE);
  const stroke = useRef<{ origin: Point; last: Point; path: string; moved: boolean } | null>(null);
  const frame = useRef<number | null>(null);
  const submitting = useRef(false);
  const canSubmit = confirmed && !!photo && !isCapturing && !isSubmitting && !drawing;

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  const pointFor = (x: number, y: number): Point => ({
    x: Math.round(Math.max(0, Math.min(SIGNATURE_SIZE, x * SIGNATURE_SIZE / padWidth.current))),
    y: Math.round(Math.max(0, Math.min(SIGNATURE_SIZE, y * SIGNATURE_SIZE / padWidth.current))),
  });

  const startStroke = ({ nativeEvent }: GestureResponderEvent) => {
    const { pageX, pageY, locationX, locationY } = nativeEvent;
    const point = pointFor(locationX, locationY);
    stroke.current = {
      origin: { x: pageX - locationX, y: pageY - locationY },
      last: point,
      path: 'M ' + point.x + ' ' + point.y,
      moved: false,
    };
    setDrawing(true);
  };

  const moveStroke = ({ nativeEvent }: GestureResponderEvent) => {
    const current = stroke.current;
    if (!current) return;
    const next = pointFor(nativeEvent.pageX - current.origin.x, nativeEvent.pageY - current.origin.y);
    if (Math.hypot(next.x - current.last.x, next.y - current.last.y) < 2) return;
    current.path += ' L ' + next.x + ' ' + next.y;
    current.last = next;
    current.moved = true;
    if (frame.current === null) {
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        setActivePath(stroke.current?.path ?? '');
      });
    }
  };

  const finishStroke = () => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    const finished = stroke.current;
    stroke.current = null;
    if (finished?.moved) setSignaturePath(svgPath => svgPath + ' ' + finished.path);
    setActivePath('');
    setDrawing(false);
  };

  const takePhoto = async () => {
    if (isCapturing || isSubmitting) return;
    setError('');
    setIsCapturing(true);
    try {
      const result = await launchCamera({ mediaType: 'photo', maxWidth: 1600, maxHeight: 1600, quality: 0.8, assetRepresentationMode: 'compatible' });
      if (result.didCancel) return;
      const asset = result.assets?.[0];
      if (!asset?.uri || !asset.type) throw new Error(result.errorMessage || 'Could not capture a photo.');
      if ((asset.fileSize ?? 0) > 4 * 1024 * 1024) throw new Error('Photo exceeds 4 MB. Please retake it.');
      setPhoto({ uri: asset.uri, type: asset.type, name: asset.fileName ?? 'delivery.jpg' });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not open the camera.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !currentTrip || !photo || submitting.current || stroke.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    setError('');
    try {
      const body = new FormData();
      body.append('confirmed_amount', currentTrip.amount.replace(/,/g, ''));
      if (receiver.trim()) body.append('receiver_name', receiver.trim());
      body.append('photos[]', photo as unknown as Blob);
      if (signaturePath) {
        const canvas = signature.current;
        if (!canvas) throw new Error('Could not prepare the signature.');
        const png = await new Promise<string>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Could not prepare the signature. Try submitting again.')), 5000);
          canvas.toDataURL(image => {
            clearTimeout(timer);
            if (image) resolve(image);
            else reject(new Error('Could not prepare the signature.'));
          }, { width: SIGNATURE_SIZE, height: SIGNATURE_SIZE });
        });
        body.append('signature_png', png);
      }
      await apiRequest('/requests/' + encodeURIComponent(currentTrip.id) + '/proof-of-delivery', { method: 'POST', body });
      onSubmitProof();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not submit proof. Please try again.');
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <AuraBackground>
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <TopBar title="Proof of delivery" onBackClick={onBackClick} />
          </View>
          {currentTrip ? (
            <>
              <ScrollView style={styles.fill} contentContainerStyle={styles.content}
                scrollEnabled={!drawing} keyboardShouldPersistTaps="handled">
                <GlassCard style={styles.amountCard}>
                  <Text style={styles.muted}>Amount handed over · {currentTrip.id}</Text>
                  <Text style={styles.amount}>{currentTrip.currency} {currentTrip.amount}</Text>
                  <Pressable style={styles.checkRow} accessibilityRole="checkbox"
                    accessibilityState={{ checked: confirmed, disabled: isSubmitting }}
                    disabled={isSubmitting} onPress={() => setConfirmed(value => !value)}>
                    <View style={[styles.checkbox, confirmed && styles.checked]}>
                      {confirmed && <Icon kind="check" color={Colors.Black} />}
                    </View>
                    <Text style={styles.body}>I confirm the full amount was handed over.</Text>
                  </Pressable>
                </GlassCard>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.title}>Delivery photo</Text>
                    <Text style={styles.muted}>Required</Text>
                  </View>
                  {photo ? (
                    <View>
                      <Pressable accessibilityRole="button" accessibilityLabel="View delivery photo full screen"
                        onPress={() => setPreviewOpen(true)}>
                        <Image source={{ uri: photo.uri }} style={styles.preview} />
                      </Pressable>
                      <Pressable style={styles.imageClose} accessibilityRole="button" accessibilityLabel="Remove delivery photo"
                        disabled={isSubmitting} onPress={() => setPhoto(null)}>
                        <Icon kind="close" color={Colors.White} />
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable accessibilityRole="button" style={styles.camera}
                      disabled={isCapturing || isSubmitting} onPress={() => void takePhoto()}>
                      <Icon kind="camera" color={Colors.PrimaryGreen} />
                      <Text style={styles.action}>{isCapturing ? 'Opening camera…' : 'Take delivery photo'}</Text>
                    </Pressable>
                  )}
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.title}>Receiver signature</Text>
                    <Text style={styles.muted}>Optional</Text>
                  </View>
                  <TextInput accessibilityLabel="Receiver name" placeholder="Receiver name"
                    placeholderTextColor={Colors.TextSecondary} style={styles.input}
                    editable={!isSubmitting} value={receiver} onChangeText={setReceiver} maxLength={120} />
                  <View style={styles.paper}
                    onLayout={event => { padWidth.current = Math.max(1, event.nativeEvent.layout.width); }}>
                    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                      <Svg ref={signature} width="100%" height="100%" viewBox="0 0 320 320">
                        <Path d={signaturePath} stroke="#251630" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        <Path d={activePath} stroke="#251630" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </Svg>
                    </View>
                    {!signaturePath && !activePath && (
                      <View pointerEvents="none" style={styles.signGuide}>
                        <View style={styles.guideLine} />
                        <Text style={styles.guideText}>Sign here</Text>
                      </View>
                    )}
                    <View style={StyleSheet.absoluteFill}
                      onStartShouldSetResponder={() => !isSubmitting}
                      onResponderTerminationRequest={() => false}
                      onResponderGrant={startStroke} onResponderMove={moveStroke}
                      onResponderRelease={finishStroke} onResponderTerminate={finishStroke} />
                    {!!signaturePath && !drawing && (
                      <Pressable style={styles.clearSignature} accessibilityRole="button" accessibilityLabel="Clear signature"
                        disabled={isSubmitting} onPress={() => setSignaturePath('')}>
                        <Icon kind="close" color="#3D2851" />
                      </Pressable>
                    )}
                  </View>
                </View>
              </ScrollView>
              <View style={styles.footer}>
                {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
                <PrimaryButton text={isSubmitting ? 'Submitting…' : 'Submit proof'}
                  onPress={() => void handleSubmit()} loading={isSubmitting} disabled={!canSubmit} />
              </View>
            </>
          ) : (
            <Text style={styles.empty}>No active assignment.</Text>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Modal visible={previewOpen && !!photo} onRequestClose={() => setPreviewOpen(false)} animationType="fade">
        <SafeAreaView style={styles.photoViewer}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close delivery photo"
            style={styles.viewerClose} onPress={() => setPreviewOpen(false)}>
            <Icon kind="close" color={Colors.White} />
          </Pressable>
          {photo && <Image source={{ uri: photo.uri }} style={styles.fullPhoto} resizeMode="contain"
            accessibilityLabel="Delivery photo" />}
        </SafeAreaView>
      </Modal>
    </AuraBackground>
  );
}

function Icon({ kind, color }: { kind: 'camera' | 'check' | 'close'; color: string }) {
  const paths = {
    camera: 'M3 7h4l2-3h6l2 3h4v13H3z M15.5 13a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z',
    check: 'm5 12 4 4L19 6',
    close: 'M6 6l12 12M18 6L6 18',
  };
  return <Svg width={21} height={21} viewBox="0 0 24 24">
    <Path d={paths[kind]} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  fill: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, gap: 24 },
  amountCard: { padding: 18, borderRadius: 18, gap: 8 },
  amount: { ...Typography.headlineLarge, color: Colors.White, fontWeight: '700' },
  checkRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48, gap: 10 },
  checkbox: { width: 25, height: 25, borderRadius: 7, borderWidth: 1, borderColor: Colors.TextSecondary, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: Colors.PrimaryGreen, borderColor: Colors.PrimaryGreen },
  body: { ...Typography.bodyMedium, color: Colors.White, flex: 1 },
  muted: { ...Typography.bodySmall, color: Colors.TextSecondary },
  section: { gap: 11 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { ...Typography.titleMedium, color: Colors.White, fontWeight: '700', flexShrink: 1 },
  camera: { minHeight: 78, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    borderWidth: 1, borderColor: Colors.CardBorder, borderStyle: 'dashed', borderRadius: 16, backgroundColor: Colors.CardSurface },
  action: { ...Typography.bodyMedium, color: Colors.PrimaryGreen, fontWeight: '600' },
  preview: { width: '100%', height: 170, borderRadius: 16 },
  imageClose: { position: 'absolute', top: 8, right: 8, width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.Black, alignItems: 'center', justifyContent: 'center' },
  input: { ...Typography.bodyMedium, minHeight: 48, color: Colors.White, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.CardBorder, paddingHorizontal: 13, backgroundColor: Colors.CardSurface },
  paper: { width: '100%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: '#FAF8F4' },
  clearSignature: { position: 'absolute', right: 7, top: 7, width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#ECE6F1', alignItems: 'center', justifyContent: 'center' },
  signGuide: { position: 'absolute', bottom: '26%', left: 26, right: 26, gap: 8 },
  guideLine: { height: 1, backgroundColor: '#C8BED0' },
  guideText: { ...Typography.bodySmall, color: '#5D4F68', textAlign: 'center' },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: Colors.CardBorder },
  empty: { ...Typography.bodyMedium, color: Colors.TextSecondary, padding: 20 },
  error: { ...Typography.bodySmall, color: Colors.AccentRed, marginBottom: 8 },
  photoViewer: { flex: 1, backgroundColor: Colors.Black },
  viewerClose: { alignSelf: 'flex-end', padding: 14, margin: 8 },
  fullPhoto: { flex: 1, width: '100%' },
});
