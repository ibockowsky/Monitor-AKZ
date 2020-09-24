const request = require("request-promise")
const cheerio = require("cheerio")
const config = require("./config.json")

async function getLessons() {
    const result = await request.get('http://akz.pwr.edu.pl/katalog_zap.html')

    const $ =  cheerio.load(result)

    let tempArray = []
    $("#tabelaHTML > tbody > tr").each((index, element) => {
        const tempObject = {
            id: $(element).children().eq(1).text(),
            name: $(element).children().eq(2).text(),
            count: parseInt($(element).children().eq(5).text())
        }
        tempArray.push(tempObject)
    })

    return tempArray
}

async function sendHook({id, name, count}) {
    await request(
        {
            method: 'POST',
            uri: config.webhook,
            json: true,
            body: {"content": `Nowe miejsca na ${name} [${id}] (${count}) `}
        }
    )
}

async function main() {
    const lessons = await getLessons()
    console.log(config)
    lessons.forEach(async item => {
        if(config.codes.includes(item.id)) {
            if (item.count > 0) {
                console.log(`Nowe miejsca na ${item.name} [${item.id}] (${item.count}) `)
                await sendHook(item)
                config.codes = config.codes.filter(i => {
                    return i !== item.id
                })
            }
        }
    })
}

setInterval(() => main(), 5000)