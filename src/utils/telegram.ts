import WebApp from '@twa-dev/sdk';

declare global {
    interface Window {
        Telegram: {
            WebApp: typeof WebApp;
        };
    }
}

export {};

export const initializeTelegram = () => {
    if (window.Telegram && window.Telegram.WebApp) {
        WebApp.ready();
        WebApp.expand();
    } else {
        console.error('Telegram WebApp is not available');
    }
};

export const getTelegramWebApp = (): typeof WebApp => {
    if (!window.Telegram || !window.Telegram.WebApp) {
        throw new Error('Telegram WebApp is not available');
    }
    return window.Telegram.WebApp;
};