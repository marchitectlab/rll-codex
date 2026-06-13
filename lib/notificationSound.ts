const NOTIFICATION_SOUND_SRC = '/sounds/system-notification.mpeg';

let audio: HTMLAudioElement | null = null;

const getNotificationAudio = () => {
    if (typeof Audio === 'undefined') return null;
    if (!audio) {
        audio = new Audio(NOTIFICATION_SOUND_SRC);
        audio.preload = 'auto';
        audio.volume = 0.55;
    }
    return audio;
};

export const primeNotificationSound = () => {
    const sound = getNotificationAudio();
    sound?.load();
};

export const playNotificationSound = () => {
    const sound = getNotificationAudio();
    if (!sound) return;
    try {
        sound.currentTime = 0;
        void sound.play().catch(() => {});
    } catch {}
};
