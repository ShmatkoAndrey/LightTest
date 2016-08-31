var BodyBox = new React.createClass({
    getInitialState() { return { current_user: null } },
    componentWillMount() {
        $.ajax({
            url: "/sessions/current_user", method: "GET", async: false,
            success: function(data) {
                if (data.current_user) this.setState({ current_user: data.current_user })
            }.bind(this)
        });
    },
    setCurrentUser: function(current_user) { this.setState({ current_user: current_user }) },
    render() {
        return (
            <div id = "body-box">
                { this.state.current_user ?
                    <App current_user = { this.state.current_user } /> :
                    <Login changeCurrentUser = { this.setCurrentUser } /> }
            </div>
        )
    }
});
