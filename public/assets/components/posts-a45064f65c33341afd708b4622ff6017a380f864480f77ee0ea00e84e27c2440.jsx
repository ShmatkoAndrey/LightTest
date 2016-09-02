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
            return <Post key = { post.post.id } post = { post } current_user = {this.props.current_user}> </Post>
        }.bind(this));
        return (
            <div onScroll={this.scrollPosts} ref="posts_box" id="posts" className="posts">
                { postsNode }
            </div>
        );
    }
});

var Post = React.createClass({
    getInitialState() {
        this.webSocket();
        return { comments: this.props.post.comments, answer: false }
    },
    addComment(arr, comment) {
        if(comment.post_id != null) return arr.concat([comment]);
        else {
            arr.forEach(function (e, i) {
                if(e.id.toString() == comment.comment_id.toString()) {
                    if(e.comments) {
                        e.comments = e.comments.concat([comment]);
                    }
                    else e['comments'] = [comment];
                }
                else if (e.comments) {
                    arr[find_n(arr, e.id)] = this.addComment(e.comments, comment);
                }
            }.bind(this));
            return arr;
        }
        function find_n(arr, id) {
            arr.forEach(function(e, i){
                if(e.id == id) return i;
            })
        }
    },
    webSocket: function() {
        var faye = new Faye.Client('http://socketmiamitalks.herokuapp.com/faye');
        faye.subscribe("/lighttest/post/"+this.props.post.post.id+"/comments/create", function(data) {
            this.setState({comments: this.addComment(this.state.comments, data.comment) });
        }.bind(this));
    },
    handleAnswer() { this.setState( { answer: !this.state.answer } ) },
    render: function() {
        if(this.props.current_user != null && this.props.current_user.id == this.props.post.user.id)
            var delete_button = <div className="delete-post" onClick={this.handleDelete}>x</div>;
        return (
            <div className="post">
                <div className="author-post"> {this.props.post.user.name} </div>
                { delete_button }
                <br />
                { this.props.post.post.content }
                <div className="answer" onClick = { this.handleAnswer }> { this.state.answer ? 'Hide' : 'Answer' } </div>
                { this.state.answer ? <SendComment parrent_post = { this.props.post.post }  callbackAnswer = { this.handleAnswer } /> : '' }
                <Comments comments = { this.state.comments } current_user = { this.props.current_user } />
            </div>
        );
    },
    handleDelete: function() {
        $.ajax({
            url: '/posts/' + this.props.post.post.id, dataType: 'json', type: 'DELETE',
            error: function(xhr, status, err) { console.error(status, err.toString()); }.bind(this)
        });
    }
});
