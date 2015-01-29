'use strict';

var React = require('react'),
    FluxMixin = require('fluxxor').FluxMixin(React),
    StoreWatchMixin = require('fluxxor').StoreWatchMixin,
    Game = require('../../server/dungeonlords/Game'),
    Icon = require('./Icon');

require('../less/dungeonlords.less');

module.exports = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin('Game', 'Users')],

    getStateFromFlux: function() {
        var gameStore = this.getFlux().store('Game'),
            userStore = this.getFlux().store('Users');

        return {
            game: gameStore.getGame(),
            gameLoading: gameStore.isLoading(),
            gameErrors: gameStore.getErrors(),
            log: gameStore.getLog(),
            logic: gameStore.getLogic(),
            move: gameStore.getMove(),
            me: userStore.getLoggedInUser()
        }
    },

    componentWillMount: function() {
        this.getFlux().actions.game.load(this.props.params.id);
    },

    render: function () {
        if (!this.state.game && this.state.gameLoading) {
            return <h2>Loading...</h2>;
        } else if (!this.state.game) {
            return <h2>No Game Found</h2>;
        }

        var instructions = this.getInstructions();

        var log = this.state.log.map(function(log, i){ return <li key={i}>{log}</li>; });

        return (
            <div className="row">
                <div className="col-sm-12">
                    <h2>{this.state.game.title} <small>{this.state.game._id}</small></h2>
                    <div className={'panel panel-' + instructions.className}>
                        <div className="panel-heading">{instructions.message}</div>
                        <div className="panel-body">
                            {instructions.selection}
                        </div>
                    </div>

                    {this.renderLogic()}

                    <h4>Game Log</h4>
                    <ol>
                    {log}
                    </ol>
                </div>
            </div>
        );
    },

    renderLogic: function(){
        if (!this.state.logic) {
            return '';
        }

        var boards = this.state.logic.players.map(function(player){
            return (
                <div>
                    <ul className="list-group">
                        <li className="list-group-item active">
                            {player._id}
                        </li>
                        <li className="list-group-item">
                            <span className="badge">{player.gold}</span>
                            Gold
                        </li>
                        <li className="list-group-item">
                            <span className="badge">{player.food}</span>
                            Food
                        </li>
                        <li className="list-group-item">
                            <span className="badge">{player.imps}</span>
                            Imps
                        </li>
                    </ul>
                </div>
            );
        });

        return (
            <div>
            {boards}
            </div>
        );
    },

    renderOrders: function(orders){
        var size = '5x';

        orders = orders.map(function(order){
            var text;
            if (order === 1) {
                order = <Icon icon="cutlery" size={size}/>;
                text = 'Get Food';
            } else if (order === 2) {
                order = <Icon icon="smile-o" size={size}/>;
                text = 'Reputation';
            } else if (order === 3) {
                order = <Icon icon="wrench" size={size}/>;
                text = 'Dig Tunnels';
            } else if (order === 4) {
                order = <Icon icon="diamond" size={size}/>;
                text = 'Mine Gold';
            } else if (order === 5) {
                order = <Icon icon="child" size={size}/>;
                text = 'Recruit Imps';
            } else if (order === 6) {
                order = <Icon icon="bomb" size={size}/>;
                text = 'Buy Traps';
            } else if (order === 7) {
                order = <Icon icon="paw" size={size}/>;
                text = 'Hire Monster';
            } else if (order === 8) {
                order = <Icon icon="cube" size={size}/>;
                text = 'Build Room';
            } else {
                order = <Icon icon="question-circle" size={size} spin={true}/>;
            }

            return <div className="order">{order}<span>{text}</span></div>;
        });

        return (
            <div className="selection">
                <div className="orders">
                    {orders}
                </div>
                <button className="btn btn-danger">Undo</button>
                <button className="btn btn-success">Okay</button>
            </div>
        );
    },

    getInstructions: function(){
        var className = '',
            message = '',
            selection = <Icon icon="cog" size="5x" spin={true}/>;

        if (this.state.move === Game.Move.WAITING_FOR_SERVER) {
            className = 'info';
            message = 'Waiting for the server to finish processing';
        } else if (this.state.move === Game.Move.WAITING_FOR_OTHERS) {
            className = 'info';
            message = 'Waiting for other players to finish their turns';
        } else if (this.state.move === Game.Move.SELECT_INITIAL_ORDERS) {
            className = 'warning';
            message = 'The game has begun! Select an order to keep. The other two will be your first set of inaccessible orders.';
            selection = this.renderOrders(this.state.logic.lookupPlayer[this.state.me._id].initial);
        } else if (this.state.move === Game.Move.SELECT_ORDERS) {
            className = 'warning';
            message = 'Select your orders for your minions.';
            selection = this.renderOrders(this.state.logic.lookupPlayer[this.state.me._id].orders);
        } else {
            className = 'danger';
            message = 'Something went wrong.'
        }

        return { className: className, message: message, selection: selection };
    }
});