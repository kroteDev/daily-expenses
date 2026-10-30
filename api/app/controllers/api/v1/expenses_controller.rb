# frozen_string_literal: true

class Api::V1::ExpensesController < ApplicationController
  include Ownable
  include Pageable

  SORTABLE_FIELDS = %w[name date price_cents created_at updated_at].freeze

  def index
    expenses, meta = paginate(filter_by_date(owned_collection).order(sort_clause))

    render json: {
      data: expenses.map { |expense| ExpenseSerializer.new(expense).serializable_hash[:data][:attributes] },
      meta: meta
    }, status: :ok
  end

  def show
    render json: {
      data: ExpenseSerializer.new(@expense).serializable_hash[:data][:attributes]
    }, status: :ok
  end

  def create
    expense = owned_collection.build(expense_params)

    if expense.save
      render json: {
        data: ExpenseSerializer.new(expense).serializable_hash[:data][:attributes]
      }, status: :created
    else
      render json: { errors: expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @expense.update(expense_params)
      render json: {
        data: ExpenseSerializer.new(@expense).serializable_hash[:data][:attributes]
      }, status: :ok
    else
      render json: { errors: @expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @expense.destroy
    head :no_content
  end

  def import_csv
    return render json: { errors: ["Missing file parameter"] }, status: :unprocessable_entity if params[:file].blank?

    result = CsvImportService.new(current_user).call(params[:file])
    render json: { data: result }, status: :ok
  end

  private

  def expense_params
    params.require(:expense).permit(:name, :date, :price_cents, :category_id)
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

    return { date: :desc, price_cents: :asc, name: :asc, id: :asc } unless SORTABLE_FIELDS.include?(field)

    { field => direction, id: :asc }
  end
end
