var React = require('react'),
    Template = require('./template');

module.exports = React.createClass({
    render: function(){
        var initialData = JSON.stringify({
            loggedInUser: this.props.user
        });

        return (
            <Template title={this.props.title} user={this.props.isAuthenticated ? this.props.user : null}>
                <div id="client"/>
                <script src="/socket.io/socket.io.js"/>
                <script src="/assets/scripts/client.js" data-initial-data={initialData}/>
            </Template>
        );
    }
});