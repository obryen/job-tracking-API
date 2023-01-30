const { Op } = require("sequelize");
const { Contract } = require("../model");
const { ContractStatus } = require("../enums/contract-status.enum");

async function fetchUserContractById(id, userId) {
  return Contract.findOne({
    where: {
      id,
      [Op.or]: [
        {
          ClientId: userId,
        },
        {
          ContractorId: userId,
        },
      ],
    },
  });
}

async function fetchUserContractsNotTerminated(userId) {
  return Contract.findAll({
    where: {
      [Op.or]: [
        {
          ClientId: userId,
        },
        {
          ContractorId: userId,
        },
      ],
      status: { [Op.ne]: ContractStatus.TERMINATED },
    },
  });
}

module.exports = {
  fetchUserContractsNotTerminated,
  fetchUserContractById,
};
