import WebApp from '@twa-dev/sdk';

export const initializeTelegram = async () => {
    try {
        WebApp.ready();
        WebApp.expand();
    } catch (error) {
        console.error('Failed to initialize Telegram WebApp:', error);
    }
};