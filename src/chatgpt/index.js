import { ChatGPTAPI } from 'chatgpt'
import dotenv from 'dotenv'

const env = dotenv.config().parsed // 环境参数

const api = new ChatGPTAPI({
  apiKey: env.OPENAI_API_KEY,
  debug: false
})

const ConversationPool= {};

// 获取 chatGPT 的回复
export async function getChatGPTReply(talkerId, content) {
  console.log('/ talkerId', talkerId)
  console.log('/ content', content)
  const conversation = ConversationPool[talkerId];
  // 调用ChatGPT的接口
  const reply = await api.sendMessage(content, {
    conversationId:  conversation?.conversationId,
    parentMessageId: conversation?.messageId,
    //  "ChatGPT 请求超时！最好开下全局代理。"
    timeoutMs: 2 * 60 * 1000,
  })
  ConversationPool[talkerId] = {
    messageId: reply.id,
    conversationId: reply.conversationId
  }
  console.log('/ reply', reply.text)
  return reply.text

  // // 如果你想要连续语境对话，可以使用下面的代码
  // const conversation = api.getConversation();
  // return await conversation.sendMessage(content, {
  //   //  "ChatGPT 请求超时！最好开下全局代理。"
  //   timeoutMs: 2 * 60 * 1000,
  // });
}
