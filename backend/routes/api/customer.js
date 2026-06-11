const router = require('express').Router();

const controllers = require('../../controllers/customer.controller');
const auth = require('../auth');

router.get('/', auth.required, controllers.onGetAll);
router.get('/:id', auth.required, controllers.onGetById);
router.get('/telephone/:telephone', auth.required, controllers.onGetOne);
router.post('/', auth.required, controllers.onInsert);
router.put('/:id', auth.required, controllers.onUpdate);
router.delete('/:id', auth.required, controllers.onDelete);

module.exports = router;