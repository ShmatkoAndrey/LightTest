class CommentsController < ApplicationController

  def create
    @comment = current_user.comments.build(comment_params) unless current_user.nil?
    if @comment.save
      cmnt = @comment.as_json
      cmnt['user'] = @comment.user.serialize
      broadcast "/lighttest/post/#{ find_post(@comment) }/comments/create", { comment: cmnt } # Отправляет на сокет сервер с id поста
      render json: { comment: @comment }
    else
      render json: { errors: @comment.errors.full_messages}
    end
  end

  def destroy
    @comment = Comment.find(params[:id]).destroy
    broadcast "/lighttest/post/#{ find_post(@comment) }/comments/destroy", { comment: @comment }
    render json: { comment: @comment }
  end

  private

  def find_post(comment) # Для нахождения id поста, поднимаясь из глубины дерева
    if comment.post_id
      comment.post_id
    else
      find_post Comment.find(comment.comment_id)
    end
  end

  def comment_params
    params.require(:comment).permit(:content, :post_id, :comment_id)
  end

end