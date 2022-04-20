// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const KJUR = require('jsrsasign')

export default function handler(req, res) {
  const iat = Math.round((new Date().getTime() - 30000) / 1000)
  const exp = iat + 60 * 60 * 2

  const oHeader = { alg: 'HS256', typ: 'JWT' }

  const oPayload = {
    sdkKey: "rqrOGbaDQpRKXO8s4DQMEhBQi0gOOXTO1cv1",
    mn: req.body.meetingNumber,
    role: req.body.role,
    iat: iat,
    exp: exp,
    appKey: "rqrOGbaDQpRKXO8s4DQMEhBQi0gOOXTO1cv1",
    tokenExp: iat + 60 * 60 * 2
  }

  const sHeader = JSON.stringify(oHeader)
  const sPayload = JSON.stringify(oPayload)
  const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, "UvhcTDy3y0RbQv6ZobxiiiIvEyHiLyzmbYPX")

  res.json({
    signature: signature
  })
}
