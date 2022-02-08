import { Client, Message } from 'discord.js'
import { AbstractCommands } from '../Abstracts/AbstractCommand'
import { ICommandElement } from '../General/commands'
import { DatabaseHelper } from '../helpers/databaseHelper'
import { MessageHelper } from '../helpers/messageHelper'
import { findLetterEmoji } from '../utils/miscUtils'
import { replaceAtWithTextUsername, reverseMessageString, splitUsername } from '../utils/textUtils'

export class StatusCommands extends AbstractCommands {
    constructor(client: Client, messageHelper: MessageHelper) {
        super(client, messageHelper)
    }

    private async sendUserActivity(message: Message, content: string, args: string[]) {
        let name = splitUsername(message.author.username)
        if (args[0]) name = args[0]
        const guild = message.channel.client.guilds.cache.get('340626855990132747')
        if (guild) {
            const user = guild.members.cache.filter((u) => u.user.username.toLowerCase() === name.toLowerCase()).first()
            if (user && user.presence) {
                if (user.presence.clientStatus) {
                    if (user.presence.activities && user.presence.activities[0]) {
                        const activities = user.presence.activities.filter((a) => a.name.toLowerCase() !== 'custom status').map((act) => act.name)

                        await this.messageHelper.sendMessage(
                            message.channelId,
                            `${name} drive me ${activities.length > 1 ? 'disse aktivitene' : 'aktiviteten'}: ${activities.join(', ')}`
                        )
                    } else {
                        await this.messageHelper.sendMessage(message.channelId, 'Ingen aktivitet registrert på Discord.')
                    }
                }
            } else {
                await this.messageHelper.sendMessage(message.channelId, 'Fant ikke brukeren. Husk at du må bruke **brukernavn** og *ikke* display name')
            }
        }
    }

    private async updateStatus(message: Message, messageContent: string) {
        let content = messageContent
        if (message.mentions.roles.size > 0) {
            message.reply('Du kan kje ha roller i statusen din')
            return
        }
        let url
        if (message.attachments) {
            url = message.attachments.first()?.url
        }

        content = content.replace(/(?:\r\n|\r|\n)/g, ' ')
        content = replaceAtWithTextUsername(content, message)

        if (content.length < 150 && content.trim().length > 0) {
            if (message.content.includes('!zm')) {
                content = reverseMessageString(content)
            }
            DatabaseHelper.setValue('mygling', message.author.username, content + (url ? ' ' + url : ''))
            this.messageHelper.reactWithRandomEmoji(message)
        } else {
            this.messageHelper.sendMessage(
                message.channelId,
                content.trim().length > 0 ? 'Du kan kje ha så møye. Mindre enn 150 tegn, takk' : 'Du må ha tekst i statusen din'
            )
        }
    }
    private async getAllStatus(message: Message) {
        const mygling = await DatabaseHelper.getAllValuesFromPrefix('mygling', message)
        let myglinger = ''
        mygling.forEach((status) => (myglinger += status.val ? status.key + ' ' + status.val + '\n' : ''))
        myglinger = myglinger.trim() ? myglinger : 'Ingen har satt statusen sin i dag'
        this.messageHelper.sendMessage(message.channelId, myglinger)
        // const vals = await DatabaseHelper.getAllValuesFromPrefix("mygling")
    }

    private async reactWithLetters(message: Message, msgContent: string, args: string[] | undefined) {
        const splitTab = msgContent.split(' ')
        let msgId = ''
        let letterTab: string[] = []

        for (let i = 0; i < splitTab.length; i++) {
            let wasPreviousIndexWord = false
            if (splitTab[i].length > 10 && parseInt(splitTab[i])) {
                msgId = splitTab[i]
                wasPreviousIndexWord = false
            } else {
                const newWord = (i == 0 || !wasPreviousIndexWord ? '' : ' ') + splitTab[i]
                wasPreviousIndexWord = true
                letterTab = letterTab.concat(newWord.split(''))
            }
        }
        let messageToReactTo = message
        if (msgId) {
            let searchMessage = await MessageHelper.findMessageById(message, msgId)
            if (searchMessage) messageToReactTo = searchMessage
        }

        let usedLetter = ''
        let spaceCounter = 0
        letterTab.forEach((letter: string) => {
            if (usedLetter.includes(letter) && letter == ' ') {
                spaceCounter++
            }
            const emoji = usedLetter.includes(letter) ? findLetterEmoji(letter, true, spaceCounter) : findLetterEmoji(letter)
            usedLetter += letter
            try {
                messageToReactTo.react(emoji).catch((error) => console.log(error))
            } catch (error) {
                console.log(error)
            }
        })
    }

    public getAllCommands(): ICommandElement[] {
        return [
            {
                commandName: 'spell',
                description: 'Stav ut en setning som emojier i reactions. Reagerer på sendt melding med mindre en message ID legges til. ',
                command: (rawMessage: Message, messageContent: string, args: string[] | undefined) => {
                    this.reactWithLetters(rawMessage, messageContent, args)
                },
                category: 'annet',
            },
            {
                commandName: 'status',
                description: 'Sett din status. Resettes hver dag kl. 08:00',
                command: (rawMessage: Message, messageContent: string) => {
                    this.updateStatus(rawMessage, messageContent)
                },
                category: 'annet',
            },
            {
                commandName: 'statuser',
                description: 'Se alle statuser',
                command: (rawMessage: Message, messageContent: string) => {
                    this.getAllStatus(rawMessage)
                },
                category: 'annet',
            },
            {
                commandName: 'kekw',
                description: 'Hent animerte kekw',
                command: async (rawMessage: Message, messageContent: string, args: string[]) => {
                    const kekw = await rawMessage.client.emojis.cache.find((emoji) => emoji.name == 'kekw_animated')
                    if (kekw) {
                        rawMessage.react(kekw)
                        rawMessage.reply('<a: kekw_animated: ' + kekw?.id + ' > .')
                    }
                },
                category: 'annet',
            },
            {
                commandName: 'aktivitet',
                description: 'Se aktiviten(e) til brukeren',
                command: (rawMessage: Message, messageContent: string, args: string[]) => {
                    this.sendUserActivity(rawMessage, messageContent, args)
                },
                category: 'annet',
            },
        ]
    }
}
