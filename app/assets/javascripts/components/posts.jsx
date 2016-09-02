var PostList = React.createClass({
    getInitialState: function() {
        this.webSocket();
        return {posts: [], inProgressLoad: false};
    },
    componentDidMount: function() {
        $.ajax({
            url: '/posts', type: 'GET', async: false,
            success: function(data) {
                this.setState({posts: data.posts});
            }.bind(this)
        });
    },
    webSocket: function() {
        var faye = new Faye.Client('http://socketmiamitalks.herokuapp.com/faye'); // Сервер ВебСокетов для работы на хероку без покупки хобби-акка :D
        faye.subscribe("/lighttest/posts/create", function(data) {
            var posts = this.state.posts;
            this.setState({posts: [data].concat(posts)});
        }.bind(this));
        faye.subscribe("/lighttest/posts/destroy", function(data) {
                var posts = this.state.posts;
                posts.forEach(function (e, i) {
                    if (posts[i].post.id == data.post.id) { posts.splice(i, 1); }
                });
                this.setState({ posts: posts })
        }.bind(this));
    },
    scrollPosts: function() {
        if(($(this.refs.posts_box).scrollTop() >= $(this.refs.posts_box)[0].scrollHeight - $(this.refs.posts_box)[0].clientHeight - 200) && !this.state.inProgressLoad) {
            $.ajax({
                url: '/posts', dataType: 'json', type: 'GET',
                data: { start: this.state.posts[this.state.posts.length - 1].post.id },
                beforeSend: function() { this.setState({ inProgressLoad: true }); }.bind(this),
                success: function(data) {
                    if(data.errors) { console.log(data.errors); }
                    else {
                        new_posts = {posts: this.state.posts.concat(data.posts)};
                        this.setState(new_posts);
                        this.setState({ inProgressLoad: false });
                    }
                }.bind(this)
            });
        }
    },
    render: function() {
        var postsNode = this.state.posts.map(function(post) {
            return <Post post = { post.post } user = { post.user } comments = { post.comments } current_user = {this.props.current_user}> </Post>
        }.bind(this));
        return (
            <div onScroll={this.scrollPosts} ref="posts_box" id="posts" className="posts">
                { postsNode }
            </div>
        );
    }
});

var Post = React.createClass({
    getInitialState() { return { comments: null } },
    render: function() {
        if(this.props.current_user != null && this.props.current_user.id == this.props.user.id)
            var delete_button = <div className="delete-post" onClick={this.handleDelete}>x</div>;
        return (
            <div className="post">
                <div className="author-post"> {this.props.user.name} </div>
                { delete_button }
                <br />
                { this.props.post.content }
                <Comments comments = { this.props.comments } current_user = { this.props.current_user } />
            </div>
        );
    },
    handleDelete: function() {
        $.ajax({
            url: '/posts/' + this.props.post.id, dataType: 'json', type: 'DELETE',
            error: function(xhr, status, err) { console.error(status, err.toString()); }.bind(this)
        });
    }
});

var Comments = React.createClass({
    render() {
        var commentsNode = this.props.comments.map(function(comment) {
            if(comment.comments) {
                return (
                    <div >
                        <Comment comment = { comment } current_user = { this.props.current_user } />
                        <Comments comments = { comment.comments } current_user = { this.props.current_user } />
                    </div>
                )
            } else {
                return <Comment comment = { comment } current_user = { this.props.current_user } />
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
    handleDelete() {

    },
    render() {
        var comment = this.props.comment;
        if(this.props.current_user != null && this.props.current_user.id == comment.user.id)
            var delete_button = <div className="delete-comment" onClick={this.handleDelete}>x</div>;
        return (
            <div className = "comment">
                <div className="author-comment"> {comment.user.name} </div>
                { delete_button }
                <br />
                { comment.content }
            </div>
        )
    }
});