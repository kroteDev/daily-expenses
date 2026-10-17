require "test_helper"

class Api::V1::ProfilesControllerTest < ActionDispatch::IntegrationTest
  test "returns the current user with a valid token" do
    user = users(:one)
    post "/api/v1/signin", params: { user: { email: user.email, password: "password123" } }, as: :json
    token = response.headers["Authorization"]

    get "/api/v1/profile", headers: { "Authorization" => token }

    assert_response :ok
    body = JSON.parse(response.body)["data"]
    assert_equal user.email, body["email"]
    assert_equal user.name, body["name"]
    assert_nil body["encrypted_password"]
  end

  test "rejects requests without a token" do
    get "/api/v1/profile"

    assert_response :unauthorized
  end
end
