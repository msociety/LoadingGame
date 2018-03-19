import React from 'react';
import PropTypes from 'prop-types';

const styles = {
    container: {
        textAlign: 'center',
        padding: 5
    },
    infoTop: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    infoBottom: {
        position: 'absolute',
        bottom: 0
    }
};

const GameInfo = ({ timeElapsed, playerScore, highScore }) => (
    <div style={styles.container}>
        <div style={styles.infoTop}>
            <p>Time: {timeElapsed}</p>
            <p>Score: {playerScore}</p>
        </div>
        <div style={styles.infoBottom}>
            <p>High Score: {highScore}</p>
        </div>
    </div>
);

GameInfo.propTypes = {
    timeElapsed: PropTypes.number.isRequired,
    playerScore: PropTypes.number.isRequired,
    highScore: PropTypes.number.isRequired
};

export default GameInfo;