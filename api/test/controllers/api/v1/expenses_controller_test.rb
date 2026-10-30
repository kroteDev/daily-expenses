require "test_helper"

class Api::V1::ExpensesControllerTest < ActionDispatch::IntegrationTest
  setup do
    post "/api/v1/signin", params: { user: { email: users(:one).email, password: "password123" } }, as: :json
    @token = response.headers["Authorization"]
  end

  test "imports a CSV file and returns the summary in the data envelope" do
    file = fixture_file_upload("fatura.csv", "text/csv")

    post "/api/v1/expenses/import_csv", params: { file: file }, headers: { "Authorization" => @token }

    assert_response :ok
    data = JSON.parse(response.body)["data"]
    assert_equal %w[created duplicates errors skipped], data.keys.sort
    assert_equal 2, data["created"]
    assert_equal 1, data["duplicates"]
    assert_equal 3, data["skipped"]
    assert users(:one).expenses.exists?(name: "PG *EXEMPLO A", price_cents: 3983)
  end

  test "rejects an import without a file" do
    post "/api/v1/expenses/import_csv", headers: { "Authorization" => @token }

    assert_response :unprocessable_entity
    assert_equal ["Missing file parameter"], JSON.parse(response.body)["errors"]
  end

  test "requires a token to import" do
    file = fixture_file_upload("fatura.csv", "text/csv")

    post "/api/v1/expenses/import_csv", params: { file: file }

    assert_response :unauthorized
  end
end
