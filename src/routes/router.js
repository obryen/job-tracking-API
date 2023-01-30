const { fetchUserContractsNotTerminated, fetchUserContractById } = require('../services/contracts');
const { getProfile } = require('../middleware/getProfile');

router.get(
    '/contracts/:id',
    getProfile,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const userId = req.profile.id;
  
      const contract = await fetchUserContractById(id, userId);
  
      if (!contract) {
        return res.status(404).end();
      }
  
      res.json(contract);
    })
  );

  router.get(
    '/contracts',
    getProfile,
    asyncHandler(async (req, res) => {
      const userId = req.profile.id;
      const contracts = await fetchUserContractsNotTerminated(userId);
  
      res.json(contracts);
    })
  );
  