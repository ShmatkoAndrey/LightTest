class PostsController < ApplicationController

  def index
    cnt_load = 10
    if params[:start]
      @posts = Post.preload(:user).order(created_at: :desc).where('id < ?', params[:start]).limit(cnt_load).map {|post| {post: post, comments: post.find_comments, user: post.user.serialize}}
    else
      @posts = Post.preload(:user).order(created_at: :desc).limit(cnt_load).map {|post| {post: post, comments: post.find_comments, user: post.user.serialize}}
    end
    render json: {posts: @posts}
  end

  def create
    @post = current_user.posts.build(post_params) unless current_user.nil?
    if @post.save
      broadcast '/lighttest/posts/create', { post: @post, comments: @post.find_comments, user: @post.user.serialize }
      render json: { post: @post, comments: post.find_comments, user: @post.user.serialize }
    else
      render json: { errors: @post.errors.full_messages}
    end
  end

  def destroy
    @post = Post.find(params[:id]).destroy
    broadcast '/lighttest/posts/destroy', { post: @post }
    render json: { post: @post}
  end

  private

  def post_params
    params.require(:post).permit(:content)
  end

end
