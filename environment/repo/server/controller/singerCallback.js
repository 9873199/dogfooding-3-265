const commonParams = require('../config/commonParams.js')
const request = require('request')
const { createSong } = require('../config')
const { getSongPlayUrl } = require('./musicPlayData')

exports.getMusicData = function(req, res) {
  let params = Object.assign(
    {},
    commonParams,
    {
      format: 'json',
      order: 'listen',
      songstatus: '1',
    },
    req.query
  )

  var options = {
    method: 'GET',
    url: 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg',
    qs: params,
    headers: {
      'cache-control': 'no-cache',
    },
  }

  const musicData = new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (error) {
        reject(error)
        return
      }
      try {
        const data = JSON.parse(body)
        if (data.data && data.data.list && Array.isArray(data.data.list)) {
          resolve(data.data.list.map(item => item.musicData))
        } else {
          resolve([])
        }
      } catch (parseError) {
        console.error('getMusicData JSON parse error:', parseError)
        resolve([])
      }
    })
  })

  musicData.then(async list => {
    if (!list || list.length === 0) {
      res.json([])
      return
    }
    try {
      const mids = list.map(item => item.songmid)
      const playurl = await getSongPlayUrl(mids)

      const response = list
        .map(item => {
          item.purl = playurl[item.songmid]
          return createSong(item)
        })
        .filter(item => item.purl)

      res.json(response)
    } catch (processError) {
      console.error('getMusicData process error:', processError)
      res.status(500).json({ error: 'Process failed', message: processError.message })
    }
  }).catch(error => {
    console.error('getMusicData error:', error)
    res.status(500).json({ error: 'Request failed', message: error.message })
  })
}

exports.getAlbumData = function(req, res) {
  const query = req.query
  // query = qs.stringify(query)
  let data = {
    singerAlbum: {
      method: 'get_singer_album',
      param: {
        singermid: query.singermid,

        order: 'time',
        begin: +query.begin || 0,
        num: +query.num || 0,
        exstatus: 1,
      },
      module: 'music.web_singer_info_svr',
    },
  }
  let params = Object.assign({}, commonParams, {
    data: JSON.stringify(data),
  })
  // console.log(JSON.stringify(params))
  var options = {
    method: 'GET',
    url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
    qs: params,
    headers: {
      'cache-control': 'no-cache',
    },
  }

  request(options, function(error, response, body) {
    if (error) {
      console.error('Request error:', error)
      res.status(500).json({ error: 'Request failed', message: error.message })
      return
    }
    try {
      const data = JSON.parse(body)
      res.json(data)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      res.status(500).json({ error: 'Invalid JSON response', message: parseError.message })
    }
  })
}

exports.getMvData = function(req, res) {
  const query = req.query
  let params = Object.assign(
    {},
    commonParams,
    {
      order: 'listen',
      cid: 205360581,
    },
    query
  )

  var options = {
    method: 'GET',
    url: 'https://c.y.qq.com/mv/fcgi-bin/fcg_singer_mv.fcg',
    qs: params,
    headers: {
      'cache-control': 'no-cache',
    },
  }

  request(options, function(error, response, body) {
    if (error) {
      console.error('Request error:', error)
      res.status(500).json({ error: 'Request failed', message: error.message })
      return
    }
    try {
      const data = JSON.parse(body)
      res.json(data)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      res.status(500).json({ error: 'Invalid JSON response', message: parseError.message })
    }
  })
}

exports.getAlbumSongList = (req, res) => {
  const { albumMid, albumID, begin, num } = req.query

  const data = {
    comm: { ct: 24, cv: 10000 },
    albumSonglist: {
      method: 'GetAlbumSongList',
      param: {
        albumMid,
        albumID: parseInt(albumID),
        begin: parseInt(begin),
        // num: parseInt(num),
        order: 2,
      },
      module: 'music.musichallAlbum.AlbumSongList',
    },
  }

  const qs = Object.assign({}, commonParams, {
    data: JSON.stringify(data),
  })

  const options = {
    url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
    qs,
    headers: {
      referer: 'https://y.qq.com',
    },
  }

  request(options, async (err, response, body) => {
    if (err) {
      console.error('Request error:', err)
      res.status(500).json({ error: 'Request failed', message: err.message })
      return
    }
    let songList = []
    try {
      const data = JSON.parse(body)
      if (data.albumSonglist && data.albumSonglist.data && data.albumSonglist.data.songList) {
        songList = data.albumSonglist.data.songList.map(item => item.songInfo)
      }
    } catch (error) {
      console.error('JSON parse error:', error)
      res.status(500).json({ error: 'Invalid JSON response', message: error.message })
      return
    }
    
    if (!songList || songList.length === 0) {
      res.json([])
      return
    }
    
    try {
      const url = await getSongPlayUrl(songList.map(item => item.mid))
      
      const result = songList.map(item => {
        item.purl = url[item.mid]
        item.songid = item.id
        item.songmid = item.mid
        item.songname = item.name
        return createSong(item)
      }).filter(item => item.purl)
      
      res.json(result)
    } catch (error) {
      console.error('Process error:', error)
      res.status(500).json({ error: 'Process failed', message: error.message })
    }
  })
}

exports.getTotalInfo = async (req, res) => {
  const { singermid } = req.query
  console.log(singermid)
  let musicParams = Object.assign(
    {},
    commonParams,
    {
      format: 'json',
      order: 'listen',
      songstatus: '1',
    },
    { singermid, num: 1 }
  )

  const musicPromise = new Promise((resolve, reject) => {
    request(
      {
        url: 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg',
        qs: musicParams,
      },
      (error, response, body) => {
        if (error) {
          reject(error)
          return
        }
        try {
          const data = JSON.parse(body)
          resolve({ name: 'music', total: data.data ? data.data.total : 0 })
        } catch (parseError) {
          resolve({ name: 'music', total: 0 })
        }
      }
    )
  })

  let data = {
    singerAlbum: {
      method: 'get_singer_album',
      param: {
        singermid,
        order: 'time',
        begin: 0,
        num: 1,
        exstatus: 1,
      },
      module: 'music.web_singer_info_svr',
    },
  }
  let albumParams = Object.assign({}, commonParams, {
    data: JSON.stringify(data),
  })

  const albumPromise = new Promise((resolve, reject) => {
    request(
      {
        url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
        qs: albumParams,
      },
      (error, response, body) => {
        if (error) {
          reject(new Error(error))
          return
        }
        try {
          const data = JSON.parse(body)
          const total = data.singerAlbum && data.singerAlbum.data ? data.singerAlbum.data.total : 0
          resolve({ name: 'album', total })
        } catch (parseError) {
          resolve({ name: 'album', total: 0 })
        }
      }
    )
  })

  let mvParams = Object.assign(
    {},
    commonParams,
    {
      order: 'listen',
      cid: 205360581,
    },
    { singermid, num: 1 }
  )

  const mvPromise = new Promise((resolve, reject) => {
    request(
      {
        url: 'https://c.y.qq.com/mv/fcgi-bin/fcg_singer_mv.fcg',
        qs: mvParams,
      },
      function(error, response, body) {
        if (error) {
          reject(new Error(error))
          return
        }
        try {
          const data = JSON.parse(body)
          resolve({ name: 'singerMv', total: data.data ? data.data.total : 0 })
        } catch (parseError) {
          resolve({ name: 'singerMv', total: 0 })
        }
      }
    )
  })

  try {
    var result = await Promise.all([musicPromise, albumPromise, mvPromise])
    res.json(result)
  } catch (error) {
    console.error('getTotalInfo error:', error)
    res.status(500).json({ error: 'Request failed', message: error.message })
  }
}
