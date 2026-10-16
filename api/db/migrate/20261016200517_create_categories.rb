class CreateCategories < ActiveRecord::Migration[8.1]
  def change
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")

    create_table :categories, id: :uuid, default: "gen_random_uuid()" do |t|
      t.string :name, null: false
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
