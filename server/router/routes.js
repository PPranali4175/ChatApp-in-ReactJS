const { getMessage } = require('../controllers/ChatController');

const router = require('express').Router()


const {loginUser, resetPassword, generateToken, createUser,getUser, getAllUser} = require('../controllers/Auth')
const auth = require("../middlewares/Auth");

router.post('/login',loginUser);
router.post('/generatetoken/:id',auth,generateToken);
router.post('/resetpassword/:token',resetPassword);


router.get('/',(req,res)=>{
    res.send('Welcome')
})

// CRUD
router.post('/user',createUser);
router.get('/user/:id',auth,getUser);
router.get('/users',getAllUser);
module.exports = router;