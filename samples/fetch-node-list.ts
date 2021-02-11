// import fetch from "node-fetch"
const fetch = require("node-fetch")
const URL = "https://symbolnodes.org/search_testnet/data?_="

interface OriginalRow {
  row: string
  ip: string
  network: string
  role: string
  pubkey: string
  name: string
  loc: string
  height: string
  last: string
}

interface Row {
  ip: string
  network: string
  role: string
  name: string
  loc: string
  height: number
  last: number
}

async function Main() {
  const resp = await fetch(URL + Date.now, {})
  const respData = await resp.json()
  const prettified = respData.data.map((row: OriginalRow) => ({
    url: `http://${row.ip.trim()}:3000`,
    host: row.ip.trim(),
    network: row.network.replace(/&nbsp;/g,' ').replace(/(<([^>]+)>)/gi, "").trim(),
    role: row.role.replace(/&nbsp;/g,' ').replace(/(<([^>]+)>)/gi, "").trim(),
    name: row.name.replace(/(<([^>]+)>)/gi, "").trim(),
    loc: row.loc,
    height: parseInt(row.height.replace(/(<([^>]+)>)/gi, "").trim()),
    last: parseInt(row.height.replace(/(<([^>]+)>)/gi, "").trim()),
  })) as Row[]

  const maxHeight = prettified.reduce((prev, current) => (prev.height > current.height) ? prev : current).height
  const clipHeight = maxHeight - 500
  const data = prettified
    .filter(row => row.height > clipHeight)
    .filter(row => row.role !== 'peer')

  console.log(JSON.stringify(data, null, 2))
}

(async () => {
  await Main()
})()

export {}
