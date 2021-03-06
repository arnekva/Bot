import { ArrayUtils } from './arrayUtils'
import { getRandomPercentage } from './randomUtils'

/** Return a matching emoji for the given letter. Some letters have more than one matching emoji (set isSecond to true to get second one), and there can be up to 7 spaces */
export function findLetterEmoji(sentLetter: string, isSecond?: boolean, spaceCounter?: number) {
    let letter = ''
    switch (sentLetter.toUpperCase()) {
        case 'A':
            letter = isSecond ? 'đ°' : 'đĻ'
            break
        case 'B':
            letter = isSecond ? 'đą' : 'đ§'
            break
        case 'C':
            letter = isSecond ? 'ÂŠī¸' : 'đ¨'
            break
        case 'D':
            letter = 'đŠ'
            break
        case 'E':
            letter = 'đĒ'
            break
        case 'F':
            letter = 'đĢ'
            break
        case 'G':
            letter = 'đŦ'
            break
        case 'H':
            letter = 'đ­'
            break
        case 'I':
            letter = isSecond ? 'âš' : 'đŽ'
            break
        case 'J':
            letter = 'đ¯'
            break
        case 'K':
            letter = 'đ°'
            break
        case 'L':
            letter = 'đą'
            break
        case 'M':
            letter = isSecond ? 'âī¸' : 'đ˛'
            break
        case 'N':
            letter = 'đŗ'
            break
        case 'O':
            letter = isSecond ? 'đž' : 'đ´'
            break
        case 'P':
            letter = isSecond ? 'đŋī¸' : 'đĩ'
            break
        case 'Q':
            letter = 'đļ'
            break
        case 'R':
            letter = isSecond ? 'ÂŽī¸' : 'đˇ'
            break
        case 'S':
            letter = isSecond ? 'đ˛' : 'đ¸'
            break
        case 'T':
            letter = isSecond ? 'âī¸' : 'đš'
            break
        case 'U':
            letter = 'đē'
            break
        case 'V':
            letter = isSecond ? 'âī¸' : 'đģ'
            break
        case 'W':
            letter = 'đŧ'
            break
        case 'X':
            letter = isSecond ? 'â' : 'đŊ'
            break
        case 'Y':
            letter = 'đž'
            break
        case 'Z':
            letter = 'đŋ'
            break
        case 'Ã':
            letter = 'đˇī¸'
            break
        case 'Ã':
            letter = 'đĢ'
            break
        case ' ':
            letter = 'âŦ'
            if (spaceCounter == 1) letter = 'đĻ'
            if (spaceCounter == 2) letter = 'đĒ'
            if (spaceCounter == 3) letter = 'đĨ'
            if (spaceCounter == 4) letter = 'âŦ'
            if (spaceCounter == 5) letter = 'đĢ'
            if (spaceCounter == 6) letter = 'đŠ'

            break

        case '0':
            letter = '0ī¸âŖ'
            break
        case '1':
            letter = '1ī¸âŖ'
            break
        case '2':
            letter = '2ī¸âŖ'
            break
        case '3':
            letter = '3ī¸âŖ'
            break
        case '4':
            letter = '4ī¸âŖ'
            break
        case '5':
            letter = '5ī¸âŖ'
            break
        case '6':
            letter = '6ī¸âŖ'
            break
        case '7':
            letter = '7ī¸âŖ'
            break
        case '8':
            letter = '8ī¸âŖ'
            break
        case '9':
            letter = '9ī¸âŖ'
            break
        case '!':
            letter = isSecond ? 'â' : 'â'
            break
        case '?':
            letter = isSecond ? 'â' : 'â'
            break
        case '$':
            letter = 'đ˛'
            break

        default:
            break
    }
    return letter
}

export function findFeseText(author: string | undefined, randomName: string | undefined) {
    const isAuthorVictim = getRandomPercentage(50)
    return ArrayUtils.randomChoiceFromArray(
        isAuthorVictim ? feseArray(randomName ?? 'Thomas', author ?? 'Thomas') : feseArray(author ?? 'Thomas', randomName ?? 'Thomas')
    )
}

export function feseArray(user1: string, user2: string) {
    return [
        `${user1} har fese`,
        `${user1} har skamfese`,
        `${user1} feis pÃĨ ${user2}`,
        `${user1} fise sÃĨ ${user2} riste`,
        `${user1} fise sÃĨ han riste`,
        `${user1} traff ${user2} i fjese`,
        `${user1} blei troffen i fjese av ${user2}`,
        `${user1} feis, men ${user2} brukte speil`,
        `${user1} feis, men ${user2} brukte speil. ${user1} brukte skjold, sÃĨ ${user2} blei fort eid der ja`,
        `${user1} traff ${user2} rett i fleisen`,
        `${user1} va pÃĨ besÃ¸g hos ${user2} og nuka dassen`,
        `${user1} lukta ${user2} sin fis, men den som kjente sendte`,
        `${user1} va pÃĨ besÃ¸g hos ${user2} og nuka dassen`,
        `${user1} slapp ein silent but deadly ein pÃĨ ${user2} `,
        `${user1}: "Har du fese?". ${user2}: "DEN SÃ KJENTE SENDTE" `,
        `${user1} feis pÃĨ Thomas`,
        `Yo, ${user1}, gidde du roa deg, eg prÃ¸ve ÃĨ sova her. Heila huse riste`,
    ]
}
