class Incoming < ApplicationRecord
  belongs_to :user

  validates :date, presence: true
  validates :amount_cents, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :origin, presence: true
end
