const db = require('./config').db;
const httpStatus = require('http-status');

const addstock = (req, res, next) => {
  const name = req.query.name;
  const amount = Number(req.query.amount) || 1;

  const nameValidation = name && typeof name === 'string' && name.length > 0 && name.length < 21;
  const amountValidation = amount > 0 && Number.isInteger(amount);
  if (!nameValidation || !amountValidation) {
    return next({ status: httpStatus.BAD_REQUEST });
  }

  const query = "insert into stock (name, amount) values ($1, $2) on conflict on constraint stock_pkey do update set amount=stock.amount+$2;";
  db.query(query, [name, amount])
  .then(() => {
    res.sendStatus(200);
  })
  .catch((e) => {
    next(e);
  });
};

const findByName = (name) => {
  const query = "select name,amount from stock where name=$1 and amount > 0;";
  return db.query(query, [name]);
}

const findAll = () => {
  const query = "select name,amount from stock where amount > 0 order by name;";
  return db.query(query);
}

const checkstock = (req, res, next) => {
  const name = req.query.name;
  const p = name ? findByName(name) : findAll();
  p.then((data) => {
    if (name && data.length === 0) {
      data = [{ name, amount: 0 }];
    }
    const format = data.map((r) => `${r.name}: ${r.amount}`).join('\n');
    res.send(format);
  })
  .catch((e) => {
    next(e);
  });
};

const sell = (req, res, next) => {
  const name = req.query.name;
  const amount = Number(req.query.amount) || 1;
  const price = Number(req.query.price) || 0;

  const nameValidation = !!name;
  const amountValidation = amount > 0 && Number.isInteger(amount);
  const priceValidation = price >= 0 && Number.isInteger(price);
  if (!nameValidation || !amountValidation || !priceValidation) {
    return next({ status: httpStatus.BAD_REQUEST });
  }

  db.tx((t) => {
    const q1 = "update stock set amount=amount-$2 where name=$1;";
    const q2 = "insert into selling_log values ($1, $2, $3, $4);"
    const t1 = t.query(q1, [name, amount]);
    const t2 = t.query(q2, [name, amount, amount * price, new Date()]);

    return t.batch([t1, t2]);
  })
  .then((d) => {
    res.sendStatus(200);
  })
  .catch((e) => {
    next(e);
  });
};

const checksales = (req, res, next) => {
  db.query('select sum(price) from selling_log;')
  .then((d) => {
    console.log(d);
    res.send(`sales: ${d[0].sum || 0}`);
  })
  .catch((e) => {
    next(e);
  });
}

const deleteall = (req, res, next) => {
  db.tx((t) => {
    const t1 = t.query('delete from selling_log');
    const t2 = t.query('delete from stock;');

    return t.batch([t1, t2]);
  })
  .then((d) => {
    res.sendStatus(200);
  })
  .catch((e) => {
    next(e);
  });

};


const funcs = {
  addstock,
  checkstock,
  sell,
  checksales,
  deleteall,
};

module.exports = (req, res, next) => {
  const f = req.query.function;
  if (!funcs[f]) {
    return next({ status: httpStatus.BAD_REQUEST });
  }

  funcs[f](req, res, next);
}
