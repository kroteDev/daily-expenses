require "test_helper"

class Api::V1::CategoriesControllerTest < ActionDispatch::IntegrationTest
  setup do
    post "/api/v1/signin", params: { user: { email: users(:one).email, password: "password123" } }, as: :json
    @token = response.headers["Authorization"]
    @headers = { "Authorization" => @token }
  end

  test "lists only the owner's categories" do
    get "/api/v1/categories", headers: @headers

    assert_response :ok
    ids = JSON.parse(response.body)["data"].map { |c| c["id"] }
    assert_includes ids, categories(:one).id
    assert_not_includes ids, categories(:two).id
  end

  test "shows an owned category" do
    get "/api/v1/categories/#{categories(:one).id}", headers: @headers

    assert_response :ok
    assert_equal categories(:one).id, JSON.parse(response.body)["data"]["id"]
  end

  test "does not show another user's category" do
    get "/api/v1/categories/#{categories(:two).id}", headers: @headers

    assert_response :not_found
  end

  test "creates a category for the owner" do
    assert_difference "users(:one).categories.count", 1 do
      post "/api/v1/categories", params: { category: { name: "Academia" } }, headers: @headers, as: :json
    end

    assert_response :created
    assert_equal "Academia", JSON.parse(response.body)["data"]["name"]
  end

  test "rejects a category without a name" do
    post "/api/v1/categories", params: { category: { name: "" } }, headers: @headers, as: :json

    assert_response :unprocessable_entity
    assert JSON.parse(response.body)["errors"].present?
  end

  test "updates an owned category" do
    patch "/api/v1/categories/#{categories(:one).id}", params: { category: { name: "Mercado" } },
          headers: @headers, as: :json

    assert_response :ok
    assert_equal "Mercado", categories(:one).reload.name
  end

  test "does not update another user's category" do
    patch "/api/v1/categories/#{categories(:two).id}", params: { category: { name: "Invadido" } },
          headers: @headers, as: :json

    assert_response :not_found
    assert_not_equal "Invadido", categories(:two).reload.name
  end

  test "deletes a category and moves its expenses to the default category" do
    expense = expenses(:one)
    assert_equal categories(:one).id, expense.category_id

    delete "/api/v1/categories/#{categories(:one).id}", headers: @headers

    assert_response :no_content
    assert_not Category.exists?(categories(:one).id)
    assert_equal "Sem categoria", expense.reload.category.name
  end

  test "refuses to delete the default category" do
    default = users(:one).categories.create!(name: "Sem categoria")

    delete "/api/v1/categories/#{default.id}", headers: @headers

    assert_response :unprocessable_entity
    assert Category.exists?(default.id)
  end

  test "does not delete another user's category" do
    delete "/api/v1/categories/#{categories(:two).id}", headers: @headers

    assert_response :not_found
    assert Category.exists?(categories(:two).id)
  end
end
