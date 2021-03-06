import { Message } from 'discord.js'
const leetReg = new RegExp(/(1337)/gi)

export namespace MessageUtils {
    export const doesMessageIdHaveCoolNumber = (message: Message) => {
        const msgId = message.id
        if (leetReg.test(msgId)) return '1337'
        return 'none'
    }
}
