class User < ApplicationRecord

  def self.find_for_auth(provider, auth)
    @user = User.where(uid: auth[:id], provider: provider).first
    @user = User.create(name: auth[:name], uid: auth[:id], provider: provider) if @user.nil?
    @user
  end

end
