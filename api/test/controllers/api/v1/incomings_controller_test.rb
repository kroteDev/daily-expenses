require "test_helper"

class Api::V1::IncomingsControllerTest < ActionDispatch::IntegrationTest
  setup do
    post "/api/v1/signin", params: { user: { email: users(:one).email, password: "password123" } }, as: :json
    @token = response.headers["Authorization"]
    @headers = { "Authorization" => @token }
  end

  test "paginates incomings with 50 per page by default" do
    51.times { |i| users(:one).incomings.create!(origin: "Origem #{i}", date: Date.today, amount_cents: 100 + i) }

    get "/api/v1/incomings", headers: @headers

    assert_response :ok
    body = JSON.parse(response.body)
    total = users(:one).incomings.count
    assert_equal 50, body["data"].size
    assert_equal total, body["meta"]["total"]
    assert_equal 2, body["meta"]["total_pages"]
  end

  test "returns the second page with the remaining incomings" do
    51.times { |i| users(:one).incomings.create!(origin: "Origem #{i}", date: Date.today, amount_cents: 100 + i) }

    get "/api/v1/incomings", params: { page: 2 }, headers: @headers

    assert_equal users(:one).incomings.count - 50, JSON.parse(response.body)["data"].size
  end

  test "shows an owned incoming" do
    get "/api/v1/incomings/#{incomings(:one).id}", headers: @headers

    assert_response :ok
    assert_equal incomings(:one).id, JSON.parse(response.body)["data"]["id"]
  end

  test "does not show another user's incoming" do
    get "/api/v1/incomings/#{incomings(:two).id}", headers: @headers

    assert_response :not_found
  end

  test "creates an incoming for the owner" do
    params = { incoming: { origin: "Salário", date: "2026-10-05", amount_cents: 500000 } }

    assert_difference "users(:one).incomings.count", 1 do
      post "/api/v1/incomings", params: params, headers: @headers, as: :json
    end

    assert_response :created
    assert_equal 500000, JSON.parse(response.body)["data"]["amount_cents"]
  end

  test "rejects an incoming without an origin" do
    params = { incoming: { origin: "", date: "2026-10-05", amount_cents: 500000 } }

    post "/api/v1/incomings", params: params, headers: @headers, as: :json

    assert_response :unprocessable_entity
    assert JSON.parse(response.body)["errors"].present?
  end

  test "updates an owned incoming" do
    patch "/api/v1/incomings/#{incomings(:one).id}", params: { incoming: { origin: "Freela" } },
          headers: @headers, as: :json

    assert_response :ok
    assert_equal "Freela", incomings(:one).reload.origin
  end

  test "does not update another user's incoming" do
    patch "/api/v1/incomings/#{incomings(:two).id}", params: { incoming: { origin: "Invadido" } },
          headers: @headers, as: :json

    assert_response :not_found
    assert_not_equal "Invadido", incomings(:two).reload.origin
  end

  test "deletes an owned incoming" do
    assert_difference "users(:one).incomings.count", -1 do
      delete "/api/v1/incomings/#{incomings(:one).id}", headers: @headers
    end

    assert_response :no_content
  end

  test "does not delete another user's incoming" do
    delete "/api/v1/incomings/#{incomings(:two).id}", headers: @headers

    assert_response :not_found
    assert Incoming.exists?(incomings(:two).id)
  end
end
