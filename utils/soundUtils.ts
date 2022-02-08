import { Message } from 'discord.js'

const say = require('say')

export class SoundUtils {
    static sayText(text: string) {
        // https://github.com/Marak/say.js
        say.speak('Hello', 'Alex', 1.0, (err: string) => {
            if (err) {
                return console.error(err)
            }
        })
    }

    static connectToVoiceChannel(message: Message, messageContent: string) {
        //TODO: Say phrase when connected

        const channel = message.channel.client.channels.cache.get('810832760364859432')
    }
}
