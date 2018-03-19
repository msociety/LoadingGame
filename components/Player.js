import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Square from './Square';
import { UP, DOWN, LEFT, RIGHT } from '../helpers/constants'

class Player extends Component {
    componentDidMount() {
        window.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = e => {
        e.preventDefault();
        let newDirection;
        switch (e.keyCode) {
            case 37:
                newDirection = { top: 0, left: -1, dir: LEFT };
                break;
            case 38:
                newDirection = { top: -1, left: 0, dir: UP };
                break;
            case 39:
                newDirection = { top: 0, left: 1, dir: RIGHT };
                break;
            case 40:
                newDirection = { top: 1, left: 0, dir: DOWN };
                break;
            default:
                return;
        }
        this.props.handlePlayerMovement(newDirection);
    }

    render() {
        const { size, position: { top, left } } = this.props;
        return (
            <div ref={n => { this.player = n }} >
                <Square
                    size={size}
                    position={{ top, left }}
                    color='darkgray' />
            </div>

        );
    }
}

Player.propTypes = {
    size: PropTypes.number.isRequired,
    position: PropTypes.shape({
        top: PropTypes.number.isRequired,
        left: PropTypes.number.isRequired
    })
};

export default Player;