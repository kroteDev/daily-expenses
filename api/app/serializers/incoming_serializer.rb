class IncomingSerializer
  include JSONAPI::Serializer
  attributes :id, :origin, :date, :amount_cents, :user_id, :created_at, :updated_at
end
