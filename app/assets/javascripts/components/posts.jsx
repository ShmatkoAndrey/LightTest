var PostList = React.createClass({
    getInitialState: function() {
        this.webSocket();
        return {posts: [], inProgressLoad: false};
    },
    componentDidMount: function() { // После установки загружает перве посты, далее подключает сокеты и ловит с них
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
    scrollPosts: function() { // infinity scroll по положению скрола относительно конца
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
        return { comments: this.props.post.comments || [], answer: false, show_comments: true }
    },
    addComment(arr, comment, add) { // Рекурсивно ищет коммент и добавляет/удаляет (параметр add ) полученный из сокетов
        if(add && comment.post_id != null) return arr.concat([comment]);
        else if (!add && comment.post_id != null) { arr.forEach(function(e, i) { // Удаление, если коммент именно к посту
            if(e.id == comment.id) { arr.splice(i, 1); } });
            return arr;
        }
        else {
            arr.forEach(function (e, i) {
                if(e.id.toString() == comment.comment_id.toString()) {
                    if(!add) { e.comments.forEach(function(e2, i2){ if(e2.id == comment.id) {e.comments.splice(i2, 1); } }) } // Удаление
                    else if(e.comments) { e.comments = e.comments.concat([comment]); }
                    else e['comments'] = [comment];
                }
                else if (e.comments) { arr[find_n(arr, e.id)] = this.addComment(e.comments, comment, add); }
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
            this.setState({comments: this.addComment(this.state.comments, data.comment, true) });
        }.bind(this));
        faye.subscribe("/lighttest/post/"+this.props.post.post.id+"/comments/destroy", function(data) {
            this.setState({comments: this.addComment(this.state.comments, data.comment, false) });
        }.bind(this));
    },
    handleAnswer() { this.setState( { answer: !this.state.answer } ) },
    handleShowComments() {  this.setState( { show_comments: !this.state.show_comments } )  },
    render() {
        if(this.props.current_user != null && this.props.current_user.id == this.props.post.user.id)
            var delete_button = <div className="delete-post" onClick={this.handleDelete}>x</div>;
        return (
            <div className="post">
                { this.state.comments.length > 0 ? <div className = "show-comments" onClick = { this.handleShowComments } > { this.state.show_comments ? '-' : '+' } </div> : '' }
                <div className="author-post"> {this.props.post.user.name} </div>
                { delete_button }
                <br />
                { this.props.post.post.content }
                { this.props.current_user  != 'guest' ? <div className="answer" onClick = { this.handleAnswer }> { this.state.answer ? 'Hide' : 'Answer' } </div> : '' }
                { this.state.answer ? <SendComment parrent_post = { this.props.post.post }  callbackAnswer = { this.handleAnswer } /> : '' }
                { this.state.show_comments ? <Comments key = { 'post comments' + this.props.post.post.id } comments = { this.state.comments } current_user = { this.props.current_user } /> : '' }
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
