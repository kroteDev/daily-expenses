# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

cors_origins = ENV.fetch("CORS_ORIGINS") { Rails.env.production? ? "https://expenses.krotedev.com.br" : "*" }

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*cors_origins.split(",").map(&:strip))

    resource "*",
      headers: :any,
      expose: [:Authorization],
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
