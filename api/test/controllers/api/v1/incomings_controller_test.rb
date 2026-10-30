require "test_helper"

class Api::V1::IncomingsControllerTest < ActionDispatch::IntegrationTest
  setup do
    post "/api/v1/signin", params: { user: { email: users(:one).email, password: "password123" } }, as: :json
    @token = response.headers["Authorization"]
  end

  test "paginates incomings with 50 per page by default" do
    51.times { |i| users(:one).incomings.create!(origin: "Origem #{i}", date: Date.today, amount_cents: 100 + i) }

    get "/api/v1/incomings", headers: { "Authorization" => @token }

    assert_response :ok
    body = JSON.parse(response.body)
    total = users(:one).incomings.count
    assert_equal 50, body["data"].size
    assert_equal total, body["meta"]["total"]
    assert_equal 2, body["meta"]["total_pages"]
  end

  test "returns the second page with the remaining incomings" do
    51.times { |i| users(:one).incomings.create!(origin: "Origem #{i}", date: Date.today, amount_cents: 100 + i) }

    get "/api/v1/incomings", params: { page: 2 }, headers: { "Authorization" => @token }

    assert_equal users(:one).incomings.count - 50, JSON.parse(response.body)["data"].size
  end
end
