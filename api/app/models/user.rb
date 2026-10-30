class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  validates :name, presence: true
  validate :password_complexity, if: -> { password.present? }

  has_many :categories, dependent: :destroy
  has_many :expenses, dependent: :destroy
  has_many :incomings, dependent: :destroy

  before_validation :set_jti, on: :create, if: -> { jti.blank? }
  after_create :create_default_categories

  private

  def password_complexity
    errors.add(:password, "must include at least one letter") unless password.match?(/[[:alpha:]]/)
    errors.add(:password, "must include at least one number") unless password.match?(/\d/)
    errors.add(:password, "must include at least one special character") unless password.match?(/[^[:alnum:]\s]/)
  end

  def set_jti
    self.jti = SecureRandom.uuid
  end

  def create_default_categories
    categories.create!([
      { name: "Alimentação" },
      { name: "Água" },
      { name: "Cartões de Crédito" },
      { name: "Internet" },
      { name: "Lazer" },
      { name: "Luz" },
      { name: "Moradia" },
      { name: "Pet" },
      { name: "Refeição" },
      { name: "Transporte" },
      { name: "Telefone" },
      { name: "Sem categoria" }
    ])
  end
end
