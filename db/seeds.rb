@user = User.create name: Faker::Name.name

50.times {|i| Post.create content: "post #{i}", user_id: @user.id }