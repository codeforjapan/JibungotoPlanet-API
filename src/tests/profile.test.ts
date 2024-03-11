import request from 'supertest'
// local mock の設定。テスト対象をimportする前に設定
process.env.TABLE_REGION = 'ap-northeast-1' // eslint-disable-line no-undef
process.env.ENV = 'dev' // eslint-disable-line no-undef
import app from '../../lib/lambda/calculate-app' // テスト対象をインポート

describe('Test profile operation', () => {
  const env = process.env
  const endpoint = env.REST_ENDPOINT
  console.log('endpoint = ' + endpoint)

  test('create profile without estimation and answers', async () => {
    const resPost = await request(endpoint || app)
      .post('/calculates')
      .send({})
      .set('x-apigateway-event', 'null') // エラーを出さないおまじない
      .set('x-apigateway-context', 'null') // エラーを出さないおまじない

    const profile = resPost.body.data

    expect(resPost.status).toBe(200)
    expect(profile.baselines).toBeFalsy()
    expect(profile.estimations).toBeFalsy()
  })

  test('create profile without answers', async () => {
    const resPost = await request(endpoint || app)
      .post('/calculates')
      .send({
        estimate: true,
      })
      .set('x-apigateway-event', 'null') // エラーを出さないおまじない
      .set('x-apigateway-context', 'null') // エラーを出さないおまじない

    const profile = resPost.body.data

    expect(resPost.status).toBe(200)
    expect(profile.baselines.length).toBe(0)
    expect(profile.estimations.length).toBe(0)
  })

  test('create profile with estimation', async () => {
    const resPost = await request(endpoint || app)
      .post('/calculates')
      .send({
        estimate: true,
        mobilityAnswer: {},
        housingAnswer: {},
        foodAnswer: {},
        otherAnswer: {}
      })
      .set('x-apigateway-event', 'null') // エラーを出さないおまじない
      .set('x-apigateway-context', 'null') // エラーを出さないおまじない

    const profile = resPost.body.data

    expect(resPost.status).toBe(200)
    expect(profile.baselines.length > 0).toBeTruthy()
    expect(profile.estimations.length > 0).toBeTruthy()
  })

  test('create profile without estimation', async () => {
    const resPost = await request(endpoint || app)
      .post('/calculates')
      .send({
        mobilityAnswer: {},
        housingAnswer: {},
        foodAnswer: {},
        otherAnswer: {}
      })
      .set('x-apigateway-event', 'null') // エラーを出さないおまじない
      .set('x-apigateway-context', 'null') // エラーを出さないおまじない

    const profile = resPost.body.data

    expect(resPost.status).toBe(200)
    expect(profile.baselines).toBeFalsy()
    expect(profile.estimations).toBeFalsy()
  })

  test('create profile without estimation, then get profile', async () => {
    // estimateしないpostを投げる
    const resPost = await request(endpoint || app)
      .post('/calculates')
      .send({
        mobilityAnswer: {},
        housingAnswer: {},
        foodAnswer: {},
        otherAnswer: {}
      })
      .set('x-apigateway-event', 'null') // エラーを出さないおまじない
      .set('x-apigateway-context', 'null') // エラーを出さないおまじない

    const profile = resPost.body.data

    expect(resPost.status).toBe(200)
    expect(profile.baselines).toBeFalsy()
    expect(profile.estimations).toBeFalsy()

    // idでprofileを取得する（遅延初期化でfootprint推定値が計算される）
    const resGet = await request(endpoint || app)
      .get('/calculates/' + profile.id)
      .set('x-apigateway-event', 'null') // エラーを出さないおまじない
      .set('x-apigateway-context', 'null') // エラーを出さないおまじない

    const newProfile = resGet.body

    expect(resGet.status).toBe(200)
    expect(newProfile.baselines.length > 0).toBeTruthy()
    expect(newProfile.estimations.length > 0).toBeTruthy()
  })

  test('create profile without estimation, then post profile', async () => {
    // estimateしないpostを投げる
    const resPost = await request(endpoint || app)
      .post('/calculates')
      .send({})
      .set('x-apigateway-event', 'null') // エラーを出さないおまじない
      .set('x-apigateway-context', 'null') // エラーを出さないおまじない

    const profile = resPost.body.data

    expect(resPost.status).toBe(200)
    expect(profile.baselines).toBeFalsy()
    expect(profile.estimations).toBeFalsy()

    const resPut = await request(endpoint || app)
      .put('/calculates/' + profile.id)
      .send({
        estimate: true,
        mobilityAnswer: {},
        housingAnswer: {},
        foodAnswer: {},
        otherAnswer: {}
      })
      .set('x-apigateway-event', 'null') // エラーを出さないおまじない
      .set('x-apigateway-context', 'null') // エラーを出さないおまじない

    const newProfile = resPut.body.data
    expect(resPut.status).toBe(200)
    expect(newProfile.baselines.length > 0).toBeTruthy()
    expect(newProfile.estimations.length > 0).toBeTruthy()
  })

  test('create profile with unsupported answers', async () => {
    const resPost = await request(endpoint || app)
      .post('/calculates')
      .send({
        estimate: true,
        mobilityAnswer: {
          carIntensityFactorFirstKey: 'horse'
        },
        housingAnswer: {
          housingSizeKey: '10-room'
        }
      })
      .set('x-apigateway-event', 'null') // エラーを出さないおまじない
      .set('x-apigateway-context', 'null') // エラーを出さないおまじない

    expect(resPost.status).toBe(400)
  })

  test('create profile with a long wrong key', async () => {
    const resPost = await request(endpoint || app)
      .post('/calculates')
      .send({
        estimate: true,
        housingAnswer: {
          housingSizeKey: 'unknown-answer'
        }
      })
      .set('x-apigateway-event', 'null') // エラーを出さないおまじない
      .set('x-apigateway-context', 'null') // エラーを出さないおまじない

    expect(resPost.status).toBe(400)
  })

  test('create profile with residentCount = 0', async () => {
    const resPost = await request(endpoint || app)
      .post('/calculates')
      .send({
        estimate: true,
        housingAnswer: {
          residentCount: 0
        }
      })
      .set('x-apigateway-event', 'null') // エラーを出さないおまじない
      .set('x-apigateway-context', 'null') // エラーを出さないおまじない

    expect(resPost.status).toBe(400)
  })

  test('create profile with otherCarAnnualTravelingTime = -100', async () => {
    const resPost = await request(endpoint || app)
      .post('/calculates')
      .send({
        estimate: true,
        mobilityAnswer: {
          hasTravelingTime: true,
          otherCarAnnualTravelingTime: -100
        }
      })
      .set('x-apigateway-event', 'null') // エラーを出さないおまじない
      .set('x-apigateway-context', 'null') // エラーを出さないおまじない

    expect(resPost.status).toBe(400)
  })

  test('create profile with keroseneMonthlyConsumption = 100', async () => {
    const resPost = await request(endpoint || app)
      .post('/calculates')
      .send({
        estimate: true,
        mobilityAnswer: {
          useKerosene: true,
          keroseneMonthlyConsumption: 100
        }
      })
      .set('x-apigateway-event', 'null') // エラーを出さないおまじない
      .set('x-apigateway-context', 'null') // エラーを出さないおまじない

    expect(resPost.status).toBe(200)
  })

  test('create profile with trainWeeklyTravelingTime = 0 and busWeeklyTravelingTime = 100', async () => {
    const resPost = await request(endpoint || app)
      .post('/calculates')
      .send({
        estimate: true,
        mobilityAnswer: {
          hasTravelingTime: true,
          trainWeeklyTravelingTime: 0,
          busWeeklyTravelingTime: 100
        }
      })
      .set('x-apigateway-event', 'null') // エラーを出さないおまじない
      .set('x-apigateway-context', 'null') // エラーを出さないおまじない

    expect(resPost.status).toBe(200)
  })
})
