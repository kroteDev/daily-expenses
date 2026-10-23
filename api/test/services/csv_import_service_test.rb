require "test_helper"
require "tempfile"

class CsvImportServiceTest < ActiveSupport::TestCase
  HEADER = "Data de Compra;Nome no Cartão;Final do Cartão;Categoria;Descrição;Parcela;Valor (em US$);Cotação (em R$);Valor (em R$)".freeze

  setup do
    @user = users(:one)
  end

  test "parses amounts with dot decimal separator" do
    assert_equal 3983, parse_amount("39.83")
    assert_equal 19800, parse_amount("198.00")
    assert_equal 200, parse_amount("2.00")
  end

  test "parses amounts with comma decimal separator" do
    assert_equal 200, parse_amount("2,00")
    assert_equal 3983, parse_amount("39,83")
  end

  test "parses thousands separators in both conventions" do
    assert_equal 123456, parse_amount("1.234,56")
    assert_equal 123456, parse_amount("1,234.56")
    assert_equal 123400, parse_amount("1.234")
  end

  test "keeps the sign of negative amounts" do
    assert_equal(-8325, parse_amount("-83.25"))
    assert_equal(-8325, parse_amount("-83,25"))
  end

  test "ignores currency symbols and blanks" do
    assert_equal 200, parse_amount("R$ 2,00")
    assert_equal 0, parse_amount("")
    assert_equal 0, parse_amount(nil)
  end

  test "imports dot decimal amounts without inflating them" do
    file = build_csv([row(description: "Mercado", amount: "39.83")])

    result = import(file)

    assert_equal 1, result[:created]
    assert_equal 3983, @user.expenses.find_by!(name: "Mercado").price_cents
  end

  test "skips refunds and foreign currency rows" do
    file = build_csv([
      row(description: "Estorno", amount: "-83.25"),
      row(description: "Compra internacional", amount: "10.00", usd: "2.00")
    ])

    result = import(file)

    assert_equal 0, result[:created]
    assert_equal 2, result[:skipped]
    assert_not @user.expenses.exists?(name: "Estorno")
    assert_not @user.expenses.exists?(name: "Compra internacional")
  end

  test "does not import the same row twice" do
    file = build_csv([row(description: "Padaria", amount: "12.50")])

    import(file)
    result = import(file)

    assert_equal 0, result[:created]
    assert_equal 1, result[:duplicates]
    assert_equal 1, @user.expenses.where(name: "Padaria").count
  end

  test "imports the sample invoice with correct amounts" do
    file = Rack::Test::UploadedFile.new(Rails.root.join("../references/csv/Fatura_2026-10-10.csv"), "text/csv")

    result = CsvImportService.new(@user).call(file)

    assert_empty result[:errors]
    assert_operator result[:created], :>, 0
    assert @user.expenses.exists?(name: "PG *ITALIANO FACIL ITF", price_cents: 3983)
    assert @user.expenses.exists?(name: "PG *ITALIANO FACIL ITF", price_cents: 19800)
  end

  private

  def parse_amount(value)
    CsvImportService.new(@user).send(:parse_amount, value)
  end

  def row(description:, amount:, usd: "0", date: "10/10/2026")
    [date, "TITULAR", "1234", "Outros", description, "única", usd, "0", amount].join(";")
  end

  def build_csv(rows)
    file = Tempfile.new(["fatura", ".csv"])
    file.write([HEADER, *rows].join("\r\n"))
    file.flush
    Rack::Test::UploadedFile.new(file.path, "text/csv")
  end

  def import(file)
    CsvImportService.new(@user).call(file)
  end
end
