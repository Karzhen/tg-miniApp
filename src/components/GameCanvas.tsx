import { useEffect } from 'react';

type Props = {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    onGameOver: (score: number) => void;
};

type GameObject = {
    x: number;
    y: number;
    speed: number;
    type: 'summer' | 'winter';
};

type VibesText = {
    x: number;
    y: number;
    text: string;
    time: number;
};

const summerIcon = new Image();
summerIcon.src = 'src/assets/summer1.png';
const winterIcon = new Image();
winterIcon.src = 'src/assets/winter1.png';

const GameCanvas: React.FC<Props> = ({ canvasRef, onGameOver }) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let score = 0;
        let lives = 3;
        let level = 1;
        let gameObjects: GameObject[] = [];
        let vibesTexts: VibesText[] = [];
        let basketX = canvas.width / 2;
        const basketWidth = 150;
        const basketHeight = 60;
        const basketY = canvas.height - 80;
        const objectRadius = 20;
        let isPaused = false;
        let isGameOver = false;
        let lastSpawn = 0;
        let lastLevelUp = 0;
        let lastFrame = 0;
        const targetFPS = 60;
        const frameInterval = 1000 / targetFPS;

        const handleMove = (e: MouseEvent | TouchEvent) => {
            if ('touches' in e) e.preventDefault();
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            basketX = Math.max(basketWidth / 2, Math.min(clientX, canvas.width - basketWidth / 2));
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);

        const spawn = () => {
            const type: 'summer' | 'winter' = Math.random() > 0.3 ? 'summer' : 'winter';
            gameObjects.push({
                x: Math.random() * (canvas.width - 2 * objectRadius) + objectRadius,
                y: -objectRadius,
                speed: 1 + level * 0.5,
                type,
            });
        };

        const loop = (timestamp: number) => {
            if (timestamp - lastFrame < frameInterval || isPaused || isGameOver) {
                requestAnimationFrame(loop);
                return;
            }
            lastFrame = timestamp;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const basketLeft = basketX - basketWidth / 2;
            const basketRight = basketX + basketWidth / 2;
            const basketTop = basketY;
            const basketBottom = basketY + basketHeight;

            ctx.fillStyle = 'orange';
            ctx.fillRect(basketLeft, basketTop, basketWidth, basketHeight);

            if (timestamp - lastSpawn > 1000 - level * 50) {
                spawn();
                lastSpawn = timestamp;
            }

            // Обработка столкновений
            gameObjects = gameObjects.filter((obj) => {
                const isOverlapping =
                    obj.x >= basketLeft &&
                    obj.x <= basketRight &&
                    obj.y >= basketTop &&
                    obj.y <= basketBottom;

                if (isOverlapping) {
                    if (obj.type === 'summer') {
                        score++;
                        vibesTexts.push({ x: obj.x, y: obj.y, text: 'Плюс вайб', time: timestamp + 1000 });
                        if (score - lastLevelUp >= Math.floor(Math.random() * 6) + 15) {
                            level++;
                            lastLevelUp = score;
                        }
                    } else {
                        lives--;
                        vibesTexts.push({ x: obj.x, y: obj.y, text: 'Минус вайб', time: timestamp + 1000 });
                        if (lives <= 0) {
                            isGameOver = true;
                            onGameOver(score);
                        }
                    }
                    return false; // Удаляем объект при столкновении
                }
                return true;
            });

            // Обновление и отрисовка объектов
            gameObjects.forEach((obj) => {
                obj.y += obj.speed;
                const icon = obj.type === 'summer' ? summerIcon : winterIcon;
                ctx.drawImage(icon, obj.x - objectRadius, obj.y - objectRadius, objectRadius * 2, objectRadius * 2);
            });

            // Удаляем объекты, вышедшие за экран
            gameObjects = gameObjects.filter((obj) => obj.y - objectRadius <= canvas.height);

            vibesTexts = vibesTexts.filter((vibe) => vibe.time > timestamp);
            vibesTexts.forEach((vibe) => {
                ctx.fillStyle = vibe.text === 'Плюс вайб' ? 'green' : 'red';
                ctx.font = '16px sans-serif';
                ctx.fillText(vibe.text, vibe.x, vibe.y);
            });

            ctx.fillStyle = 'black';
            ctx.font = '20px sans-serif';
            ctx.fillText(`Очки: ${score}`, 10, 30);
            const heart = '🧡';
            ctx.font = '24px sans-serif';
            for (let i = 0; i < lives; i++) {
                ctx.fillText(heart, 10 + i * 30, 60);
            }
            ctx.fillText(`Уровень: ${level}`, 10, 90);

            if (!isGameOver) {
                requestAnimationFrame(loop);
            }
        };

        let imagesLoaded = 0;
        const onImageLoad = () => {
            imagesLoaded++;
            if (imagesLoaded === 2) {
                requestAnimationFrame(loop);
            }
        };
        summerIcon.onload = onImageLoad;
        winterIcon.onload = onImageLoad;

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [canvasRef, onGameOver]);

    return null;
};

export default GameCanvas;