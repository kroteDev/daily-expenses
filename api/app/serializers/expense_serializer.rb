class ExpenseSerializer
  include JSONAPI::Serializer
  attributes :id, :name, :date, :price_cents, :category_id, :user_id, :import_hash, :created_at, :updated_at
end
