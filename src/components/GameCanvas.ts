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

const GameCanvas: React.FC<Props> = ({ canvasRef, onGameOver }) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const w = canvas.width;
        const h = canvas.height;

        let score = 0;
        let lives = 3;
        let level = 1;
        let gameObjects: GameObject[] = [];
        let basketX = w / 2;
        const basketWidth = 150; // Увеличенная ширина корзины
        const basketHeight = 60; // Увеличенная высота корзины
        const basketY = h - 80;
        const objectRadius = 20;
        let isPaused = false;
        let isGameOver = false; // Флаг для остановки игры

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            // Ограничиваем движение корзины
            basketX = Math.max(basketWidth / 2, Math.min(clientX, w - basketWidth / 2));
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);

        const spawn = () => {
            const type: 'summer' | 'winter' = Math.random() > 0.3 ? 'summer' : 'winter';
            gameObjects.push({
                x: Math.random() * (w - 2 * objectRadius) + objectRadius,
                y: -objectRadius,
                speed: 1 + level * 0.5,
                type,
            });
        };

        let lastSpawn = 0;
        let lastLevelUp = 0;

        const loop = (timestamp: number) => {
            if (isPaused || isGameOver) return; // Прекращаем цикл, если игра окончена

            ctx.clearRect(0, 0, w, h);

            // Рисуем корзину
            const basketLeft = basketX - basketWidth / 2;
            const basketRight = basketX + basketWidth / 2;
            const basketTop = basketY;
            const basketBottom = basketY + basketHeight;

            ctx.fillStyle = 'orange';
            ctx.fillRect(basketLeft, basketTop, basketWidth, basketHeight);

            // Спавн объектов
            if (timestamp - lastSpawn > 1000 - level * 50) {
                spawn();
                lastSpawn = timestamp;
            }

            // Обновление и отрисовка объектов
            gameObjects.forEach((obj) => {
                obj.y += obj.speed;

                ctx.fillStyle = obj.type === 'summer' ? 'yellow' : 'lightblue';
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, objectRadius, 0, 2 * Math.PI);
                ctx.fill();
            });

            // Обработка столкновений и фильтрация
            gameObjects = gameObjects.filter((obj) => {
                // Проверяем, находится ли центр объекта внутри корзины
                const isOverlapping =
                    obj.x >= basketLeft &&
                    obj.x <= basketRight &&
                    obj.y >= basketTop &&
                    obj.y <= basketBottom;

                if (isOverlapping) {
                    if (obj.type === 'summer') {
                        score++; // Увеличиваем счет за летний предмет
                        if (score - lastLevelUp >= 15) {
                            level++;
                            lastLevelUp = score;
                        }
                    } else {
                        console.log('Летний предмет не был пойман!');
                        // lives--; // Уменьшаем жизни за зимний предмет
                        // console.log({ lives });
                        // if (lives <= 0) {
                        //     isGameOver = true;
                        //     onGameOver(score);
                        //     return false;
                        // }
                    }
                    return false; // Удаляем объект при столкновении
                }

                // Проверяем, вышел ли объект за пределы экрана
                if (obj.y - objectRadius > h) {
                    if (obj.type === 'summer') {
                        lives--; // Уменьшаем жизни, если летний предмет не пойман
                        console.log({ lives });
                        if (lives <= 0) {
                            isGameOver = true;
                            onGameOver(score);
                            return false;
                        }
                    }
                    return false; // Удаляем объект, если он за пределами экрана
                }

                return true;
            });

            // Рисуем интерфейс
            ctx.fillStyle = 'black';
            ctx.font = '20px sans-serif';
            ctx.fillText(`Очки: ${score}`, 10, 30);
            ctx.fillText(`Жизни: ${lives}`, 10, 60);
            ctx.fillText(`Уровень: ${level}`, 10, 90);

            if (!isGameOver) {
                requestAnimationFrame(loop); // Продолжаем цикл, если игра не окончена
            }
        };

        requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
        };
    }, [canvasRef, onGameOver]);

    return null;
};

export default GameCanvas;