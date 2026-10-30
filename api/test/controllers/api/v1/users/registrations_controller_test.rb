require "test_helper"

class Api::V1::Users::RegistrationsControllerTest < ActionDispatch::IntegrationTest
  test "signs up with a password that has letters, a number and a special character" do
    post "/api/v1/signup", params: signup_params("SenhaSegura123!"), as: :json

    assert_response :ok
    assert response.headers["Authorization"].present?
    assert_equal "maria@example.com", JSON.parse(response.body)["data"]["email"]
  end

  test "rejects a password shorter than 6 characters" do
    post "/api/v1/signup", params: signup_params("ab1!"), as: :json

    assert_response :unprocessable_entity
    assert_match "Password is too short", response.body
  end

  test "rejects a password without a letter" do
    post "/api/v1/signup", params: signup_params("123456!"), as: :json

    assert_response :unprocessable_entity
    assert_match "Password must include at least one letter", response.body
  end

  test "rejects a password without a number" do
    post "/api/v1/signup", params: signup_params("abcdef!"), as: :json

    assert_response :unprocessable_entity
    assert_match "Password must include at least one number", response.body
  end

  test "rejects a password without a special character" do
    post "/api/v1/signup", params: signup_params("abcdef1"), as: :json

    assert_response :unprocessable_entity
    assert_match "Password must include at least one special character", response.body
  end

  test "does not create the user when the password is invalid" do
    assert_no_difference "User.count" do
      post "/api/v1/signup", params: signup_params("abcdef1"), as: :json
    end
  end

  private

  def signup_params(password)
    {
      user: {
        name: "Maria",
        email: "maria@example.com",
        password: password,
        password_confirmation: password
      }
    }
  end
end
