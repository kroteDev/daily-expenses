class AddUserIdAndDateIndexes < ActiveRecord::Migration[8.1]
  def change
    add_index :expenses, [:user_id, :date]
    add_index :incomings, [:user_id, :date]
  end
end
