import React from 'react'
import classNames from 'classNames'
import _ from 'lodash'
import Utils from '../../utils'
import ReplyBox from '../../components/messages/replyBox'
import MessagesStore from '../../stores/messages'
import MessageAction from '../../actions/messages'
import UserStore from '../../stores/user'
import UserAction from '../../actions/user'

class MessagesBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = this.initialState
    this.onStoreChange = this._onStoreChange.bind(this)
  }

  get initialState() {
    return {
      friends    : [],
      openChatID : null,
      currentUser: {},
      userList   : [],
      toUser     : {},
    }
  }

  componentWillMount() {
    UserAction.getCurrentUser()
    UserStore.onChange(this.onStoreChange)
    MessagesStore.onChange(this.onStoreChange)
  }

  componentWillUnmount() {
    UserStore.offChange(this.onStoreChange)
    MessagesStore.offChange(this.onStoreChange)
  }

  _onStoreChange() {
    this.setState(this.getStateFromStore())
  }

  getStateFromStore() {
    const friends = UserStore.getFriends()
    var toUser = _.find(friends, ['id', this.state.openChatID])
    if (toUser === void 0) toUser = {}
    return {
      friends    : UserStore.getFriends(),
      openChatID : MessagesStore.getOpenChatUserID(),
      currentUser: UserStore.getCurrentUser(),
      userList   : MessagesStore.getFriendWithMessages(),
      toUser     : toUser,
    }
  }

  destroyMessage(messageID) {
    if (window.confirm('この投稿を削除しますか？(相手からも見えなくなります)')) {
      MessageAction.destroyMessage(this.state.openChatID, messageID)
      MessagesStore.state.friendWithMessages = []
      _.each(this.state.friends, (friend) => {
        MessageAction.getMessagesByFriendID(friend)
      })
    }
  }

  render() {
    var friendWithMessages = _.find(this.state.userList, (list) => list.friend.id === this.state.openChatID)
    if (friendWithMessages === void 0) friendWithMessages = []
    var openChatMessages = friendWithMessages.messages
    if (openChatMessages === void 0) openChatMessages = []
    const messagesList = openChatMessages.map((message) => {
      const messageClasses = classNames({
        'clear'                          : true,
        'message-box__item'              : true,
        'message-box__item--from-current': message.user_id === this.state.currentUser.id,
      })

      let isText = (message.message_type === 'text')
      var imageName = this.state.toUser.image_name
      if (imageName === void 0) imageName = { url: null }
      return (
        <li key = { message.id } className = { messageClasses }>
          <div className = 'user-list__item__picture'>
            <img className = 'icon_by_message' src = { imageName.url }/>
          </div>
          <p>{ this.state.toUser.name }</p>
          <div className = 'message-box__item__contents'>
            { isText ? <span>{ message.content }</span> : <img className = 'image_message' src = { 'message_images/' + message.content } /> }
          </div>
          <div
            key = { message.id }
            onClick = { this.destroyMessage.bind(this, message.id) }
          ><i className = 'far fa-trash-alt'></i></div>
        </li>
      )
    })
    var lastAccess = friendWithMessages.lastAccess
    if (lastAccess === void 0) lastAccess = {}
    const messagesLength = openChatMessages.length
    var lastMessage = openChatMessages[messagesLength - 1]
    if (lastMessage === void 0) lastMessage = {}

    if (lastMessage.user_id === this.state.currentUser.id) {
      if (lastAccess.recipient >= lastMessage.timestamp) {
        const date = Utils.getShortDate(lastMessage.timestamp)
        messagesList.push(
          <li key='read' className='message-box__item message-box__item--read'>
            <div className='message-box__item__contents'>
              Read { date }
            </div>
          </li>
        )
      }
    }

    return (
      <div className = 'message-box'>
        <ul className = 'message-box__list'>
          { messagesList }
        </ul>
        <ReplyBox />
      </div>
    )
  }
}

export default MessagesBox
