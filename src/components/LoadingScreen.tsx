import LoadingBar from "./LoadingBar.tsx";

const LoadingScreen = () => (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <LoadingBar />
        <p style={{
            padding: 0,
            margin: 0,
            fontFamily: '"Pixelify Sans", sans-serif',
            fontSize: '72px',
            color: 'black',
            lineHeight: 0.9,
            letterSpacing: '-2px',
        }}>Loading...</p>
    </div>
);

export default LoadingScreen;
