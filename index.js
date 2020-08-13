const app = require('express')()
const axios = require('axios')
const { JSDOM } = require('jsdom')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

const getInfo = async () => {
    try {
        let res = await axios.get('https://ncov.moh.gov.vn/vi')
        let { data } = await res
        return data
    } catch (e) {
        console.error(e)
    }
}

const apiTracker = (data) => {
    return new Promise(resolve => {
        let re = /class=\"font24\">(.*?)<\/span>/gm
        const { document } = (new JSDOM(data)).window
        let { children } = document.getElementsByTagName('tbody')[0]
        let detail = []
        for(let i = 0; i < children.length; i++) {
            detail.push({
                city: children[i].children[0].innerHTML,
                total: parseInt(children[i].children[1].innerHTML),
                treatment: parseInt(children[i].children[2].innerHTML),
                death: parseInt(children[i].children[3].innerHTML)
            })
        }
        let result = data.match(re).map(item => parseInt(item.match(/>(.*?)<\//m)[1].replace(/\./g, '')))
        resolve({
            data: {
                general: {
                    data: [
                        {
                            handle: 'Vietnam',
                            total: result[0],
                            treatment: result[1],
                            recovered: result[2],
                            death: result[3]
                        },
                        {
                            handle: 'International',
                            total: result[4],
                            treatment: result[5],
                            recovered: result[6],
                            death: result[7]
                        }
                    ]
                },
                detail
            }
        })
    })
}

const PORT = process.env.PORT || 1337

app.get('/', async (req, res) => {
    let info = await getInfo()
    let result = await apiTracker(info)
    await res.json(result)
})

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})