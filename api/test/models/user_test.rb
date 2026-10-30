require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "creates default categories after signup" do
    user = User.create!(
      email: "maria@example.com",
      password: "SenhaSegura123!",
      password_confirmation: "SenhaSegura123!",
      name: "Maria"
    )

    assert_equal 12, user.categories.count
    assert_includes user.categories.pluck(:name), "Sem categoria"
    assert_includes user.categories.pluck(:name), "Alimentação"
  end

  test "generates jti on create" do
    user = User.create!(
      email: "joao@example.com",
      password: "SenhaSegura123!",
      password_confirmation: "SenhaSegura123!",
      name: "João"
    )

    assert user.jti.present?
  end

  test "accepts a password with letters, a number and a special character" do
    user = build_user(password: "abc123#")

    assert user.valid?
  end

  test "accepts accented letters as letters" do
    user = build_user(password: "Açúcar2026_")

    assert user.valid?
  end

  test "rejects a password shorter than 6 characters" do
    user = build_user(password: "ab1!")

    assert_not user.valid?
    assert_includes user.errors[:password], "is too short (minimum is 6 characters)"
  end

  test "rejects a password without a letter" do
    user = build_user(password: "123456!")

    assert_not user.valid?
    assert_includes user.errors[:password], "must include at least one letter"
  end

  test "rejects a password without a number" do
    user = build_user(password: "abcdef!")

    assert_not user.valid?
    assert_includes user.errors[:password], "must include at least one number"
  end

  test "rejects a password without a special character" do
    user = build_user(password: "abcdef1")

    assert_not user.valid?
    assert_includes user.errors[:password], "must include at least one special character"
  end

  test "does not treat spaces as special characters" do
    user = build_user(password: "abcdef 1")

    assert_not user.valid?
    assert_includes user.errors[:password], "must include at least one special character"
  end

  test "does not re-check password complexity when the password is not being changed" do
    user = users(:one)
    user.name = "Nome Novo"

    assert user.valid?
  end

  private

  def build_user(password:)
    User.new(
      email: "teste#{SecureRandom.hex(4)}@example.com",
      password: password,
      password_confirmation: password,
      name: "Teste"
    )
  end
end
