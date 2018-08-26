module Api
  class MessagesController < ApplicationController
    before_action :open_chat_id_present?

    def open_chat_id_present?
      if params[:open_chat_id] == nil
        render json: []
      end
    end

    def index
      # TODO(Sunny): Messageモデルのchat_room_idはfriendshipのidを入れるようにする
      #              ⇒一旦友達関係がdestroyされるとfriendshipのidも変わってしまうので無理なのでは
      # FIXME(Sunny): chat_roomを全メソッドで定義しているのでドライにできないか？
      chat_room = Friendship.find_by(chat_room_id: chat_room_id(params[:open_chat_id]))
      render json: chat_room.all_messages
    end

    def create
      chat_room   = Friendship.find_by(chat_room_id: chat_room_id(params[:open_chat_id]))
      new_message = Message.new(content: params[:value],
                                from_user_id: current_user.id,
                                chat_room_id: chat_room_id(params[:open_chat_id]),
                                message_type: "text")
      render json: chat_room.all_messages if new_message.save
    end

    def post_image
      posted_image = params[:image]
      chat_room    = Friendship.find_by(chat_room_id: chat_room_id(params[:open_chat_id]))
      path         = Time.now.to_i.to_s + posted_image.original_filename
      output_path  = Rails.root.join('public/message_images', path)
      new_image    = Message.new(content: path,
                                 from_user_id: current_user.id,
                                 chat_room_id: chat_room_id(params[:open_chat_id]),
                                 message_type: "image")

      File.open(output_path, 'w+b') do |fp|
        fp.write  posted_image.tempfile.read
      end

      render json: chat_room.all_messages if new_image.save
    end
  end
end
