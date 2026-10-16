# frozen_string_literal: true

# Enforces per-user ownership on resource controllers.
#
# Including controllers get:
# - JWT authentication on every action (`authenticate_user!`)
# - Member actions scoped to the token owner; other users' records resolve to 404.
#
# Convention: collection is `current_user.<controller_name>` and member ivar
# is the singular. Override `owned_collection` or `owned_resource_name` for
# non-standard cases.
module Ownable
  extend ActiveSupport::Concern

  included do
    include RackSessionsFix
    before_action :authenticate_user!
    before_action :set_owned_resource, only: %i[show update destroy]
  end

  private

  def owned_collection
    current_user.public_send(controller_name)
  end

  def owned_resource_name
    controller_name.singularize
  end

  def set_owned_resource
    instance_variable_set("@#{owned_resource_name}", owned_collection.find(params[:id]))
  end
end
