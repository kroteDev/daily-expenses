# frozen_string_literal: true

class Api::V1::DashboardsController < ApplicationController
  include Ownable

  def index
    today = Date.today
    filter = params[:filter] || "week"

    date_range = case filter
                 when "today" then today..today
                 when "week" then today.beginning_of_week..today.end_of_week
                 when "month" then today.beginning_of_month..today.end_of_month
                 when "year" then today.beginning_of_year..today.end_of_year
                 else today.beginning_of_week..today.end_of_week
                 end

    expenses = owned_collection.where(date: date_range).joins(:category)

    render json: {
      data: {
        filter: filter,
        start_date: date_range.first,
        end_date: date_range.last,
        total_items: expenses.count,
        total_cents: expenses.sum(:price_cents),
        by_category: expenses.group("categories.name").sum(:price_cents),
        by_date: expenses.group(:date).sum(:price_cents)
      }
    }, status: :ok
  end

  private

  def owned_collection
    current_user.expenses
  end
end
