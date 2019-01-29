const employeesRouter = require('express').Router();
const employeeRouter = require('./employee');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  db.get(
    `SELECT *
    FROM Employee
    WHERE id = $employeeId`,
    {
      $employeeId: employeeId
    },
    (err, employee) => {
      if (err) {
        return next(err);
      }
      if (!employee) {
        return res.sendStatus(404);
      }
      req.employee = employee;
      next();
    }
  );
});

employeesRouter.use('/', (req, res, next) => {
  if (req.body.employee) {
    const newEmployee = {
      ...req.body.employee,
      isCurrentEmployee: req.body.employee.isCurrentEmployee === 0 ? 0 : 1
    };
    if (
      !newEmployee.name
      || !newEmployee.position
      || !newEmployee.wage
    ) {
      return res.sendStatus(400);
    }
    req.newEmployee = newEmployee;
    next();
  }
  next();
});

employeesRouter.use('/:employeeId', employeeRouter);

employeesRouter.get('/', (req, res, next) => {
  db.all(
    `SELECT *
    FROM Employee
    WHERE is_current_employee = 1`,
    (err, employees) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ employees: employees });
    }
  );
});

employeesRouter.post('/', (req, res, next) => {
  db.run(
    `INSERT INTO Employee (
      name,
      position,
      wage,
      is_current_employee
    ) VALUES (
      $name,
      $position,
      $wage,
      $isCurrentEmployee
    )`,
    {
      $name: req.newEmployee.name,
      $position: req.newEmployee.position,
      $wage: req.newEmployee.wage,
      $isCurrentEmployee: req.newEmployee.isCurrentEmployee
    },
    (err) => {
      if (err) {
        return next(err);
      }
      db.get(
        `SELECT *
        FROM Employee
        WHERE name = $name`,
        {
          $name: newEmployee.name
        },
        (err, employee) => {
          if (err) {
            return next(err);
          }
          res.status(201).json({ employee: employee });
        }
      );
    }
  );
});

module.exports = employeesRouter;