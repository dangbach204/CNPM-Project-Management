import express from 'express';

var router = express.Router();

router.get('/', (req, res, next) => {
    res.json('Router root');
})

router.get('/test', (req, res, next) => {
    res.json('Router test');
})

router.get('/error', (req, res, next) => {
    res.json('Router error');
})

export default router;