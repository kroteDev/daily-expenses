class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  validates :name, presence: true

  before_validation :generate_jti, on: :create, if: -> { jti.blank? }

  has_many :categories, dependent: :destroy
  has_many :expenses, dependent: :destroy
  has_many :incomings, dependent: :destroy
end
