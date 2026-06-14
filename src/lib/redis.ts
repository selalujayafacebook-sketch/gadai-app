import Redis from 'ioredis'
const g = globalThis as unknown as { redis: Redis }
export const redis = g.redis || new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: 3, lazyConnect: true })
if (process.env.NODE_ENV !== 'production') g.redis = redis

export const setOtp    = (hp: string, hash: string) => redis.set(`otp:${hp}`, hash, 'EX', 300)
export const getOtp    = (hp: string) => redis.get(`otp:${hp}`)
export const delOtp    = (hp: string) => redis.del(`otp:${hp}`)
export const incrOtpReq = async (hp: string) => { const k=`otp_req:${hp}`; const c=await redis.incr(k); if(c===1) await redis.expire(k,3600); return c }
export const incrLoginFail = async (id: string) => { const k=`login_fail:${id}`; const c=await redis.incr(k); if(c===1) await redis.expire(k,300); return c }
export const resetLoginFail = (id: string) => redis.del(`login_fail:${id}`)
export const getLoginFail   = async (id: string) => parseInt(await redis.get(`login_fail:${id}`) || '0')
export const blacklistToken = (token: string, sec: number) => redis.set(`bl:${token}`, '1', 'EX', sec)
export const isBlacklisted  = async (token: string) => (await redis.get(`bl:${token}`)) === '1'
export const setSession = (uid: string, data: object) => redis.set(`sess:${uid}`, JSON.stringify(data), 'EX', 3600)
export const getSession = async (uid: string) => { const v=await redis.get(`sess:${uid}`); return v?JSON.parse(v):null }

// Compatibility aliases (some modules import different names)
export const incrementLoginFail = incrLoginFail
export const incrementOtpReq = incrOtpReq
export const incrementOtpRequest = incrOtpReq
export const deleteOtp = delOtp
export const isTokenBlacklisted = isBlacklisted
