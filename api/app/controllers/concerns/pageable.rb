# frozen_string_literal: true

# Offset pagination for collection actions.
#
# Returns the requested page of records plus a `meta` hash. The page is clamped
# to the last available page, so an overflowing request returns the final page
# with the page number that was actually served.
module Pageable
  extend ActiveSupport::Concern

  DEFAULT_PER_PAGE = 50
  MAX_PER_PAGE = 100

  private

  def paginate(scope)
    total = scope.except(:order).count
    per_page = requested_per_page
    total_pages = (total.to_f / per_page).ceil
    page = requested_page
    page = total_pages if total_pages.positive? && page > total_pages

    records = scope.offset((page - 1) * per_page).limit(per_page)
    meta = { page: page, per_page: per_page, total: total, total_pages: total_pages }

    [records, meta]
  end

  def requested_page
    [params[:page].to_i, 1].max
  end

  def requested_per_page
    per_page = params[:per_page].to_i
    per_page = DEFAULT_PER_PAGE unless per_page.positive?
    [per_page, MAX_PER_PAGE].min
  end
end
