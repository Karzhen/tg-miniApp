import {useRef, useState, useEffect} from 'react';
import { useAudio } from './hooks/useAudio';
import { useImages } from './hooks/useImages';
import { useGameEngine } from './hooks/useGameEngine';
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
} from './assets';
import { summerImagesSrc } from './components/summerItems';
import { winterImagesSrc } from './components/winterItems';
import WelcomeScreen from "./components/WelcomeScreen.tsx";
import LoadingScreen from "./components/LoadingScreen.tsx";

type Screen = 'welcome' | 'loading' | 'profile' | 'game' | 'gameOver';

const App = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
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
    });

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
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        borderRadius: 8,
                        padding: '6px 10px',
                    }}>
                        <div>➕ {score}</div>
                        <div>❤️ {lives}</div>
                    </div>

                    <button onClick={() => setGamePaused(p => !p)} style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                    }}>
                        <img src={pauseIconSrc} width={32} height={32} alt="Pause" />
                    </button>
                </>
            )}
        </div>
    );
};

export default App;
