class Expense < ApplicationRecord
  belongs_to :user
  belongs_to :category

  validates :name, presence: true
  validates :date, presence: true
  validates :price_cents, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :import_hash, uniqueness: { scope: :user_id }, allow_nil: true
end
