const apiRouter = require('express').Router();
const employeesRouter = require('./employees/employees');

apiRouter.use('/employees', employeesRouter);

module.exports = apiRouter;