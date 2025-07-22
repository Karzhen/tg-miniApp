import {useEffect, useRef} from "react";

export const useAudio = (src: string, options: Partial<HTMLAudioElement> = {}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(src);
        Object.assign(audioRef.current, options);
        return () => audioRef.current?.pause();
    }, [src]);

    const play = () => {
        audioRef.current!.currentTime = 0;
        audioRef.current!.play().catch(() => {});
    };

    const pause = () => audioRef.current?.pause();

    return { play, pause, ref: audioRef };
};
