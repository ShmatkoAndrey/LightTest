class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  def start_page
    render 'layouts/application'
  end

  def current_user
    unless @current_user
      if session[:user_id].nil? && cookies[:auth_token] && !cookies[:auth_token].empty?
        user = User.where(auth_token: cookies[:auth_token])
        session[:user_id] = user.first.id unless user.nil?
        @current_user = user.first
      else
        user_find = User.where(id: session[:user_id]).first # User.find(session[:user_id]) : Couldn't find User with 'id'=1) =\
        @current_user ||= user_find unless user_find.nil?
      end
    end
    @current_user
  end
  helper_method 'current_user'

  private

  def broadcast(channel, hash) # Подключение сокет сервера
    message = {:channel => channel, :data => hash, :ext => {:auth_token => 'seed'}}
    uri = URI.parse('http://socketmiamitalks.herokuapp.com/faye')
    Net::HTTP.post_form(uri, :message => message.to_json)
  end
  helper_method 'broadcast'

end
