class CreateFriendships < ActiveRecord::Migration
  def change
    create_table :friendships do |t|
      t.integer :from_user_id
      t.integer :to_user_id

      t.timestamps null: false
    end
  end
end
