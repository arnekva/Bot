import { GuildMember, Message, PartialGuildMember, PartialUser, Role, TextChannel, User } from 'discord.js'
import { DatabaseHelper } from '../helpers/databaseHelper'
import { MessageHelper } from '../helpers/messageHelper'
const diff = require('deep-diff')
export namespace UserUtils {
    /**
     * Get a Member object by supplying a user id
     * @param userId User ID of Member
     * @param message needed to find the guild
     * @returns Member Object (undefined if none)
     */
    export const findMemberByUserID = (userId: string, message: Message) => {
        return message.guild?.members?.cache.find((m) => m.id === userId)
    }

    /**
     * Get a user object by supplying a username
     * @param username Username of user
     * @param rawMessage needed to find the guild
     * @returns User object or undefined
     */
    export const findUserByUsername = (username: string, rawMessage: Message) => {
        return rawMessage.client.users.cache.find((user) => user.username == username)
    }

    /**
     * Get a user object by supplying a user id
     * @param id User ID
     * @param rawMessage needed to find the guild
     * @returns User object or undefined
     */
    export const findUserById = (id: string, rawMessage: Message) => {
        return rawMessage.client.users.cache.find((user) => user.id == id)
    }

    /**
     * Get a Member object from a username
     * @param username Username of user
     * @param rawMessage needed to find the guild
     * @returns Member object or undefined
     */
    export const findMemberByUsername = (username: string, rawMessage: Message) => {
        const user = UserUtils.findUserByUsername(username, rawMessage)
        if (user) return UserUtils.findMemberByUserID(user.id, rawMessage)
        return undefined
    }

    export const compareMember = (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
        if (newMember.id === '802945796457758760') return //Ikke gjør noe når bot oppdateres
        if (oldMember.id === '802945796457758760') return

        const role = roleArraysEqual([...oldMember.roles.cache.values()], [...newMember.roles.cache.values()])
        if (role) {
            return 'role: ' + role.name
        }
        if (oldMember.nickname !== newMember.nickname)
            return 'nickname: ' + (oldMember.nickname ?? oldMember.displayName) + ' endret til ' + (newMember.nickname ?? newMember.displayName)
        if (oldMember.user.username !== newMember.user.username) return 'username'

        if (oldMember.nickname !== newMember.nickname) return 'nickname'
        if (oldMember.nickname !== newMember.nickname) return 'nickname'
    }

    export const roleArraysEqual = (a: any[], b: any[]) => {
        if (a === b) return undefined
        if (a == null || b == null) return undefined

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) {
                if (a.length > b.length) return a[i] as Role
                else return b[i] as Role
            }
        }
        return undefined
    }

    export const onAddedMember = async (member: GuildMember, msgHelper: MessageHelper) => {
        const msg = await msgHelper.sendMessage(
            '340626855990132747',
            'Welcome to the Gulag, ' + (member.nickname ?? member.displayName) + '. Bruk commanden "!mz role" for å gi deg selv roller for å komme i gang'
        )
        DatabaseHelper.setValue('chips', member.user.username, '5000')
        msgHelper.sendMessageToActionLog(
            member.guild.channels.cache.first() as TextChannel,
            'En bruker ble med i Mazarini: ' + (member.nickname ?? member.displayName)
        )
    }

    export const onMemberLeave = async (member: GuildMember | PartialGuildMember, msgHelper: MessageHelper) => {
        msgHelper.sendMessage('340626855990132747', 'Farvell, ' + (member.nickname ?? member.displayName))
        msgHelper.sendMessageToActionLog(
            member.guild.channels.cache.first() as TextChannel,
            'En bruker forlot Mazarini: ' + (member.nickname ?? member.displayName)
        )
    }

    export const onUserUpdate = (oldUser: User | PartialUser, newUser: User | PartialUser, msgHelper: MessageHelper) => {
        if (oldUser.id === '802945796457758760') return
        msgHelper.sendMessageToActionLog(
            newUser.client.channels.cache.first() as TextChannel,
            'Oppdatert bruker:   ' + oldUser.username + ' -> ' + newUser.username + ''
        )
    }
    export const onMemberUpdate = (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember, msgHelper: MessageHelper) => {
        if (newMember.id === '802945796457758760') return //Ikke gjør noe når bot oppdateres
        if (oldMember.id === '802945796457758760') return
        if (oldMember.user.username === 'MazariniBot') return
        const diffCalc = diff.diff
        const differences = diff(oldMember, newMember)
        const whatChanged = UserUtils.compareMember(oldMember, newMember)
        let changesString = ''
        if (differences) {
            differences.forEach((change: any, index: number) => {
                changesString += change.path + (index == differences.length ? ' ' : ',')
            })
            msgHelper.sendMessageToActionLog(
                newMember.client.channels.cache.first() as TextChannel,
                'Oppdatert bruker ' + (oldMember.nickname ?? oldMember.displayName) + ': ' + whatChanged + '.'
            )
        }
    }
}
