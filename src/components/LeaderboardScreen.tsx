import React from 'react';
import { useNavigate } from 'react-router-dom';
import { backgroundImgSrc, leaderBoxSrc, goldcoinSrc, silvercoinSrc, bronzecoinSrc } from '../assets';

type LeaderboardEntry = {
    name: string;
    score: number;
    coinImg: any;
};

const leaderboardData: LeaderboardEntry[] = [
    { name: 'John Doe', score: 123, coinImg: goldcoinSrc },
    { name: 'Jane Smith', score: 115, coinImg: silvercoinSrc },
    { name: 'Alice Johnson', score: 110, coinImg: bronzecoinSrc },
];

const LeaderboardScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                backgroundImage: `url(${backgroundImgSrc})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
                boxSizing: 'border-box',
            }}
        >
            {leaderboardData.map(({ name, score, coinImg }, index) => (
                <div
                    key={index}
                    style={{
                        width: 356,
                        height: 100,
                        padding: '0 22px',
                        backgroundImage: `url(${leaderBoxSrc})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: '#000',
                        fontFamily: '"Pixelify Sans", sans-serif',
                        fontSize: 32,
                        fontWeight: 'bold',
                        marginBottom: 20,
                        userSelect: 'none',
                    }}
                >
                    <span>{`${name}: ${score}`}</span>
                    <img
                        src={coinImg}
                        alt={`medal ${index + 1}`}
                        style={{
                            width: 48,
                            height: 48,
                            objectFit: 'contain',
                        }}
                    />
                </div>
            ))}

            <button
                onClick={() => navigate('/')}
                style={{
                    padding: '12px 24px',
                    fontSize: '18px',
                    borderRadius: '8px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '16px',
                }}
            >
                К личному кабинету
            </button>
        </div>
    );
};

export default LeaderboardScreen;
