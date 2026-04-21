const request = require('request')
const qs = require('querystring')
const commonParams = require('../config/commonParams')

exports.getMusicPlayData = function(req, res) {
  const songmid = req.query.mid.split(',')

  const songParams = {
    req: {
      module: 'vkey.GetVkeyServer',
      method: 'CgiGetVkey',
      param: {
        guid: '5165714425',
        songmid,
        songtype: [],
        uin: '0',
        loginflag: 0,
        platform: '23',
        h5to: 'speed',
      },
    },
    comm: {
      g_tk: 5381,
      uin: 0,
      format: 'json',
      ct: 23,
      cv: 0,
    },
  }

  request(
    {
      method: 'POST',
      url: 'https://u.y.qq.com/cgi-bin/musicu.fcg?_=1547563489720',
      headers: {
        referer: 'http://u.y.qq.com',
      },
      // body: songParams
      body: JSON.stringify(songParams),
    },
    function(error, response, body) {
      if (error) {
        console.error('getMusicPlayData error:', error)
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

exports.getLyric = function(req, res) {
   

  var musicid = req.query.musicid
  var options = {
    url: 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric.fcg',
    headers: {
      referer: 'http://y.qq.com',
    },
    qs: { ...commonParams, nobase64: 1, musicid, songtype: 0 },
  }

  request(options, function(error, response, body) {
    if (error) {
      console.error('getLyric error:', error)
      res.status(500).json({ error: 'Request failed', message: error.message })
      return
    }
    if (response.statusCode == 200) {
      try {
        var reg = /^\w+\(({[^()]+})\)$/
        var matches = body.match(reg)
        if (matches && matches[1]) {
          res.send(matches[1])
        } else {
          res.json({ lyric: '' })
        }
      } catch (parseError) {
        console.error('getLyric parse error:', parseError)
        res.json({ lyric: '' })
      }
    } else {
      res.status(response.statusCode).json({ error: 'Request failed', statusCode: response.statusCode })
    }
  })
}

exports.getSongPlayUrl = songmid => {
  const songParams = {
    req: {
      module: 'vkey.GetVkeyServer',
      method: 'CgiGetVkey',
      param: {
        guid: '5165714425',
        songmid,
        songtype: [],
        uin: '0',
        loginflag: 0,
        platform: '23',
        h5to: 'speed',
      },
    },
    comm: {
      g_tk: 5381,
      uin: 0,
      format: 'json',
      ct: 23,
      cv: 0,
    },
  }

  return new Promise((resolve, reject) => {
    request(
      {
        method: 'POST',
        url: 'https://u.y.qq.com/cgi-bin/musicu.fcg?_=1547563489720',
        headers: {
          referer: 'http://u.y.qq.com',
        },
        
        body: JSON.stringify(songParams),
      },
      function(error, response, body) {
        let url = {}

        if (error) {
          console.error('getSongPlayUrl error:', error)
          resolve(url)
          return
        }
        if (response.statusCode == 200) {
          try {
            var result = JSON.parse(body)
            if (result.req && result.req.data && result.req.data.midurlinfo) {
              result.req.data.midurlinfo.forEach((item, index) => {
                url[item.songmid] = item.purl
              })
            }
          } catch (parseError) {
            console.error('getSongPlayUrl parse error:', parseError)
          }
          resolve(url)
        } else {
          resolve(url)
        }
      }
    )
  })
}
