import { Alert as RNAlert } from 'react-native';

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
    if (globalAlertListener) {
      // Use the custom RN modal for ALL platforms (Web, Android, iOS)
      globalAlertListener(title, message, buttons);
    } else {
      // Fallback to native Alert if listener not yet registered
      RNAlert.alert(title, message, buttons as any);
    }
  }
};
