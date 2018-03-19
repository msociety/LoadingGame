import React, { Component } from 'react';
import GameInfo from './components/GameInfo';
import Board from './components/Board';
import Player from './components/Player';
import Enemy from './components/Enemy';
import { UP, DOWN, LEFT, RIGHT } from './helpers/constants';
import { pluck } from './helpers/utils';

const getDefaultState = ({ boardSize, playerSize, highScore = 0 }) => {
    const half = Math.floor(boardSize / 2) * playerSize;
    return {
        size: {
            board: boardSize,
            player: playerSize,
            maxDim: boardSize * playerSize
        },
        positions: {
            player: {
                top: half,
                left: half
            },
            enemies: []
        },
        playerScore: 0,
        highScore,
        timeElapsed: 0,
        enemySpeed: 5,
        enemyIndex: 0,
        activeEnemies: 1,
        baseScore: 10
    }
};

// example of use:
// <LoadingGame boardSize={11} playerSize={25} />

export default class LoadingGame extends Component {
    constructor(props) {
        super(props);
        const { boardSize, playerSize } = props;
        this.state = getDefaultState({ boardSize, playerSize })
    }

    componentDidMount() {
        this.startGame();
    }

    componentWillUnmount() {
        clearInterval(this.state.gameInterval);
        clearInterval(this.state.enemyInterval);
        clearInterval(this.state.timeInterval);
    }

    placeEnemy = () => {
        // enemies always launch at player
        const { player: playerPos } = this.state.positions;

        // assign to a random side
        const side = pluck([UP, DOWN, LEFT, RIGHT]);

        // generate enemy object
        const newEnemy = this.generateNewEnemy(playerPos, side);

        // add new enemy to state
        this.setState({
            positions: {
                ...this.state.positions,
                enemies: [...this.state.positions.enemies].concat(newEnemy)
            }
        });
    }

    generateNewEnemy = (position, side) => {
        this.setState({
            enemyIndex: this.state.enemyIndex + 1
        });

        const newEnemy = { key: this.state.enemyIndex, dir: side };
        const { maxDim, player } = this.state.size;

        switch (side) {
            case UP:
                newEnemy.top = maxDim;
                newEnemy.left = position.left;
                break;
            case DOWN:
                newEnemy.top = 0 - player;
                newEnemy.left = position.left;
                break;
            case LEFT:
                newEnemy.top = position.top;
                newEnemy.left = maxDim;
                break;
            case RIGHT:
                newEnemy.top = position.top;
                newEnemy.left = 0 - player;
                break;
        }

        return newEnemy;
    }

    handlePlayerMovement = (dirObj) => {
        const { top, left } = this.state.positions.player;
        const { player, maxDim } = this.state.size;
        // check walls
        switch (dirObj.dir) {
            case UP:
                if (top === 0) return;
                break;
            case DOWN:
                if (top === maxDim - player) return;
                break;
            case LEFT:
                if (left === 0) return;
                break;
            case RIGHT:
                if (left === maxDim - player) return;
                break;
        }
        this.setState({
            positions: {
                ...this.state.positions,
                player: {
                    top: top + (player * dirObj.top),
                    left: left + (player * dirObj.left)
                }
            }
        });
    }

    handlePlayerCollision = () => {
        this.resetGame();
    }

    startGame = () => {
        this.enemyInterval = setInterval(this.updateEnemyPositions, 50);
        this.timeInterval = setInterval(this.updateGame, 1000);
        this.gameInterval = setInterval(this.updateEnemiesInPlay, 250);
    }

    updateGame = () => {
        const { timeElapsed } = this.state;
        this.updateTimeAndScore();
        if (timeElapsed > 0) {
            // increment enemy speed
            if (timeElapsed % 3 === 0) {
                this.incrementEnemySpeed();
            }
            // increment max active enemies every 10 seconds
            if (timeElapsed % 10 === 0) {
                this.incrementActiveEnemies();
            }
        }
    }

    updateEnemyPositions = () => {
        const { enemySpeed, positions: { enemies }, size: { player, maxDim } } = this.state;

        this.setState({
            positions: {
                ...this.state.positions,
                enemies: enemies.filter(enemy => !enemy.remove).map(enemy => {
                    if (enemy.top < (0 - player) ||
                        enemy.top > maxDim + player ||
                        enemy.left < (0 - player) ||
                        enemy.left > maxDim + player) {
                        enemy.remove = true;
                        return enemy;
                    }

                    // based on direction, increment the correct value (top / left)
                    switch (enemy.dir) {
                        case UP:
                            enemy.top -= enemySpeed;
                            break;
                        case DOWN:
                            enemy.top += enemySpeed;
                            break;
                        case LEFT:
                            enemy.left -= enemySpeed;
                            break;
                        case RIGHT:
                            enemy.left += enemySpeed;
                            break;
                    }

                    return enemy;
                })
            }
        });
    }

    updateEnemiesInPlay = () => {
        const { activeEnemies } = this.state;
        const { enemies } = this.state.positions;

        if (enemies.length < activeEnemies) {
            this.placeEnemy();
        }
    }

    updateTimeAndScore = () => {
        const { timeElapsed, playerScore, baseScore } = this.state;

        this.setState({
            timeElapsed: timeElapsed + 1,
            playerScore: playerScore + baseScore,
        });
    }

    incrementEnemySpeed = () => {
        const { enemySpeed } = this.state;

        this.setState({
            enemySpeed: parseFloat((enemySpeed + 0.25).toFixed(2))
        });
    }

    incrementActiveEnemies = () => {
        this.setState({
            activeEnemies: this.state.activeEnemies + 1
        });
    }

    resetGame = () => {
        const { boardSize, playerSize } = this.props;
        const { playerScore, highScore, globalHighScore } = this.state;

        // clear intervals
        clearInterval(this.gameInterval);
        clearInterval(this.enemyInterval);
        clearInterval(this.timeInterval);

        // reset state
        this.setState({
            ...getDefaultState({ boardSize, playerSize, highScore }),
            highScore: playerScore > highScore ? playerScore : highScore,
            globalHighScore
        });
        // restart game
        this.startGame();
    }

    render() {
        const {
            style,
            size: { board, player },
            positions: { player: playerPos },
            playerScore,
            timeElapsed,
            highScore,
            globalHighScore
        } = this.state;

        return (
            <div
                style={{
                    width: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    backgroundColor: '#FFF',
                    ...style
                }}
            >
                <Board dimension={board * player}>
                    <GameInfo
                        playerScore={playerScore}
                        timeElapsed={timeElapsed}
                        highScore={highScore}
                        globalHighScore={globalHighScore}
                    />
                    <Player
                        size={player}
                        position={playerPos}
                        handlePlayerMovement={this.handlePlayerMovement}
                    />
                    {this.state.positions.enemies.map(enemy => (
                        <Enemy
                            key={enemy.key}
                            size={player}
                            info={enemy}
                            playerPosition={playerPos}
                            onCollide={this.handlePlayerCollision}
                        />
                    ))}
                </Board>
            </div>
        )
    }
}