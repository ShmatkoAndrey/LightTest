var App = React.createClass({
    render() {
        return (
            <div id="messages">
                App
                { this.props.current_user != 'guest' ? <SendForm /> : <Login changeCurrentUser = { (current_user) => { this.props.changeGuest(current_user) } } /> }
            </div>
        )
    }
});

var SendForm = React.createClass({
    getInitialState: function() { return {content: '' } },
    handleSubmit(e) {
        e.preventDefault();
        var data = { content: this.state.content.trim()};
        if (data.content) {
            $.ajax({
                url: '/posts', dataType: 'json', type: 'POST', data: data,
                success: function (data) {
                    if (data.errors) { console.log(data.errors); }
                    this.setState({ content: '' });
                }.bind(this)
            });
        }
    },
   render() {
       return (
            <div id="send-form">

                <form className="postForm" onSubmit = { this.handleSubmit } >
                   <textarea  placeholder = "Content" rows="6"
                             value = { this.state.content } onChange = { (e) => { this.setState({ content:  e.target.value }) } } />
                    <input id="submitPost" type="submit" value="Post" />
                </form>

            </div>
       )
   }
});