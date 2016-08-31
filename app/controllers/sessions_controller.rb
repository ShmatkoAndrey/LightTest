class SessionsController < ApplicationController

  def social_auth # Да, можно было бы подключить через devise с omniauth, но т.к. логинка только через соцсети, то лучше сделать отдельно и не нагружать лишней логикой
    if params[:social][:error]
      render json: {error: params[:social][:error]}
    else
      @user = User.find_for_auth(params[:provider], params[:social])

      session[:user_id] = @user.id
      token = Random.new_seed
      cookies[:auth_token] = {value: token, expires: 1.hour.from_now}
      @user.update(auth_token: token)

      render json: {current_user: @user}
    end
  end

  def destroy # $.ajax({ url: "/sessions/destroy", method: "DELETE" });
    session[:user_id] = nil
    cookies[:auth_token] = nil
    render json: { current_user: nil }
  end

  def current_user

    if session[:user_id].nil? && cookies[:auth_token] && !cookies[:auth_token].empty?
      user = User.where(auth_token: cookies[:auth_token])
      session[:user_id] = user.first.id unless user.nil?
      @current_user = user.first
    else
      user_find = User.where(id: session[:user_id]).first # if User.find(session[:user_id]) : Couldn't find User with 'id'=1)
      @current_user ||= user_find unless user_find.nil?
    end

    render json: { current_user: @current_user }
  end

end