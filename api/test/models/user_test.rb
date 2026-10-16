require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "creates default categories after signup" do
    user = User.create!(
      email: "maria@example.com",
      password: "SenhaSegura123",
      password_confirmation: "SenhaSegura123",
      name: "Maria"
    )

    assert_equal 12, user.categories.count
    assert_includes user.categories.pluck(:name), "Sem categoria"
    assert_includes user.categories.pluck(:name), "Alimentação"
  end

  test "generates jti on create" do
    user = User.create!(
      email: "joao@example.com",
      password: "SenhaSegura123",
      password_confirmation: "SenhaSegura123",
      name: "João"
    )

    assert user.jti.present?
  end
end
