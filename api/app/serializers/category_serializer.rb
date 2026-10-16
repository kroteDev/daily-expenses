class CategorySerializer
  include JSONAPI::Serializer
  attributes :id, :name, :user_id, :created_at, :updated_at
end
