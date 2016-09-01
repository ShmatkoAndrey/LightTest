@users = 10.times.collect {|i| User.create( name: Faker::Name.name )}

@posts = 30.times.collect {|i| Post.create( content: Faker::Hipster.paragraph, user_id: @users.sample.id )}

@comments = []
200.times do |i|
  @comment = Comment.new( content: Faker::Hipster.paragraph, user_id: @users.sample.id )
  if i % 4 == 0 || i < 21
    @comment.post_id = @posts.sample.id
  else
    @comment.comment_id = @comments.sample.id
  end
  @comments << @comment if @comment.save
end