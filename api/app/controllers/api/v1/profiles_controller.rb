# frozen_string_literal: true

class Api::V1::ProfilesController < ApplicationController
  include RackSessionsFix
  before_action :authenticate_user!

  def show
    render json: {
      data: UserSerializer.new(current_user).serializable_hash[:data][:attributes]
    }, status: :ok
  end
end
