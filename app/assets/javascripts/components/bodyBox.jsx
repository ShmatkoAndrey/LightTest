var BodyBox = new React.createClass({
    getInitialState() { return { current_user: null } },
    componentWillMount() { // После загрузки компонента получает юзера
        $.ajax({
            url: "/sessions/current_user", method: "GET", async: false,
            success: function(data) {
                if (data.current_user) this.setState({ current_user: data.current_user })
            }.bind(this)
        });
    },
    setCurrentUser: function(current_user) { this.setState({ current_user: current_user }) },
    componentDidUpdate(){ updatePostsSize(); },
    render() {
        return (
            <div id = "body-box">
                { this.state.current_user ?
                    <div><div className="col-md-2"></div><div className="col-md-8">
                        <App current_user = { this.state.current_user } changeGuest = { this.setCurrentUser }  />
                    </div></div> :
                    <div className = "background-login" ><div id = "main-login"><h4>Для добавления и комментирования сообщений выполните вход</h4><Login changeCurrentUser = { this.setCurrentUser } login_page = { true } /> </div></div> }
            </div>
        )
    }
});
