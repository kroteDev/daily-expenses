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

  after_create :create_default_categories

  private

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
