import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Image } from 'react-native';
import { AuraBackground, GlassCard, TopBar, PrimaryButton, } from '../components';
import { useAppDialog } from '../components/AppDialog';
import { launchCamera, launchImageLibrary, type ImagePickerResponse, } from 'react-native-image-picker';
import SignatureCanvas from 'react-native-signature-canvas';
import { Colors, Typography } from '../theme';
import { useApp } from '../store/data';

interface ProofOfDeliveryScreenProps {
  onBackClick: () => void;
  onSubmitProof: (proof: {
    photoUri: string;
    signatureDataUrl: string | null;
  }) => Promise<void>;
}

export const ProofOfDeliveryScreen: React.FC<ProofOfDeliveryScreenProps> = ({
  onBackClick,
  onSubmitProof,
}) => {
  const { currentTrip } = useApp();

  const [confirmed, setConfirmed] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signatureRef = useRef<any>(null);

  const canSubmit = confirmed && !!photoUri;

  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) return;

    if (response.errorCode) {
      Alert.alert(
        'Photo error',
        response.errorMessage ?? 'Could not select the photo.',
      );
      return;
    }

    const uri = response.assets?.[0]?.uri;
    if (uri) setPhotoUri(uri);
  };

  const takePhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        saveToPhotos: true,
      },
      handleImagePickerResponse,
    );
  };

  const choosePhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      handleImagePickerResponse,
    );
  };

  const chooseSignatureImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      (response) => {
        if (response.didCancel) return;

        if (response.errorCode) {
          Alert.alert(
            'Signature image error',
            response.errorMessage ?? 'Could not select the image.',
          );
          return;
        }

        const uri = response.assets?.[0]?.uri;
        if (uri) setSignatureDataUrl(uri);
      },
    );
  };

  const handleSignatureOK = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmitProof({
        photoUri: photoUri!,
        signatureDataUrl,
      });
    } catch (error) {
      Alert.alert('Submission failed', 'Could not submit proof of delivery.');
    } finally {
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
  const { showDialog } = useAppDialog();

  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar title="Proof of delivery" onBackClick={onBackClick} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={{ height: 12 }} />

          <View style={styles.card}>
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
          </View>

          <View style={{ height: 12 }} />

          {/* <Animated.View style={card2Anim}>
            <GlassCard>
              <View style={styles.cardContent}>
                <Text style={styles.sectionTitle}>Denominations (provided)</Text>
                <View style={{ height: 12 }} />
                <DenominationRow text="10k x 15" />
                <View style={{ height: 8 }} />
                <DenominationRow text="5k x 20" />
              </View>
            </GlassCard>
          </Animated.View> */}

          <View style={{ height: 12 }} />

          <View style={styles.card}>
            <GlassCard>
              <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                  <Text style={styles.sectionTitle}>Photo</Text>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
                </View>

                {/* photo to upload */}
                <View style={{ height: 12 }} />
                <View style={styles.photoRow}>
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                  ) : (
                    <TouchableOpacity
                      style={styles.photo2}
                      onPress={takePhoto}
                      activeOpacity={0.7}>
                      <Text style={styles.cameraIcon}>📷</Text>
                      <Text style={styles.addPhotoText}>Take photo</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.photo2}
                    onPress={choosePhoto}
                    activeOpacity={0.7}>
                    <Text style={styles.addPhotoText}>
                      {photoUri ? 'Choose another' : '+ Gallery'}
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>
            </GlassCard>
          </View>

          <View style={{ height: 12 }} />

          <View style={styles.card}>
            <GlassCard>
              <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                  <Text style={styles.sectionTitle}>Receiver signature</Text>
                  <View style={styles.optionalBadge}>
                    <Text style={styles.optionalText}>Optional</Text>
                  </View>
                </View>

                {/* signature box */}
                <View style={{ height: 12 }} />
                <View style={styles.signatureBox}>
                  <SignatureCanvas
                    ref={signatureRef}
                    onOK={handleSignatureOK}
                    onEmpty={() =>
                      showDialog(
                        'Signature required',
                        'Please draw a signature first.',
                      )
                    }
                    descriptionText="Sign above"
                    clearText="Clear"
                    confirmText="Use signature"
                    webStyle={`
                      .m-signature-pad { box-shadow: none; border: none; }
                      .m-signature-pad--body { border: none; }
                      .m-signature-pad--footer { display: flex; }
                      body, html { width: 100%; height: 100%; }
                    `}
                  />
                </View>

                <View style={styles.signatureActions}>
                  <TouchableOpacity
                    style={styles.signatureButton}
                    onPress={() => signatureRef.current?.readSignature()}>
                    <Text style={styles.addPhotoText}>Use drawn signature</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.signatureButton}
                    onPress={chooseSignatureImage}>
                    <Text style={styles.addPhotoText}>Upload signature image</Text>
                  </TouchableOpacity>
                </View>

                {signatureDataUrl && (
                  <Text style={styles.signatureSavedText}>Signature added ✓</Text>
                )}
              </View>
            </GlassCard>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

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

const DenominationRow: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.denomRow}>
    <Text style={styles.checkIcon}>☑</Text>
    <Text style={styles.denomText}>{text}</Text>
  </View>
);

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
  photoPreview: {
    width: 150,
    height: 150,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  signatureActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  signatureButton: {
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  signatureSavedText: {
    ...Typography.bodySmall,
    color: Colors.PrimaryGreen,
    marginTop: 8,
  },
  signatureBox: {
    height: 180,
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    borderRadius: 12,
    overflow: 'hidden',
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
  checkIcon: {
    fontSize: 20,
    color: Colors.PrimaryGreen,
    marginRight: 8,
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
  denomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  denomText: {
    ...Typography.bodyMedium,
    color: Colors.White,
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
    gap: 12,
  },
  photo1: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(114, 28, 184, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(114, 28, 184, 0.6)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo1Text: {
    ...Typography.bodySmall,
    color: Colors.PrimaryGreen,
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
  signText: {
    ...Typography.bodyMedium,
    color: Colors.TextDim,
  },
});
