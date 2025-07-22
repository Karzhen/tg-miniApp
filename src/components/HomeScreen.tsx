const HomeScreen = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', justifyContent: 'center' }}>
        <h1>Личный кабинет</h1>
        <button onClick={() => alert('Запуск игры...')}>🎮 Играть</button>
    </div>
);

export default HomeScreen;
