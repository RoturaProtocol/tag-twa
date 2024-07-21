import WebApp from '@twa-dev/sdk';

export const initializeTelegram = () => {
    WebApp.ready();
};

export const getTelegramWebApp = () => {
    return WebApp;
};