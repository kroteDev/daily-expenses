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

  test "paginates expenses with 50 per page by default" do
    create_expenses(60)

    get "/api/v1/expenses", headers: { "Authorization" => @token }

    assert_response :ok
    body = JSON.parse(response.body)
    total = users(:one).expenses.count
    assert_equal 50, body["data"].size
    assert_equal({ "page" => 1, "per_page" => 50, "total" => total, "total_pages" => (total / 50.0).ceil },
                 body["meta"])
  end

  test "returns the next page without overlapping the first" do
    create_expenses(60)

    get "/api/v1/expenses", params: { page: 1 }, headers: { "Authorization" => @token }
    first_ids = JSON.parse(response.body)["data"].map { |e| e["id"] }

    get "/api/v1/expenses", params: { page: 2 }, headers: { "Authorization" => @token }
    second_ids = JSON.parse(response.body)["data"].map { |e| e["id"] }

    assert_empty first_ids & second_ids
    assert_equal users(:one).expenses.count - 50, second_ids.size
    assert_equal 2, JSON.parse(response.body)["meta"]["page"]
  end

  test "caps per_page at 100" do
    get "/api/v1/expenses", params: { per_page: 500 }, headers: { "Authorization" => @token }

    assert_equal 100, JSON.parse(response.body)["meta"]["per_page"]
  end

  test "treats an invalid page as the first page" do
    get "/api/v1/expenses", params: { page: "abc" }, headers: { "Authorization" => @token }

    assert_equal 1, JSON.parse(response.body)["meta"]["page"]
  end

  test "clamps a page past the end to the last page" do
    create_expenses(60)

    get "/api/v1/expenses", params: { page: 999 }, headers: { "Authorization" => @token }

    meta = JSON.parse(response.body)["meta"]
    assert_equal meta["total_pages"], meta["page"]
    assert_not_empty JSON.parse(response.body)["data"]
  end

  test "applies the period filter before paginating" do
    create_expenses(60)
    expected = users(:one).expenses.where(date: Date.today.all_month).count

    get "/api/v1/expenses", params: { month: 1 }, headers: { "Authorization" => @token }

    assert_equal expected, JSON.parse(response.body)["meta"]["total"]
  end

  test "dashboard totals include every expense in the period, beyond one page" do
    create_expenses(60)
    month = users(:one).expenses.where(date: Date.today.all_month)

    get "/api/v1/dashboard", params: { filter: "month" }, headers: { "Authorization" => @token }

    data = JSON.parse(response.body)["data"]
    assert_equal month.count, data["total_items"]
    assert_equal month.sum(:price_cents), data["total_cents"]
  end

  private

  def create_expenses(count)
    count.times do |i|
      users(:one).expenses.create!(name: "Item #{i}", date: Date.today, price_cents: 100 + i, category: categories(:one))
    end
  end
end
