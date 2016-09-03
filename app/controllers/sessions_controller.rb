class SessionsController < ApplicationController

  def social_auth # Да, можно было бы подключить через devise с omniauth, но т.к. логинка только через соцсети, то лучше сделать отдельно и не нагружать лишней логикой
    if params[:social][:error]
      render json: {error: params[:social][:error]}
    else
      @user = User.find_for_auth(params[:provider], params[:social])
      session[:user_id] = @user.id
      token = Random.new_seed
      cookies[:auth_token] = {value: token, expires: 10.hour.from_now}
      @user.update(auth_token: token)
      render json: {current_user: @user}
    end
  end

  def destroy
    session[:user_id] = nil
    cookies[:auth_token] = nil
    render json: { current_user: nil }
  end

  def get_current_user
    render json: { current_user: current_user }
  end

end