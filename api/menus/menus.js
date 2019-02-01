const menusRouter = require('express').Router({ mergeParams: true });
const menuRouter = require('./menu');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.param('menuId', (req, res, next, menuId) => {
  db.get(
    `SELECT *
    FROM Menu
    WHERE id = $menuId`,
    {
      $menuId: menuId
    },
    (err, menu) => {
      if (err) {
        return next(err);
      }
      if (!menu) {
        return res.sendStatus(404);
      }
      req.menu = menu;
      next();
    }
  );
});

menusRouter.use('/:menuId', menuRouter);

menusRouter.get('/', (req, res, next) => {
  db.all(
    `SELECT *
    FROM Menu`,
    (err, menus) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ menus: menus });
    }
  );
});

menusRouter.post('/', (req, res, next) => {
  const newMenu = {
    ...req.body.menu
  };
  if (
    !newMenu.title
  ) {
    return res.sendStatus(400);
  }
  db.run(
    `INSERT INTO Menu (
      title
    ) VALUES (
      $title
    )`,
    {
      $title: newMenu.title
    },
    function(err) {
      if (err) {
        return next(err);
      }
      db.get(
        `SELECT *
        FROM Menu
        WHERE id = $menuId`,
        {
          $menuId: this.lastID
        },
        (err, menu) => {
          if (err) {
            return next(err);
          }
          res.status(201).json({ menu: menu });
        }
      );
    }
  );
});

module.exports = menusRouter;