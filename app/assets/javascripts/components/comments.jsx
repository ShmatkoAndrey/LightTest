var Comments = React.createClass({
    render() {
        var commentsNode = this.props.comments.map(function(comment) { // Проходит по постам и если есть подкомменты - рекурсивно вызывает Comments
            if(comment.comments) {
                return (
                    <div >
                        <Comment key = { comment.id } comment = { comment } current_user = { this.props.current_user } />
                        <Comments key = { 'comments' + comment.id } comments = { comment.comments } current_user = { this.props.current_user } />
                    </div>
                )
            } else {
                return <Comment key = { comment.id } comment = { comment } current_user = { this.props.current_user } />
            }
        }.bind(this));

        return (
            <div className = "comments">
                { commentsNode }
            </div>
        )
    }
});

var Comment = React.createClass({
    getInitialState() { return { answer: false } },
    handleDelete() {
        $.ajax({
            url: '/comments/' + this.props.comment.id, dataType: 'json', type: 'DELETE',
            error: function(xhr, status, err) { console.error(status, err.toString()); }.bind(this)
        });
    },
    handleAnswer() { this.setState( { answer: !this.state.answer } ) },
    render() {
        var comment = this.props.comment;
        if(this.props.current_user != null && this.props.current_user.id == comment.user.id)
            var delete_button = <div className="delete-comment" onClick={this.handleDelete}>✕</div>;
        var date = new Date(comment.created_at);
        return (
            <div className = "comment">
                { delete_button }
                <div className="author-comment"> {comment.user.name} </div>
                <span className="icon-time" />
                { date.toDateString() + ' ' + date.toLocaleTimeString() }
                <br />
                { comment.content }
                { this.props.current_user  != 'guest' ? <div className="answer" onClick = { this.handleAnswer }>  <span className = "icon-answer" /> { this.state.answer ? 'Hide' : 'Answer' } </div> : '' }
                { this.state.answer ? <SendComment parrent_comment = { comment } callbackAnswer = { this.handleAnswer } /> : '' }
            </div>
        )
    }
});

var SendComment = React.createClass({
    getInitialState: function() { return {content: '' } },
    handleSubmit(e) {
        e.preventDefault();
        var data;
            if(this.props.parrent_comment)
                data = { content: this.state.content.trim(), comment_id: this.props.parrent_comment.id };
            else if(this.props.parrent_post)
                data = { content: this.state.content.trim(), post_id: this.props.parrent_post.id };
        if (data.content) {
            $.ajax({
                url: '/comments', dataType: 'json', type: 'POST', data: { comment: data },
                success: function (data) {
                    if (data.errors) { console.log(data.errors); }
                    this.setState({ content: '' });
                    this.props.callbackAnswer();
                }.bind(this)
            });
        }
    },
    render() {
        return (
            <div id="send-comment">
                <form className="commentForm" onSubmit = { this.handleSubmit } >
                   <textarea className="sendCommentArea"  placeholder = "Content" rows="3" maxLength = "5000"
                              value = { this.state.content } onChange = { (e) => { this.setState({ content:  e.target.value }) } } />
                    <button className="submitComment" type="submit" className="btn btn-default" > <span className = "icon-post" /> Comment </button>
                </form>
            </div>
        )
    }
});