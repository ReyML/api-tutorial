const PORT = process.env.PORT || 8000
const express = require("express")
const axios = require("axios").default
const cheerio = require("cheerio")
const { response } = require("express")

const app = express()
app.listen(PORT, () => console.log(`Running on port ${PORT}`))

app.get("/", (req, res) => {
  res.json("Welcome to my api")
})

const articles = []

const newspapers = [
  {
    name: "theTimes",
    adress: "https://www.thetimes.co.uk/environment/climate-change",
    base: "",
  },
  {
    name: "guardian",
    adress: "https://www.theguardian.com/environment/climate-crisis",
    base: "",
  },
  {
    name: "telegraph",
    adress: "https://www.telegraph.co.uk/climate-change",
    base: "https://www.telegraph.co.uk",
  },
]

newspapers.forEach((newspaper) => {
  axios.get(newspaper.adress).then((response) => {
    const html = response.data
    const $ = cheerio.load(html)
    $('a:contains("climate")', html).each(function () {
      const title = $(this).text()
      const url = $(this).attr("href")

      articles.push({
        title,
        url: newspaper.base + url,
        source: newspaper.name,
      })
    })
  })
})

app.get("/news", (req, res) => {
  res.json(articles)
})

app.get("/news/:newspaperId", async (req, res) => {
  const newspaperId = req.params.newspaperId
  const newspaperAddress = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].address
  const newspaperBase = newspapers.filter((newspaper) => {
    newspaper.name == newspaperId
  })[0].base

  axios
    .get(newspaperAddress)
    .then((response) => {
      const html = response.data
      const $ = cheerio.load(html)
      const specificArticles = []
      $('a:contains("climate")', html).each(function () {
        const title = $(this).text()
        const url = $(this).attr("href")
        specificArticles.push({
          title,
          url: newspaperBase + url,
          source: newspaperId,
        })
      })
      res.json(specificArticles)
    })
    .catch((err) => {
      console.log(err)
    })
})
