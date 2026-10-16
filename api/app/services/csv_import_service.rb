# frozen_string_literal: true

require "csv"
require "digest"

class CsvImportService
  EXPECTED_HEADERS = [
    "Data de Compra",
    "Nome no Cartão",
    "Final do Cartão",
    "Categoria",
    "Descrição",
    "Parcela",
    "Valor (em US$)",
    "Cotação (em R$)",
    "Valor (em R$)"
  ].freeze

  def initialize(user)
    @user = user
  end

  def call(file)
    return { created: 0, skipped: 0, duplicates: 0, errors: ["No file provided"] } unless file.present?

    created = 0
    skipped = 0
    duplicates = 0
    errors = []

    default_category = @user.categories.find_or_create_by!(name: "Sem categoria")

    CSV.foreach(file.path, col_sep: ";", headers: true, encoding: "UTF-8") do |row|
      result = process_row(row, default_category)

      case result
      when :created then created += 1
      when :skipped then skipped += 1
      when :duplicate then duplicates += 1
      else errors << result if result.is_a?(String)
      end
    end

    { created: created, skipped: skipped, duplicates: duplicates, errors: errors }
  rescue CSV::MalformedCSVError => e
    { created: 0, skipped: 0, duplicates: 0, errors: ["Malformed CSV: #{e.message}"] }
  end

  private

  def process_row(row, default_category)
    description = row["Descrição"].to_s.strip
    date_string = row["Data de Compra"].to_s.strip
    amount_string = row["Valor (em R$)"].to_s.strip
    usd_string = row["Valor (em US$)"].to_s.strip

    return :skipped if description.blank? || date_string.blank? || amount_string.blank?

    amount_cents = parse_amount(amount_string)
    usd_value = parse_amount(usd_string)

    return :skipped if amount_cents <= 0
    return :skipped if usd_value > 0

    date = parse_date(date_string)
    return "Invalid date: #{date_string}" unless date

    import_hash = Digest::SHA256.hexdigest(
      [@user.id, description.downcase, date.to_s, amount_cents.to_s].join("|")
    )

    existing = @user.expenses.exists?(import_hash: import_hash)
    return :duplicate if existing

    expense = @user.expenses.build(
      name: description,
      date: date,
      price_cents: amount_cents,
      category_id: default_category.id,
      import_hash: import_hash
    )

    if expense.save
      :created
    else
      expense.errors.full_messages.join(", ")
    end
  rescue StandardError => e
    "Row error: #{e.message}"
  end

  def parse_amount(value)
    return 0 if value.blank?

    sanitized = value.strip
                       .gsub(".", "")
                       .gsub(",", ".")
                       .gsub(/[^0-9.\-]/, "")

    (BigDecimal(sanitized) * 100).to_i
  rescue ArgumentError
    0
  end

  def parse_date(value)
    Date.strptime(value, "%d/%m/%Y")
  rescue Date::Error
    nil
  end
end
