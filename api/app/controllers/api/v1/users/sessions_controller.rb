# frozen_string_literal: true

class Api::V1::Users::SessionsController < Devise::SessionsController
  include RackSessionsFix
  respond_to :json

  private

  def respond_with(current_user, _opts = {})
    render json: {
      status: { code: 200, message: "Logged in successfully." },
      data: UserSerializer.new(current_user).serializable_hash[:data][:attributes]
    }, status: :ok
  end

  def respond_to_on_destroy(non_navigational_status: :no_content)
    if request.headers["Authorization"].present?
      jwt_payload = JWT.decode(
        request.headers["Authorization"].split(" ").last,
        Rails.application.credentials.devise_jwt_secret_key!
      ).first
      current_user = User.find_by(id: jwt_payload["sub"])
    end

    if current_user
      render json: {
        status: { code: 200, message: "Logged out successfully." }
      }, status: :ok
    else
      render json: {
        status: { code: 401, message: "Couldn't find an active session." }
      }, status: :unauthorized
    end
  rescue JWT::DecodeError
    render json: {
      status: { code: 401, message: "Couldn't find an active session." }
    }, status: :unauthorized
  end
end
