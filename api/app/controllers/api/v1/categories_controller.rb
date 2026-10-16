# frozen_string_literal: true

class Api::V1::CategoriesController < ApplicationController
  include Ownable

  SORTABLE_FIELDS = %w[name created_at updated_at].freeze

  def index
    categories = owned_collection.order(sort_clause)

    render json: {
      data: categories.map { |category| CategorySerializer.new(category).serializable_hash[:data][:attributes] }
    }, status: :ok
  end

  def show
    render json: {
      data: CategorySerializer.new(@category).serializable_hash[:data][:attributes]
    }, status: :ok
  end

  def create
    category = owned_collection.build(category_params)

    if category.save
      render json: {
        data: CategorySerializer.new(category).serializable_hash[:data][:attributes]
      }, status: :created
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @category.update(category_params)
      render json: {
        data: CategorySerializer.new(@category).serializable_hash[:data][:attributes]
      }, status: :ok
    else
      render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    if @category.name == "Sem categoria"
      render json: { errors: ["Cannot delete the default category"] }, status: :unprocessable_entity
      return
    end

    default_category = owned_collection.find_or_create_by!(name: "Sem categoria")
    @category.expenses.update_all(category_id: default_category.id)
    @category.destroy
    head :no_content
  end

  private

  def category_params
    params.require(:category).permit(:name)
  end

  def sort_clause
    field = params[:sort].to_s
    direction = field.start_with?("-") ? :desc : :asc
    field = field.delete_prefix("-")

    return { created_at: :desc } unless SORTABLE_FIELDS.include?(field)

    { field => direction }
  end
end
