import { ChatGPTAPI } from 'chatgpt'
import dotenv from 'dotenv'

const env = dotenv.config().parsed // 环境参数

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), ms)
  })
}

const api = new ChatGPTAPI({
  apiKey: env.OPENAI_API_KEY,
  debug: false,
})

const ConversationPool = {}
const RetryPool = {}

// 获取 chatGPT 的回复
export async function getChatGPTReply(talkerId, content) {
  RetryPool[talkerId] = 1
  return getReply(talkerId, content)
}

async function getReply(talkerId, content) {
  try {
    console.log('[content]: ', content)
    const conversation = ConversationPool[talkerId]
    // 调用ChatGPT的接口
    const reply = await api.sendMessage(content, {
      conversationId: conversation?.conversationId,
      parentMessageId: conversation?.messageId,
      //  "ChatGPT 请求超时！最好开下全局代理。"
      timeoutMs: 2 * 60 * 1000,
    })
    ConversationPool[talkerId] = {
      messageId: reply.id,
      conversationId: reply.conversationId,
    }
    console.log('[reply]: ', reply.text)
    return reply.text
  } catch (e) {
    if (RetryPool[talkerId]) {
      delete RetryPool[talkerId]
      console.log(e)
      console.log('retry...')
      await delay(1000)
      return getReply(talkerId, content)
    }
    throw e
  }
}
