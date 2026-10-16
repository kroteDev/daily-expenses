class CreateIncomings < ActiveRecord::Migration[8.1]
  def change
    create_table :incomings, id: :uuid, default: "gen_random_uuid()" do |t|
      t.references :user, null: false, foreign_key: true
      t.date :date, null: false
      t.integer :amount_cents, null: false
      t.string :origin, null: false

      t.timestamps
    end
  end
end
