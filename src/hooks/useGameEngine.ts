import { useEffect, useRef, useState } from 'react';

type Screen = 'welcome' | 'loading' | 'profile' | 'game' | 'gameOver';

type Item = {
    x: number;
    y: number;
    type: 'summer' | 'winter';
    summerIndex?: number;
    winterIndex?: number;
};

type VibeMessage = {
    text: string;
    x: number;
    y: number;
    ttl: number;
    riseSpeed: number;
};

const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;


const basketWidth = canvasWidth / 4;
const basketHeight = basketWidth * 108 / 158;
const itemSize = canvasWidth / 8;
const itemRadius = itemSize / 2;

export const useGameEngine = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    screen: Screen,
    setScreen: React.Dispatch<React.SetStateAction<Screen>>,
    images: {
        basketImage: HTMLImageElement | null;
        summerImages: HTMLImageElement[];
        winterImages: HTMLImageElement[];
        plusVibeImage: HTMLImageElement | null;
        minusVibeImage: HTMLImageElement | null;
    },
    sounds: {
        plusVibeAudio: HTMLAudioElement | null;
        minusVibeAudio: HTMLAudioElement | null;
        loseAudio: HTMLAudioElement | null;
        jumpAudio: HTMLAudioElement | null;
    },
) => {
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(1);
    const [gravity, setGravity] = useState(2);
    const [targetGravity, setTargetGravity] = useState(2);
    const [items, setItems] = useState<Item[]>([]);
    const [vibes, setVibes] = useState<VibeMessage[]>([]);
    const [basketX, setBasketX] = useState(canvasWidth / 2 - basketWidth / 2);
    const [targetBasketX, setTargetBasketX] = useState(basketX);
    const [gamePaused, setGamePaused] = useState(false);

    const animationRef = useRef<number>(0);

    // Обновляем гравитацию в зависимости от счета
    useEffect(() => {
        const baseGravity = 2;
        const maxGravity = 8;
        const step = 0.5; // на сколько увеличивается

        // Каждые 15 очков увеличиваем на шаг
        const level = Math.floor(score / 15);
        const newTarget = Math.min(baseGravity + level * step, maxGravity);

        // if (sounds.jumpAudio) {
        //     sounds.jumpAudio.currentTime = 0;
        //     sounds.jumpAudio.play().catch(() => {});
        // }

        setTargetGravity(newTarget);
    }, [score]);

    // Генерация падающих предметов
    useEffect(() => {
        if (screen !== 'game' || gamePaused) return;

        const interval = setInterval(() => {
            const type = Math.random() < 0.8 ? 'summer' : 'winter';
            setItems(prev => [
                ...prev,
                {
                    x: Math.random() * (canvasWidth - itemSize),
                    y: 0,
                    type,
                    summerIndex:
                        type === 'summer'
                            ? Math.floor(Math.random() * images.summerImages.length)
                            : undefined,
                    winterIndex:
                        type === 'winter'
                            ? Math.floor(Math.random() * images.winterImages.length)
                            : undefined,
                },
            ]);
        }, 1000);

        return () => clearInterval(interval);
    }, [screen, gamePaused, images.summerImages.length, images.winterImages.length]);

    // Основной игровой цикл: отрисовка и обновление состояния
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx || screen !== 'game' || gamePaused) return;

        const draw = () => {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            const gravityStep = 0.05;
            if (Math.abs(gravity - targetGravity) > 0.01) {
                const direction = gravity < targetGravity ? 1 : -1;
                setGravity(prev => prev + gravityStep * direction);
            }

            const speed = 0.1;
            const dx = targetBasketX - basketX;
            if (Math.abs(dx) > 0.5) {
                setBasketX(prev => prev + dx * speed);
            }
            // Рисуем корзину
            if (images.basketImage && images.basketImage.complete) {
                ctx.drawImage(
                    images.basketImage,
                    basketX,
                    canvasHeight - basketHeight - 50,
                    basketWidth,
                    basketHeight
                );
            }

            const newItems: Item[] = [];
            const newVibes: VibeMessage[] = [];

            items.forEach(item => {
                const newY = item.y + gravity;

                // Проверяем пойман ли предмет корзиной
                const itemCenterX = item.x + itemSize / 2;
                const itemBottomY = newY + itemSize;
                const basketTopY = canvasHeight - basketHeight - 50;
                const caught =
                    itemBottomY >= basketTopY &&
                    newY < basketTopY + basketHeight * 0.4 &&
                    itemCenterX >= basketX &&
                    itemCenterX <= basketX + basketWidth;
                
                const missed = newY > canvasHeight + 40;
                
                if (caught) {
                    if (item.type === 'summer') {
                        setScore(prev => prev + 1);

                        if (sounds.plusVibeAudio) {
                            sounds.plusVibeAudio.currentTime = 0;
                            sounds.plusVibeAudio.play().catch(() => {});
                        }

                        newVibes.push({
                            text: 'Плюс вайб',
                            x: basketX + basketWidth / 2 - 30,
                            y: canvasHeight - basketHeight - 20,
                            ttl: 60,
                            riseSpeed: 0.7,
                        });
                    } else {
                        setLives(prev => {
                            const newLives = prev - 1;

                            if (newLives < 1) {
                                if (sounds.loseAudio) {
                                    sounds.loseAudio.currentTime = 0;
                                    sounds.loseAudio.play().catch(() => {});
                                }
                                setTimeout(() => setScreen('gameOver'), 100);
                            }

                            return newLives;
                        });

                        if (sounds.minusVibeAudio) {
                            sounds.minusVibeAudio.currentTime = 0;
                            sounds.minusVibeAudio.play().catch(() => {});
                        }

                        newVibes.push({
                            text: 'Минус вайб',
                            x: basketX + basketWidth / 2 - 30,
                            y: canvasHeight - basketHeight - 20,
                            ttl: 60,
                            riseSpeed: 0.7,
                        });
                    }
                } else if (missed) {
                    // Пропущенный летний предмет снижает жизнь
                    if (item.type === 'summer') {
                        setLives(prev => {
                            const newLives = prev - 1;

                            if (newLives < 1) {
                                if (sounds.loseAudio) {
                                    sounds.loseAudio.currentTime = 0;
                                    sounds.loseAudio.play().catch(() => {});
                                }
                                setTimeout(() => setScreen('gameOver'), 100);
                            }

                            return newLives;
                        });

                        if (sounds.minusVibeAudio) {
                            sounds.minusVibeAudio.currentTime = 0;
                            sounds.minusVibeAudio.play().catch(() => {});
                        }

                        newVibes.push({
                            text: 'Минус вайб',
                            x: item.x,
                            y: canvasHeight - basketHeight - 20,
                            ttl: 60,
                            riseSpeed: 0.7,
                        });
                    }
                } else {
                    newItems.push({ ...item, y: newY });

                    // Рисуем предмет
                    let image: HTMLImageElement | null = null;
                    if (item.type === 'summer') {
                        image =
                            item.summerIndex !== undefined
                                ? images.summerImages[item.summerIndex]
                                : null;
                    } else {
                        image =
                            item.winterIndex !== undefined
                                ? images.winterImages[item.winterIndex]
                                : null;
                    }

                    if (image && image.complete) {
                        ctx.drawImage(
                            image,
                            item.x - itemRadius,
                            item.y - itemRadius,
                            itemRadius * 2,
                            itemRadius * 2
                        );
                    }
                }
            });

            setItems(newItems);

            // Обновляем вайб-сообщения
            const nextVibes = vibes
                .map(v => ({
                    ...v,
                    ttl: v.ttl - 1,
                    y: v.y - v.riseSpeed,
                }))
                .filter(v => v.ttl > 0)
                .concat(newVibes);

            nextVibes.forEach(v => {
                const opacity = Math.max(0, v.ttl / 60);
                ctx.globalAlpha = opacity;
                ctx.fillStyle = v.text === 'Плюс вайб' ? 'green' : 'red';
                ctx.font = '18px Arial';

                const img =
                    v.text === 'Плюс вайб' ? images.plusVibeImage : images.minusVibeImage;

                if (img && img.complete) {
                    ctx.drawImage(img, v.x, v.y, 100, 40);
                }
                ctx.globalAlpha = 1.0;
            });

            setVibes(nextVibes);

            animationRef.current = requestAnimationFrame(draw);
        };

        animationRef.current = requestAnimationFrame(draw);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [
        items,
        basketX,
        gravity,
        targetGravity,
        screen,
        vibes,
        gamePaused,
        images,
        sounds,
        setScreen,
    ]);

    // Обработчик перемещения корзины
    const handleMove = (x: number) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const pos = x - rect.left;
        const target = Math.max(0, Math.min(pos - basketWidth / 2, canvasWidth - basketWidth));
        setTargetBasketX(target);
    };

    // Сброс игры
    const resetGame = () => {
        setScore(0);
        setLives(3);
        setItems([]);
        setGravity(2);
        setVibes([]);
        setGamePaused(false);
    };

    return {
        score,
        lives,
        gravity,
        items,
        vibes,
        basketX,
        gamePaused,
        setGamePaused,
        handleMove,
        resetGame,
        setScore,
        setLives,
        setBasketX,
    };
};
