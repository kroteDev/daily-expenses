class Category < ApplicationRecord
  belongs_to :user
  has_many :expenses, dependent: :nullify

  validates :name, presence: true
end
