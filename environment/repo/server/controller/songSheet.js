const commonParams = require('../config/commonParams.js')
const path = require('path')
const request = require('request')
 
const { createSong } = require('../config')
const { getSongPlayUrl } = require('./musicPlayData')

exports.getCategoryTags = function(req, res) {
  request(
    {
      url: 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_tag_conf.fcg',
      headers: {
        referer: 'http://y.qq.com',
      },
      qs: commonParams,
    },
    function(error, response, body) {
      if (error) {
        console.error('getCategoryTags error:', error)
        res.status(500).json({ error: 'Request failed', message: error.message })
        return
      }
      if (response.statusCode == 200) {
        res.send(body)
      } else {
        res.status(response.statusCode).json({ error: 'Request failed', statusCode: response.statusCode })
      }
    }
  )
}
exports.getSongSheetList = function(req, res) {
  let params = Object.assign(
    {},
    commonParams,
    {
      picmid: '1',
      categoryId: '10000000',
      sortId: '5',
    },
    req.query
  )

  request(
    {
      url: `https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg`,
      headers: {
        referer: 'http://y.qq.com',
      },
      qs: params,
    },
    function(error, response, body) {
      if (error) {
        console.error('getSongSheetList error:', error)
        res.status(500).json({ error: 'Request failed', message: error.message })
        return
      }
      if (response.statusCode == 200) {
        res.send(body)
      } else {
        res.status(response.statusCode).json({ error: 'Request failed', statusCode: response.statusCode })
      }
    }
  )
}

exports.getSongList = function(req, res) {
  let params = Object.assign(
    {},
    commonParams,
    {
      type: 1,
      json: 1,
      utf8: 1,
      onlysong: 0,
      ...req.query,
    }
    
  )

  
  request(
    {
      url: `https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg`,
      qs: params,
      headers: {
        referer: 'https://y.qq.com/',
        host: 'y.qq.com',
      },
    },
    async function(error, response, body) {
      if (error) {
        console.error('Request error:', error)
        res.status(500).json({ error: 'Request failed', message: error.message })
        return
      }
      
      if (response.statusCode == 200) {
        let songlist = []
        try {
          const data = JSON.parse(body)
          if (data.cdlist && data.cdlist[0] && data.cdlist[0].songlist) {
            songlist = data.cdlist[0].songlist
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          res.status(500).json({ error: 'Invalid JSON response', message: parseError.message })
          return
        }
        
        if (!songlist || songlist.length === 0) {
          res.json([])
          return
        }
        
        try {
          const url = await getSongPlayUrl(songlist.map(item => item.songmid))

          res.json(
            songlist
              .map(item => {
                item.purl = url[item.songmid]
                return createSong(item)
              })
              .filter(item => item.purl)
          )
        } catch (processError) {
          console.error('Process error:', processError)
          res.status(500).json({ error: 'Process failed', message: processError.message })
        }
      } else {
        res.status(response.statusCode).json({ error: 'Request failed', statusCode: response.statusCode })
      }
    }
  )
}
