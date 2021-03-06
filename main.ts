import {
    CacheType,
    Client,
    DMChannel,
    Guild,
    GuildBan,
    GuildMember,
    Intents,
    Interaction,
    Message,
    NonThreadGuildBasedChannel,
    PartialGuildMember,
    PartialMessage,
    PartialUser,
    Role,
    TextChannel,
    User,
} from 'discord.js'
import { actSSOCookie, discordSecret, environment } from './client-env'
import { CommandRunner } from './General/commandRunner'
import { MessageHelper } from './helpers/messageHelper'
import { DailyJobs } from './Jobs/dailyJobs'
import { WeeklyJobs } from './Jobs/weeklyJobs'
import { UserUtils } from './utils/userUtils'

const Discord = require('discord.js')

const schedule = require('node-schedule')
const API = require('call-of-duty-api')()
require('dotenv').config()

export class MazariniClient {
    private client: Client
    private commandRunner: CommandRunner
    private messageHelper: MessageHelper
    private numMessages: number
    private isTest: boolean
    private startTime: Date

    constructor() {
        this.client = new Discord.Client({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_INVITES,
                Intents.FLAGS.DIRECT_MESSAGES,
                Intents.FLAGS.GUILD_BANS,
                Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_MESSAGE_TYPING,
                Intents.FLAGS.GUILD_PRESENCES,
                Intents.FLAGS.GUILD_WEBHOOKS,
                Intents.FLAGS.GUILD_INTEGRATIONS,
                Intents.FLAGS.DIRECT_MESSAGE_TYPING,
                Intents.FLAGS.GUILD_VOICE_STATES,
            ],
        })
        this.messageHelper = new MessageHelper(this.client)
        this.commandRunner = new CommandRunner(this.client, this.messageHelper)
        this.startTime = new Date()
        this.numMessages = 0
        this.isTest = environment === 'dev'
    }

    async initClient() {
        /** Login client */
        await this.client.login(discordSecret)
        this.setupClient(this.client)
    }

    setupClient(client: Client) {
        const _mzClient = this
        const _msgHelper = this.messageHelper
        client.on('ready', async () => {
            try {
                await API.loginWithSSO(actSSOCookie)
            } catch (Error) {
                console.log('Failed to log in to activision with sso cookie. ')
            }
            const today = new Date()
            console.log(`Logged in as ${_mzClient.client.user?.tag} ${today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()} !`)

            if (environment == 'prod')
                _msgHelper.sendMessageToActionLog(
                    _mzClient.client.channels.cache.get('810832760364859432') as TextChannel,
                    'Boten er n?? live i production mode.'
                )

            _mzClient.client?.user?.setPresence({
                activities: [
                    {
                        type: 'WATCHING',
                        name: 'for "!mz" commands',
                    },
                ],
                afk: false,
                status: 'online',
            })

            /** SCHEDULED JOBS */
            //https://www.npmjs.com/package/node-schedule
            /** Runs every day at 08:00 */
            const dailyJob = schedule.scheduleJob('0 8 * * *', async function () {
                const jobs = new DailyJobs(_msgHelper)
                jobs.runJobs()
            })
            /** Runs once a week at mondays 08:00 */
            const weeklyJob = schedule.scheduleJob('0 8 * * 1', async function () {
                const jobs = new WeeklyJobs(_msgHelper)
                jobs.runJobs()
            })

            const guild = client.guilds.cache.find((g: Guild) => g.id === '340626855990132747') as Guild
            const bot = guild.members.cache.find((member) => member.id === '802945796457758760')
            bot?.setNickname(environment === 'dev' ? 'Bot H??ie (TEST)' : 'Bot H??ie')
        })

        /** For all sent messages */
        client.on('messageCreate', async (message: Message) => {
            _mzClient.numMessages++
            //Do not reply to own messages. Do not trigger on pinned messages
            if (message.author == client.user || message.type == 'CHANNEL_PINNED_MESSAGE') return

            _mzClient.commandRunner.runCommands(message)
        })

        /** For interactions (slash-commands and user-commands) */
        client.on('interactionCreate', async (interaction: Interaction<CacheType>) => {
            _msgHelper.sendMessage(
                interaction?.channelId ?? '810832760364859432',
                'Interaksjoner er for ??yeblikket skrudd av, da det trenger en oppdatering for Discord v16.'
            )
        })

        client.on('channelDelete', (channel: DMChannel | NonThreadGuildBasedChannel) => {
            const id = '810832760364859432'
            _msgHelper.sendMessage(id, `Channel med ID ${channel.id} ble slettet`)
        })

        client.on('guildBanAdd', (ban: GuildBan) => {
            const id = '810832760364859432'
            _msgHelper.sendMessage(id, `${ban.user.username} ble bannet pga ${ban?.reason}`)
        })

        client.on('guildCreate', (guild: Guild) => {
            _msgHelper.sendMessageToActionLog(guild.channels.cache.first() as TextChannel, 'Botten ble lagt til i en ny guild')
        })

        client.on('guildMemberAdd', async (member: GuildMember) => {
            UserUtils.onAddedMember(member, _msgHelper)
        })
        client.on('guildMemberRemove', (member: GuildMember | PartialGuildMember) => {
            UserUtils.onMemberLeave(member, _msgHelper)
        })

        client.on('userUpdate', function (oldUser: User | PartialUser, newUser: User) {
            UserUtils.onUserUpdate(oldUser, newUser, _msgHelper)
        })

        //Emitted whenever a guild member changes - i.e. new role, removed role, nickname.
        client.on('guildMemberUpdate', function (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) {
            UserUtils.onMemberUpdate(oldMember, newMember, _msgHelper)
        })

        client.on('roleCreate', function (role: Role) {
            _msgHelper.sendMessageToActionLog(role.guild.channels.cache.first() as TextChannel, 'En ny rolle er opprettet: ' + role.name)
        })
        client.on('roleDelete', function (role: Role) {
            _msgHelper.sendMessageToActionLog(role.guild.channels.cache.first() as TextChannel, 'En rolle er slettet: ' + role.name)
        })

        client.on('messageUpdate', function (oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
            _mzClient.commandRunner.checkForCommand(newMessage as Message)
            _mzClient.commandRunner.checkMessageForJokes(newMessage as Message)
        })

        client.on('warn', function (info: string) {
            _msgHelper.sendMessageToActionLog(client.channels.cache.get('810832760364859432') as TextChannel, 'En advarsel ble fanget opp. Info: \n ' + info)
        })
        client.on('error', function (error: Error) {
            _msgHelper.sendMessageToActionLog(
                client.channels.cache.get('810832760364859432') as TextChannel,
                'En feilmelding ble fanget opp. Error: \n ' + error
            )
        })
    }
}
