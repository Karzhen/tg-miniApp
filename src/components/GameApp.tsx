import { useNavigate } from 'react-router-dom';
import {useRef, useState, useEffect} from 'react';
import { useAudio } from '../hooks/useAudio';
import { useImages } from '../hooks/useImages';
import { useGameEngine } from '../hooks/useGameEngine';
import {
    basketImgSrc,
    plusVibeImgSrc,
    minusVibeImgSrc,
    gameBackgroundImgSrc,
    backgroundImgSrc,
    loseBackgroundImgSrc,
    pauseIconSrc,
    playButtonImgSrc,
    lkBoxSrc,
    themeMusicSrc,
    loseSoundSrc,
    selectSoundSrc,
    plusVibeSoundSrc,
    minusVibeSoundSrc,
    pointsImgSrc,
    hpImgSrc,
    pauseBackgroundImgSrc,
    pauseBtnImgSrc,
} from '../assets';
import { summerImagesSrc } from './summerItems';
import { winterImagesSrc } from './winterItems';
import WelcomeScreen from "./WelcomeScreen.tsx";
import LoadingScreen from "./LoadingScreen.tsx";

type Screen = 'welcome' | 'loading' | 'profile' | 'game' | 'gameOver';

const GameApp = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [showPauseOverlay, setShowPauseOverlay] = useState(false);
    const [screen, setScreen] = useState<Screen>('welcome');
    const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    // Audio hooks
    const themeAudio = useAudio(themeMusicSrc, { loop: true, volume: 0.5 });
    const selectAudio = useAudio(selectSoundSrc, { volume: 1 });
    const loseAudio = useAudio(loseSoundSrc, { volume: 1 });
    const plusVibeAudio = useAudio(plusVibeSoundSrc, { volume: 1 });
    const minusVibeAudio = useAudio(minusVibeSoundSrc, { volume: 1 });

    // Image hooks
    const basketImage = useImages([basketImgSrc]);
    const summerImages = useImages(summerImagesSrc);
    const winterImages = useImages(winterImagesSrc);
    const plusVibeImage = useImages([plusVibeImgSrc]);
    const minusVibeImage = useImages([minusVibeImgSrc]);

    const {
        score,
        lives,
        setGamePaused,
        handleMove,
        resetGame,
    } = useGameEngine(canvasRef, screen, setScreen, {
        basketImage: basketImage.current[0] || null,
        summerImages: summerImages.current,
        winterImages: winterImages.current,
        plusVibeImage: plusVibeImage.current[0] || null,
        minusVibeImage: minusVibeImage.current[0] || null,
    }, {
        plusVibeAudio: plusVibeAudio.ref.current,
        minusVibeAudio: minusVibeAudio.ref.current,
        loseAudio: loseAudio.ref.current,
    }, canvasSize.width);

    const playSelectSound = () => selectAudio.play();

    useEffect(() => {
        const handleResize = () => {
            setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (['game', 'welcome', 'loading', 'profile'].includes(screen)) {
            themeAudio.play();
        } else {
            themeAudio.pause();
        }
    }, [screen]);

    useEffect(() => {
        const transitionMap: Record<Screen, Screen | null> = {
            welcome: 'loading',
            loading: 'profile',
            gameOver: 'profile',
            profile: null,
            game: null,
        };
        const nextScreen = transitionMap[screen];
        if (nextScreen) {
            const timeout = setTimeout(() => {
                setScreen(nextScreen);
                if (screen === 'gameOver') resetGame();
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [screen]);

    const handleStart = () => {
        playSelectSound();
        setScreen('game');
        resetGame();
    };

    const backgroundImage = screen === 'game'
        ? gameBackgroundImgSrc
        : screen === 'gameOver'
            ? loseBackgroundImgSrc
            : backgroundImgSrc;

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            textAlign: 'center',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
            {screen === 'welcome' && (
                <WelcomeScreen />
            )}

            {screen === 'loading' && (
                <LoadingScreen />
            )}

            {screen === 'profile' && (
                <>
                    <div style={{
                        width: 356,
                        height: 270,
                        backgroundImage: `url(${lkBoxSrc})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#000',
                        fontSize: 20,
                        fontWeight: 'bold',
                        marginBottom: 20,
                    }}>
                        <div style={{ marginBottom: 10 }}>Лучший рекорд коллег: ***</div>
                        <div>Мой лучший результат: ***</div>
                    </div>

                    <button onClick={handleStart} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <img src={playButtonImgSrc} width={263} height={89} alt="Играть" />
                    </button>

                    <button
                        onClick={() => navigate('/leaderboard')}
                    >
                        Таблица лидеров
                    </button>
                </>
            )}

            {screen === 'game' && (
                <>
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'auto' }}
                        onMouseMove={e => handleMove(e.clientX)}
                        onTouchMove={e => handleMove(e.touches[0].clientX)}
                    />

                    <div style={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        color: 'black',
                        borderRadius: 8,
                        padding: '6px 10px',
                    }}>
                        <div style={{
                            height: 42,
                            width: 42,
                            fontFamily: '"Pixelify Sans", sans-serif',
                            fontSize: 42,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                        }}>
                            <img
                                src={pointsImgSrc}
                                alt="SCORE"
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    objectFit: 'contain'
                                }}
                            />
                            <span>{score}</span>
                        </div>
                        <div style={{
                            height: 42,
                            width: 42,
                            fontFamily: '"Pixelify Sans", sans-serif',
                            fontSize: 42,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                        }}>
                            <img
                                src={hpImgSrc}
                                alt="HP"
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    objectFit: 'contain'
                                }}
                            />
                            <span>{lives}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setGamePaused(true);
                            setShowPauseOverlay(true);
                        }}
                        style={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            cursor: 'pointer',
                            padding: 0,
                        }}
                    >
                        <img src={pauseIconSrc} width={63} height={43} alt="Pause" />
                    </button>
                    {showPauseOverlay && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100vw',
                                height: '100vh',
                                backgroundImage: `url(${pauseBackgroundImgSrc})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 10,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '48px',
                                    color: '#000',
                                    fontWeight: 'bold',
                                    fontFamily: '"Pixelify Sans", sans-serif',
                                    marginBottom: '40px',
                                    textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                                }}
                            >
                                На паузе
                            </div>

                            <button
                                onClick={() => {
                                    setGamePaused(false);
                                    setShowPauseOverlay(false);
                                }}
                                style={{
                                    width: '175px',
                                    height: '175px',
                                    fontSize: '24px',
                                    borderRadius: '16px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    backgroundImage: `url(${pauseBtnImgSrc})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                }}
                            />
                        </div>
                    )}

                </>
            )}
        </div>
    );
};

export default GameApp;
