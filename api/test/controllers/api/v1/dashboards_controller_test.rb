require "test_helper"

class Api::V1::DashboardsControllerTest < ActionDispatch::IntegrationTest
  test "returns the dashboard summary with a valid token" do
    post "/api/v1/signin", params: { user: { email: users(:one).email, password: "password123" } }, as: :json
    token = response.headers["Authorization"]

    get "/api/v1/dashboard", headers: { "Authorization" => token }

    assert_response :ok
    data = JSON.parse(response.body)["data"]
    expected_keys = %w[filter start_date end_date total_items total_cents by_category by_date]
    assert_equal expected_keys.sort, data.keys.sort
  end

  test "applies the period filter" do
    post "/api/v1/signin", params: { user: { email: users(:one).email, password: "password123" } }, as: :json
    token = response.headers["Authorization"]

    get "/api/v1/dashboard", params: { filter: "month" }, headers: { "Authorization" => token }

    assert_response :ok
    assert_equal "month", JSON.parse(response.body)["data"]["filter"]
  end

  test "rejects requests without a token" do
    get "/api/v1/dashboard"

    assert_response :unauthorized
  end
end
