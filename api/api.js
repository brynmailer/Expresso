const apiRouter = require('express').Router();
const employeesRouter = require('./employees/employees');
const menusRouter = require('./menus/menus');

apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menus', menusRouter);

module.exports = apiRouter;