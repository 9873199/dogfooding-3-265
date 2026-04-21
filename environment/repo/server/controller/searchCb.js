const commonParams = require('../config/commonParams.js')
const qs = require('querystring')
const request = require('request')
const _ = require('lodash')
const { createSong } = require('../config')

const { getSongPlayUrl } = require('./musicPlayData')

exports.getHotKey = function(req, res) {
  request(
    {
      url: 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg',
      headers: {
        referer: 'http://y.qq.com',
      },
    },
    function(error, response, body) {
      if (error) {
        console.error('Request error:', error)
        res.status(500).json({ error: 'Request failed', message: error.message })
        return
      }
      
      if (response.statusCode == 200) {
        try {
          const data = JSON.parse(body)
          res.json(data)
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          res.status(500).json({ error: 'Invalid JSON response', message: parseError.message })
        }
      } else {
        res.status(response.statusCode).json({ error: 'Request failed', statusCode: response.statusCode })
      }
    }
  )
}

exports.getSongSearchResult = function(req, res) {
  const query = {
    ...req.query,
    p: req.query.offset,
    n: req.query.limit,
  }
  let params = Object.assign({}, commonParams, query)

  var options = {
    method: 'GET',
    url: 'https://c.y.qq.com/soso/fcgi-bin/client_search_cp',

    qs: params,
    headers: {
      referer: 'http://y.qq.com',

      'cache-control': 'no-cache',
    },
  }

  request(options, async function(error, response, body) {
    if (error) {
      console.error('Request error:', error)
      res.status(500).json({ error: 'Request failed', message: error.message })
      return
    }

    let result = []
    try {
      const data = JSON.parse(body)
      if (data.data && data.data.song && data.data.song.list) {
        result = data.data.song.list
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      res.status(500).json({ error: 'Invalid JSON response', message: parseError.message })
      return
    }
    
    if (!result || result.length === 0) {
      res.json([])
      return
    }
    
    try {
      const url = await getSongPlayUrl(result.map(item => item.songmid))

      const searchResult = result
        .map(item => {
          item.purl = url[item.songmid]
          return createSong(item)
        })
        .filter(item => item.purl)

      res.json(searchResult)
    } catch (processError) {
      console.error('Process error:', processError)
      res.status(500).json({ error: 'Process failed', message: processError.message })
    }
  })
}
