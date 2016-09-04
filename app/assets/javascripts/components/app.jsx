var App = React.createClass({
    handleLogOut() {
        $.ajax({ url: "/sessions/destroy", method: "DELETE" });
        this.props.changeGuest('guest')
    },
    render() {
        return (
            <div id="messages">
                { this.props.current_user != 'guest' ? <div id = "logout" className="btn btn-danger" onClick = { this.handleLogOut } >Logout</div>: '' }
                <div id = "send-post-login">
                    { this.props.current_user != 'guest' ? <SendPost /> : <Login changeCurrentUser = { (current_user) => { this.props.changeGuest(current_user) } } /> }
                </div>
                <PostList current_user = { this.props.current_user } />
            </div>
        )
    }
});

var SendPost = React.createClass({
    getInitialState: function() { return {content: '' } },
    handleSubmit(e) {
        e.preventDefault();
        var data = { content: this.state.content.trim() };
        if (data.content) {
            $.ajax({
                url: '/posts', dataType: 'json', type: 'POST', data: { post: data },
                success: function (data) {
                    if (data.errors) { console.log(data.errors); }
                    this.setState({ content: '' });
                }.bind(this)
            });
        }
    },
   render() {
       return (
            <div id="send-post">
                <form className="postForm" onSubmit = { this.handleSubmit } >
                   <textarea  placeholder = "Content" rows="5"  maxLength = "10000"
                             value = { this.state.content } onChange = { (e) => { this.setState({ content:  e.target.value }) } } />
                    <input id="submitPost" type="submit" value="Post" className="btn btn-default" />
                </form>
            </div>
       )
   }
});