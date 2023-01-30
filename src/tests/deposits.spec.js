const request = require('supertest');
const app = require('../app');
const { ErrorMsgs } = require('../enums/error-messages.enum');
const { Profile, Contract, Job } = require('../model');

describe('Deposits', () => {
  describe('/balances/deposit/:userId', () => {
    beforeEach(async () => {
      await Profile.sync({ force: true });
      await Contract.sync({ force: true });
      await Job.sync({ force: true });

      await Promise.all([
        Profile.create({
          id: 1,
          firstName: 'Harry',
          lastName: 'Potter',
          profession: 'Wizard',
          balance: 1150,
          type: 'client',
        }),
        Profile.create({
          id: 5,
          firstName: 'John',
          lastName: 'Lenon',
          profession: 'Musician',
          balance: 150,
          type: 'contractor',
        }),
        Contract.create({
          id: 1,
          terms: 'bla bla bla',
          status: 'in_progress',
          ClientId: 1,
          ContractorId: 5,
        }),
        Job.create({
          id: 1,
          description: 'work 1',
          price: 200,
          ContractId: 1,
          paid: true,
          paymentDate: '2020-08-15T19:11:26.737Z',
        }),
        Job.create({
          id: 2,
          description: 'work 2',
          price: 110,
          ContractId: 1,
          paid: false,
        }),
        Job.create({
          id: 3,
          description: 'work 3',
          price: 300,
          ContractId: 1,
          paid: false,
        }),
      ]);
    });

    it('should increase clients balance', async () => {
      const { statusCode, body } = await request(app)
        .post('/balances/deposit/1')
        .send({ amount: 100 });

      expect(statusCode).toEqual(200);
      expect(body).toEqual(
        expect.objectContaining({
          id: 1,
          balance: 1250
        })
      );
    });

    it('should return 400 if deposit exceeds limit  of 25% of unpaid jobs total', async () => {
      const { statusCode, body } = await request(app)
        .post('/balances/deposit/1')
        .send({ amount: 200 });

      expect(statusCode).toEqual(400);
      expect(body.error).toEqual(ErrorMsgs.DEPOSIT_EXCEEDS_LIMIT);
    });

    it('should return 404 if client does not exist', async () => {
      const { statusCode } = await request(app)
        .post('/balances/deposit/98')
        .send({ amount: 100 });

      expect(statusCode).toEqual(404);
    });
  });
});
