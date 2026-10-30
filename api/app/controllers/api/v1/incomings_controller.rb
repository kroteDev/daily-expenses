# frozen_string_literal: true

class Api::V1::IncomingsController < ApplicationController
  include Ownable
  include Pageable

  SORTABLE_FIELDS = %w[origin date amount_cents created_at updated_at].freeze

  def index
    incomings, meta = paginate(filter_by_date(owned_collection).order(sort_clause))

    render json: {
      data: incomings.map { |incoming| IncomingSerializer.new(incoming).serializable_hash[:data][:attributes] },
      meta: meta
    }, status: :ok
  end

  def show
    render json: {
      data: IncomingSerializer.new(@incoming).serializable_hash[:data][:attributes]
    }, status: :ok
  end

  def create
    incoming = owned_collection.build(incoming_params)

    if incoming.save
      render json: {
        data: IncomingSerializer.new(incoming).serializable_hash[:data][:attributes]
      }, status: :created
    else
      render json: { errors: incoming.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @incoming.update(incoming_params)
      render json: {
        data: IncomingSerializer.new(@incoming).serializable_hash[:data][:attributes]
      }, status: :ok
    else
      render json: { errors: @incoming.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @incoming.destroy
    head :no_content
  end

  private

  def incoming_params
    params.require(:incoming).permit(:origin, :date, :amount_cents)
  end

  def filter_by_date(scope)
    today = Date.today

    if params[:today].present?
      scope.where(date: today)
    elsif params[:week].present?
      scope.where(date: today.beginning_of_week..today.end_of_week)
    elsif params[:month].present?
      scope.where(date: today.beginning_of_month..today.end_of_month)
    elsif params[:year].present?
      scope.where(date: today.beginning_of_year..today.end_of_year)
    else
      scope
    end
  end

  def sort_clause
    field = params[:sort].to_s
    direction = field.start_with?("-") ? :desc : :asc
    field = field.delete_prefix("-")

    return { date: :desc, amount_cents: :asc, origin: :asc, id: :asc } unless SORTABLE_FIELDS.include?(field)

    { field => direction, id: :asc }
  end
end
