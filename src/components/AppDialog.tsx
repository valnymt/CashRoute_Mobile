import React, { createContext, useCallback, useContext, useState } from 'react';
import { Keyboard, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { AlertButton } from 'react-native';
import { Colors, Typography } from '../theme';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

type ShowDialog = (title: string, message?: string, buttons?: AlertButton[]) => void;

const DialogContext = createContext<ShowDialog | null>(null);

export function useAppDialog(): ShowDialog {
  const show = useContext(DialogContext);
  if (!show) throw new Error('AppDialogProvider is required');
  return show;
}

export function AppDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<{
    title: string;
    message?: string;
    buttons: AlertButton[];
  } | null>(null);

  const show = useCallback<ShowDialog>((title, message, buttons) => {
    Keyboard.dismiss();
    setDialog({ title, message, buttons: buttons?.length ? buttons : [{ text: 'OK' }] });
  }, []);

  return (
    <DialogContext.Provider value={show}>
      {children}
      {dialog && (
        <Modal
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => {
            const cancel = dialog.buttons.find(button => button.style === 'cancel');
            if (cancel) {
              setDialog(null);
              cancel.onPress?.();
            }
          }}
        >
          <View style={styles.backdrop}>
            <View style={styles.card} accessibilityViewIsModal>
              <ScrollView bounces={false} style={styles.copy}>
                <Text accessibilityRole="header" style={styles.title}>{dialog.title}</Text>
                {!!dialog.message && <Text style={styles.message}>{dialog.message}</Text>}
              </ScrollView>
              <View style={styles.actions}>
                {dialog.buttons.map((button, index) => {
                  const Button = button.style === 'cancel' ? SecondaryButton : PrimaryButton;
                  return (
                    <Button
                      key={index}
                      text={button.text ?? 'OK'}
                      style={button.style === 'destructive' ? styles.destructive : undefined}
                      onPress={() => {
                        setDialog(null);
                        button.onPress?.();
                      }}
                    />
                  );
                })}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </DialogContext.Provider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(12, 5, 23, 0.72)',
  },
  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    borderRadius: 26,
    backgroundColor: '#2A1643',
  },
  copy: { flexGrow: 0 },
  title: { ...Typography.headlineMedium, color: Colors.TextPrimary },
  message: { ...Typography.bodyMedium, color: Colors.TextSecondary, marginTop: 8 },
  actions: { gap: 10, marginTop: 20 },
  destructive: { backgroundColor: Colors.AccentRed, shadowColor: Colors.AccentRed },
});