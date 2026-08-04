import { Platform, Alert as RNAlert } from 'react-native';

export type AlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

type AlertListener = (title: string, message: string, buttons?: AlertButton[]) => void;

let globalAlertListener: AlertListener | null = null;

export const registerAlertListener = (listener: AlertListener) => {
  globalAlertListener = listener;
};

export const Alert = {
  alert: (title: string, message: string, buttons?: AlertButton[]) => {
    if (Platform.OS === 'web') {
      if (globalAlertListener) {
        globalAlertListener(title, message, buttons);
      } else {
        // Fallback to basic window alert if listener not registered
        if (buttons && buttons.length > 0) {
          const defaultBtn = buttons.find(b => b.style !== 'cancel') || buttons[0];
          const confirmText = buttons.map(b => b.text).join(' / ');
          const ok = window.confirm(`${title}\n\n${message}\n\n(${confirmText})`);
          if (ok && defaultBtn.onPress) {
            defaultBtn.onPress();
          }
        } else {
          window.alert(`${title}\n\n${message}`);
        }
      }
    } else {
      // Use native device alert on Android/iOS
      RNAlert.alert(title, message, buttons);
    }
  }
};
