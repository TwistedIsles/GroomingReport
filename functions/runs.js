const axios = require("axios")
const cheerio = require("cheerio")

exports.handler = function(event, context, callback) {
  const url =
    "https://www.sunpeaksresort.com/ski-ride/weather-conditions-cams/lifts-trail-status?response_type=ajax"

  const levelClassMapping = {
    "icon-trail_1-beginner ski": "green",
    "icon-trail_2-intermediate ski": "blue",
    "icon-trail_3-advanced ski": "black",
    "icon-trail_4-expert ski": "double",
    "icon-trail_6-glades ski": "glades",
  }
  const statusClassMapping = {
    "icon-open": "open",
    "icon-closed": "closed",
    "icon-tick groomed": "groomed",
    "icon-tick groomed-with-fresh": "groomedWithFresh",
  }

  axios
    .get(url)
    .then(res => {
      const $ = cheerio.load(res.data, {
        xml: {
          normalizeWhitespace: true,
        },
      })
      const runStatusGroup = $(".inner-listing")
      const runArticles = $(runStatusGroup)
        .children(".lift-trail-header")
        .nextAll()
        .filter(".node")

      const runs = []
      $(runArticles).map(function(i, el) {
        const level = $(this)
          .find(".level")
          .find("span")
          .attr("class")
          .trim()

        const name = $(this)
          .children(".name")
          .text()
          .trim()

        const status = $(this)
          .find(".status")
          .find("span")
          .attr("class")
          .trim()

        runs.push({
          status: statusClassMapping[status],
          level: levelClassMapping[level],
          name,
        })
      })

      callback(null, { statusCode: 200, body: JSON.stringify(runs) })
    })
    .catch(error => {
      callback(error, { statusCode: 500, body: null })
    })
}
