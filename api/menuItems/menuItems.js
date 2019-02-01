const menuItemsRouter = require('express').Router({ mergeParams: true });
const menuItemRouter = require('./menuItem');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  db.get(
    `SELECT *
    FROM MenuItem
    WHERE id = $menuItemId`,
    {
      $menuItemId: menuItemId
    },
    (err, menuItem) => {
      if (err) {
        return next(err);
      }
      if (!menuItem) {
        return res.sendStatus(404);
      }
      req.menuItem = menuItem;
      next();
    }
  );
});

menuItemsRouter.use('/:menuItemId', menuItemRouter);

menuItemsRouter.get('/', (req, res, next) => {
  db.all(
    `SELECT *
    FROM MenuItem
    WHERE menu_id = $menuId`,
    {
      $menuId: req.params.menuId
    },
    (err, menuItems) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ menuItems: menuItems });
    }
  );
});

menuItemsRouter.post('/', (req, res, next) => {
  const newMenuItem = {
    ...req.body.menuItem
  };
  if (
    !newMenuItem.name
    || !newMenuItem.inventory
    || !newMenuItem.price
  ) {
    return res.sendStatus(400);
  }
  db.run(
    `INSERT INTO MenuItem (
      name,
      description,
      inventory,
      price,
      menu_id
    ) VALUES (
      $name,
      $description,
      $inventory,
      $price,
      $menuId
    )`,
    {
      $name: newMenuItem.name,
      $description: newMenuItem.description,
      $inventory: newMenuItem.inventory,
      $price: newMenuItem.price,
      $menuId: req.params.menuId
    },
    function(err) {
      if (err) {
        return next(err);
      }
      db.get(
        `SELECT *
        FROM MenuItem
        WHERE id = $menuItemId`,
        {
          $menuItemId: this.lastID
        },
        (err, menuItem) => {
          if (err) {
            return next(err);
          }
          res.status(201).json({ menuItem: menuItem });
        }
      );
    }
  );
});

module.exports = menuItemsRouter;