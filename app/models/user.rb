class User < ApplicationRecord

  # Без валидаций, т.к. генерируемый без участия пользователя

  has_many :posts, dependent: :destroy
  has_many :comments, dependent: :destroy

  def self.find_for_auth(provider, auth)
    @user = User.where(uid: auth[:id], provider: provider).first
    @user = User.create(name: auth[:name], uid: auth[:id], provider: provider) if @user.nil?
    @user
  end

  def serialize
    { id: self.id, name: self.name }
  end

end
