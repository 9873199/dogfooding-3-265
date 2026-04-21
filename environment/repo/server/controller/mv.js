const request = require('request')
const commonParams = require('../config/commonParams.js')
const { createMv } = require('../config')

function getMvPlayUrl(vids) {
  const data = {
    getMvUrl: {
      module: 'gosrf.Stream.MvUrlProxy',
      method: 'GetMvUrls',
      param: { vids, request_typet: 10001 },
    },
  }

  var options = {
    url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
    qs: {
      ...commonParams,
      data: JSON.stringify(data),
    },
  }
  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (error) {
        reject(new Error(error))
        return
      }
      let data
      try {
        data = JSON.parse(body)
        body = data.getMvUrl ? data.getMvUrl.data : {}
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        body = {}
      }
      for (let key in body) {
        if (body[key] && body[key].mp4) {
          body[key] = body[key].mp4.slice(1).map(item => item.freeflow_url[0])
        }
      }
      resolve(body)
    })
  })
}

exports.getHotMvList = function(req, res) {
  let query = req.query

  let data = {
    comm: { ct: 24 },
    mv_list: {
      module: 'MvService.MvInfoProServer',
      method: 'GetAllocMvInfo',
      param: {
        start: parseInt(query.offset),
        size: parseInt(query.limit),
        version_id: parseInt(query.version),
        area_id: parseInt(query.area),
        order: 1,
      },
    },
  }

  let params = Object.assign({}, commonParams, {
    data: JSON.stringify(data),
  })
  var options = {
    method: 'GET',
    url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
    qs: params,
    headers: {
      referer: 'https://y.qq.com',
    },
  }

  request(options, async function(error, response, body) {
    if (error) {
      console.error('Request error:', error)
      res.status(500).json({ error: 'Request failed', message: error.message })
      return
    }

    let list = []
    try {
      const data = JSON.parse(body)
      if (data.mv_list && data.mv_list.data && data.mv_list.data.list) {
        list = data.mv_list.data.list
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      res.status(500).json({ error: 'Invalid JSON response', message: parseError.message })
      return
    }
    
    if (!list || list.length === 0) {
      res.json([])
      return
    }

    try {
      const vids = await getMvPlayUrl(list.map(item => item.vid))
      const result = list.map(item => {
        item.playurls = vids[item.vid]
        return createMv(item)
      })
      
      res.json(result)
    } catch (processError) {
      console.error('Process error:', processError)
      res.status(500).json({ error: 'Process failed', message: processError.message })
    }
  })
}

exports.getMvTagList = function(req, res) {
  const query = req.query
   
  let data = {
    comm: { ct: 24 },
    mv_tag: {
      module: 'MvService.MvInfoProServer',
      method: 'GetAllocTag',
      param: {},
    },
  }
  let params = Object.assign({}, commonParams, {
    data: JSON.stringify(data),
  })

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
      console.error('getMvTagList error:', error)
      res.status(500).json({ error: 'Request failed', message: error.message })
      return
    }
    res.send(body)
  })
}

exports.getMvData = function(req, res) {
  let query = req.query

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
      console.error('getMvData error:', error)
      res.status(500).json({ error: 'Request failed', message: error.message })
      return
    }
    res.send(body)
  })
}

exports.getMvPlayUrl = getMvPlayUrl
