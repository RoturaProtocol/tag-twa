import WebApp from '@twa-dev/sdk';

export const initializeTelegram = () => {
    if (window.Telegram && window.Telegram.WebApp) {
        WebApp.ready();
        WebApp.expand();
    } else {
        console.error('Telegram WebApp is not available');
    }
};
export const getTelegramWebApp = () => {
    return WebApp;
};