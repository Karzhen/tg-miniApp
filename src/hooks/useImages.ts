import {useEffect, useRef} from "react";

export const useImages = (srcs: string[]) => {
    const images = useRef<HTMLImageElement[]>([]);

    useEffect(() => {
        images.current = srcs.map(src => {
            const img = new Image();
            img.src = src;
            return img;
        });
    }, [srcs]);

    return images;
};
