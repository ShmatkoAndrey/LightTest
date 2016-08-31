Rails.application.routes.draw do

  root 'application#start_page'

  post 'sessions/social_auth' => 'sessions#social_auth'
  delete 'sessions/destroy' => 'sessions#destroy'
  get 'sessions/current_user' => 'sessions#get_current_user'

  resources :posts
end
