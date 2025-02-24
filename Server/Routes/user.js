const express = require('express');
const router = express.Router();
const  userController= require('../controllers/userController')
const jwt = require('jsonwebtoken')

router.get('/:id', userController.getDevById) 
router.get('/', userController.getUsers)
router.get('/dev/streak/:id', userController.getStreak)

router.put('/:id',userController.updateUser )
router.put('/dev/:id',userController.updateDeveloper)
router.post('/', userController.createUser)
router.delete('/:id', userController.deleteUser)
router.get('/current', userController.getCurrentUser)

router.put('/addPoints/:id', userController.addPoints)
module.exports = router;