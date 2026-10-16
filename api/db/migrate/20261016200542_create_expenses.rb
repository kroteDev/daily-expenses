class CreateExpenses < ActiveRecord::Migration[8.1]
  def change
    create_table :expenses, id: :uuid, default: "gen_random_uuid()" do |t|
      t.references :user, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true, type: :uuid
      t.string :name, null: false
      t.date :date, null: false
      t.integer :price_cents, null: false
      t.string :import_hash

      t.timestamps
    end

    add_index :expenses, [:user_id, :import_hash], unique: true, where: "import_hash IS NOT NULL"
  end
end
