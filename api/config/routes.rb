Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      devise_for :users, path: "", singular: :user, path_names: {
        sign_in: "signin",
        sign_out: "signout",
        registration: "signup"
      }, controllers: {
        sessions: "api/v1/users/sessions",
        registrations: "api/v1/users/registrations"
      }

      resources :categories
      resources :expenses do
        collection do
          post :import_csv
        end
      end
      resources :incomings
      get "dashboard", to: "dashboards#index"
      get "profile", to: "profiles#show"
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check
end
