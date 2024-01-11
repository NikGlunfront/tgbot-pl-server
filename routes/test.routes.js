const Router = require('express')
const router = new Router()
const testController = require('../controllers/test.controller')

router.get('/', testController.getTestItem)


module.exports = router