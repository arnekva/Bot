import { Client, Message, MessageEmbed, TextChannel } from 'discord.js'
import { MessageHelper } from '../helpers/messageHelper'
import { ICommandElement } from '../General/commands'
const fetch = require('node-fetch')
import { WeatherUtils } from '../utils/weatherUtils'
import { AbstractCommands } from '../Abstracts/AbstractCommand'
import { weatherAPIKey } from '../client-env'

export class Weather extends AbstractCommands {
    constructor(client: Client, messageHelper: MessageHelper) {
        super(client, messageHelper)
    }

    private getWeatherForGivenCity(message: Message, city: string) {
        const rootUrl = 'https://api.openweathermap.org/data/2.5/weather?'

        const cityWithoutSpecialChars = city.replace('æ', 'ae').replace('ø', 'o').replace('å', 'a')

        const fullUrl = rootUrl + 'q=' + cityWithoutSpecialChars + '&appid=' + weatherAPIKey + '&lang=NO'
        const response = city

        fetch(fullUrl, {
            method: 'GET',
        })
            .then((res: any) => {
                if (!res.ok) {
                    throw new Error(res.status.toString())
                }
                res.json().then((el: any) => {
                    const temperature: string = WeatherUtils.kelvinToCelcius(el.main.temp).toFixed(1).toString()
                    const weatherDescription = el.weather.map((weatherObj: any) => weatherObj.description).join(', ')
                    const weather = new MessageEmbed()
                        .setTitle(`☁️ Vær - ${el.name} ☀️`)
                        .setDescription(``)
                        .addField(
                            'Temperatur',
                            `Det er ${temperature} grader (føles som ${WeatherUtils.kelvinToCelcius(el.main.feels_like)
                                .toFixed(1)
                                .toString()}).\nLaveste er ${WeatherUtils.kelvinToCelcius(el.main.temp_min)
                                .toFixed(1)
                                .toString()}°, høyeste er ${WeatherUtils.kelvinToCelcius(el.main.temp_max).toFixed(1).toString()}°`
                        )
                        .addField(`Forhold`, `Det er ${weatherDescription}`)
                        .addField(`Vind`, `${el.wind.speed} m/s`)

                    this.messageHelper.sendFormattedMessage(message.channel as TextChannel, weather)
                })
            })
            .catch((error: Error) => {
                this.messageHelper.sendMessage(message.channelId, 'Fant ikke byen')
            })
    }
    public getAllCommands(): ICommandElement[] {
        return [
            {
                commandName: 'vær',
                description: 'Sjekk været på et gitt sted',
                command: (rawMessage: Message, messageContent: string, args: string[]) => {
                    this.getWeatherForGivenCity(rawMessage, messageContent)
                },
                category: 'annet',
            },
        ]
    }
}
