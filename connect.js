let mysql = require('mysql');
const bodyparser = require('body-parser');
const cors = require("cors");
const multer = require("multer");
// const cookieParser = require("cookie-parser");
const session = require('express-session');
const path = require('path');
const nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const express = require("express");
const app = express();
var PORT = process.env.port || 3001;

const appVersion = '1.0';
const sysEmail = 'support@ratchu.com';
const appKey = 'RSAI-MVAA-RRAN-JANI';
var crypto = require('crypto');

app.use(cors());

let con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ratchuco_multi_bz'
});

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(express.json());
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyparser.urlencoded({ extended: true }));
//app.use(express.static(path.join(__dirname, 'static')));
//app.use(express.static('./public'));
app.use('/public/images', express.static(path.join(__dirname, '/public/images')));


let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images/')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
  }
});

let maxSize = 2 * 1000 * 1000;
let upload = multer({
  storage: storage,
  limits: {
    fileSize: maxSize
  }
});

let uploadHandler = upload.single('img_pic');

app.post('/img_upload', (req, res) => {
  uploadHandler(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code == 'LIMIT_FILE_SIZE') {
        res.status(400).json({ message: "Max_File" });
      }
      return
    }
    if (!req.file) {
      res.status(400).json({ message: "No_File" });
    } else {
      res.status(200).json({ message: req.file.filename })
    }
  });
});
let transpoter = nodemailer.createTransport({
  host: 'mail.ratchu.com',
  port: 465,
  auth: {
    user: "donotreply@ratchu.com",
    pass: "Ratchu3Ram"
  },
  tls: {
    rejectUnauthorized: false
  }
})


con.connect(function (error) {
  if (error) throw error;
  console.log("connected");

  // console.log(fields);
  // con.query('create database ratchuco_restaurant',function(err,result){
  // con.query('create table stdd(id int, name varchar(20))',function(err,result){
  //  con.query("insert into stdd(id, name) values (1,'ram')",function(err,result){
  // var sql="insert into stdd(id, name) values (8,'Arul')";
  // con.query(sql,function(err,result){
  /*  var sql="insert into stdd(id, name) values ?";
    var values=[
      [2,'Mohammed'],
      [3,'Great'],
      [4,'Maya'],
      [5,'Ratchu']
    ]
    con.query(sql,[values],function(err,result){
    var sql="select * from  stdd";
    con.query(sql,function(err,result){
      if (err) throw err;
      console.log(result);
     });

     var sql="select * from  mv_res_categories where id=3";
    con.query(sql,function(err,result,fields){
      if (err) throw err;
      console.log(result);
      console.log(fields);
     });  */
});

/*  con.connect (e => {
if (e) {
    throw (e);
}
}); */

app.get("/dashboard_widget", (req, res) => {
  //const q = "select 'Customer' as title, 'customers' as p_link, 'See all customer' as link, COUNT(id) amount,  ROUND((sum(case when month(CURDATE()) - 1 = month(`creation_date`) then is_active else 0 end) -sum(case when month(CURDATE()) = month(`creation_date`) then is_active else 0 end)) / (sum(case when month(CURDATE()) - 1 = month(`creation_date`) then is_active else 0 end) + sum(case when month(CURDATE()) = month(`creation_date`) then is_active else 0 end)) *100,0)  as diff from mv_ms_customers  WHERE is_active=1 AND erp_id ="+req.query.erp_id +" UNION ALL select 'Sales' as title,'sales' as p_link, 'View all sales' as link, COUNT(id) amount, ROUND((sum(case when month(CURDATE()) - 1 = month(`sales_date`) then is_active else 0 end) -sum(case when month(CURDATE()) = month(`sales_date`) then is_active else 0 end)) / (sum(case when month(CURDATE()) - 1 = month(`sales_date`) then is_active else 0 end) + sum(case when month(CURDATE()) = month(`sales_date`) then is_active else 0 end)) *100,0)  as diff from mv_ms_sales  WHERE is_active=1 AND erp_id ="+req.query.erp_id +" UNION ALL select 'Earnigs' as title, 'sales' as p_link, 'View net earning' as link, SUM(total_amount) amount, ROUND((sum(case when month(CURDATE()) - 1 = month(`sales_date`) then total_amount else 0 end) -sum(case when month(CURDATE()) = month(`sales_date`) then total_amount else 0 end)) / (sum(case when month(CURDATE()) - 1 = month(`sales_date`) then total_amount else 0 end) + sum(case when month(CURDATE()) = month(`sales_date`) then total_amount else 0 end)) *100,0) as diff from mv_ms_sales  WHERE is_active=1 AND erp_id ="+req.query.erp_id +" UNION ALL select 'Balance' as title, 'accounts' as p_link, 'View net Balance' as link, SUM(avl_amount) amount,ROUND((sum(case when month(CURDATE()) - 1 = month(`creation_date`) then opening_amount else 0 end) / sum(case when month(CURDATE()) = month(`creation_date`) then opening_amount else 0 end)) + (sum(case when month(CURDATE()) - 1 = month(`creation_date`) then opening_amount else 0 end) / sum(case when month(CURDATE()) = month(`creation_date`) then avl_amount else 0 end)) * 100,0) as diff from mv_ms_accounts WHERE is_active=1 AND erp_id ="+req.query.erp_id;
  const q1 = "select 'Customer' as title, 'customers' as p_link, 'See all customer' as link, COUNT(id) amount, ROUND((COUNT(case when month(CURDATE()) = month(`creation_date`) then is_active+1 end) - COUNT(case when month(CURDATE()) -1 = month(`creation_date`) then is_active+1 end)) /  (COUNT(case when month(CURDATE()) -1 = month(`creation_date`) then is_active+1 end)) * 100,1) as diff from mv_ms_customers  WHERE is_active=1 AND erp_id =" + req.query.erp_id;
  const q2 = " UNION ALL select 'Sales' as title, 'sales' as p_link, 'See all sales' as link, COUNT(id) amount, ROUND((COUNT(case when month(CURDATE()) = month(`creation_date`) then is_active+1 end) - COUNT(case when month(CURDATE()) -1 = month(`creation_date`) then is_active+1 end)) /  (COUNT(case when month(CURDATE()) -1 = month(`creation_date`) then is_active+1 end)) * 100,1) as diff from mv_ms_sales WHERE is_active=1 AND erp_id =" + req.query.erp_id;
  const q3 = " UNION ALL select 'Earnigs' as title, 'sales' as p_link, 'See all earnigs' as link, SUM(total_amount) amount, ROUND((SUM(case when month(CURDATE()) -1 = month(`creation_date`) then total_amount else 0 end) - SUM(case when month(CURDATE()) = month(`creation_date`) then total_amount else 0 end)) /  (SUM(case when month(CURDATE()) -1 = month(`creation_date`) then total_amount else 0 end) + SUM(case when month(CURDATE()) = month(`creation_date`) then total_amount else 0 end)) * 100,1) as diff from mv_ms_sales WHERE is_active=1 AND erp_id =" + req.query.erp_id;
  const q4 = " UNION ALL select 'Balance' as title, 'accounts' as p_link, 'View net Balance' as link, SUM(avl_amount) as amount, ROUND((SUM(opening_amount) - SUM(avl_amount)) / (SUM(opening_amount) + SUM(avl_amount)) * 100,1) as diff from mv_ms_accounts WHERE is_active=1 AND erp_id =" + req.query.erp_id;
  const q = q1 + q2 + q3 + q4;
  con.query(q, (err, result) => {
    if (err) console.log(err);
    if (result) {
      const q5 = "SELECT 'Total Sales made today' as text_sales, round((sum(case when day(CURDATE()) = day(sales_date) then total_amount else 0 end)/12600) * 100,1) AS sales_percent, sum(case when day(CURDATE()) = day(sales_date) then total_amount else 0 end) as sale_today, round(concat(12600/1000,'K'),1) AS target,concat((sum(case when week(CURDATE()) = week(sales_date) then total_amount else 0 end)/1000),'K') as last_week, concat((sum(case when month(CURDATE()) - 1 = month(sales_date) then total_amount else 0 end)/1000),'K') as last_month FROM mv_ms_sales WHERE is_active=1 AND erp_id =" + req.query.erp_id;
      con.query(q5, (err, featured) => {
        if (err) console.log(err);
        if (featured) {
          const q6 = "SELECT date_format(sales_date,'%b') AS name,SUM(total_amount) AS total FROM mv_ms_sales WHERE is_active=1 AND  erp_id=" + req.query.erp_id + " GROUP BY YEAR(sales_date), MONTH(sales_date)";
          con.query(q6, (err, chaart) => {
            if (err) console.log(err);
            if (chaart) {
              const q7 = "SELECT id,txn_type_id,txn_type,txn_amount,creation_date,name,actions FROM `mv_ms_transactions_v` WHERE is_active=1 AND erp_id =" + req.query.erp_id + " order by id desc limit 6";
              con.query(q7, (err, txn) => {
                if (err) console.log(err);
                if (txn) {
                  return res.json([result, featured, chaart, txn]);
                }
              });
            }
          });
        }
      });
    }
  });
});

app.get("/stats_widget", (req, res) => {
  //const q = "select 'Customer' as title, 'customers' as p_link, 'See all customer' as link, COUNT(id) amount,  ROUND((sum(case when month(CURDATE()) - 1 = month(`creation_date`) then is_active else 0 end) -sum(case when month(CURDATE()) = month(`creation_date`) then is_active else 0 end)) / (sum(case when month(CURDATE()) - 1 = month(`creation_date`) then is_active else 0 end) + sum(case when month(CURDATE()) = month(`creation_date`) then is_active else 0 end)) *100,0)  as diff from mv_ms_customers  WHERE is_active=1 AND erp_id ="+req.query.erp_id +" UNION ALL select 'Sales' as title,'sales' as p_link, 'View all sales' as link, COUNT(id) amount, ROUND((sum(case when month(CURDATE()) - 1 = month(`sales_date`) then is_active else 0 end) -sum(case when month(CURDATE()) = month(`sales_date`) then is_active else 0 end)) / (sum(case when month(CURDATE()) - 1 = month(`sales_date`) then is_active else 0 end) + sum(case when month(CURDATE()) = month(`sales_date`) then is_active else 0 end)) *100,0)  as diff from mv_ms_sales  WHERE is_active=1 AND erp_id ="+req.query.erp_id +" UNION ALL select 'Earnigs' as title, 'sales' as p_link, 'View net earning' as link, SUM(total_amount) amount, ROUND((sum(case when month(CURDATE()) - 1 = month(`sales_date`) then total_amount else 0 end) -sum(case when month(CURDATE()) = month(`sales_date`) then total_amount else 0 end)) / (sum(case when month(CURDATE()) - 1 = month(`sales_date`) then total_amount else 0 end) + sum(case when month(CURDATE()) = month(`sales_date`) then total_amount else 0 end)) *100,0) as diff from mv_ms_sales  WHERE is_active=1 AND erp_id ="+req.query.erp_id +" UNION ALL select 'Balance' as title, 'accounts' as p_link, 'View net Balance' as link, SUM(avl_amount) amount,ROUND((sum(case when month(CURDATE()) - 1 = month(`creation_date`) then opening_amount else 0 end) / sum(case when month(CURDATE()) = month(`creation_date`) then opening_amount else 0 end)) + (sum(case when month(CURDATE()) - 1 = month(`creation_date`) then opening_amount else 0 end) / sum(case when month(CURDATE()) = month(`creation_date`) then avl_amount else 0 end)) * 100,0) as diff from mv_ms_accounts WHERE is_active=1 AND erp_id ="+req.query.erp_id;
  const q1 = "select 'Customer' as title, 'customers' as p_link, 'See all customer' as link, COUNT(id) amount, ROUND((COUNT(case when month(CURDATE()) = month(`creation_date`) then is_active+1 end) - COUNT(case when month(CURDATE()) -1 = month(`creation_date`) then is_active+1 end)) /  (COUNT(case when month(CURDATE()) -1 = month(`creation_date`) then is_active+1 end)) * 100,1) as diff from mv_ms_customers  WHERE is_active=1 AND erp_id =" + req.query.erp_id;
  const q2 = " UNION ALL select 'Sales' as title, 'sales' as p_link, 'See all sales' as link, COUNT(id) amount, ROUND((COUNT(case when month(CURDATE()) = month(`creation_date`) then is_active+1 end) - COUNT(case when month(CURDATE()) -1 = month(`creation_date`) then is_active+1 end)) /  (COUNT(case when month(CURDATE()) -1 = month(`creation_date`) then is_active+1 end)) * 100,1) as diff from mv_ms_sales WHERE is_active=1 AND erp_id =" + req.query.erp_id;
  const q3 = " UNION ALL select 'Earnigs' as title, 'sales' as p_link, 'See all earnigs' as link, SUM(total_amount) amount, ROUND((SUM(case when month(CURDATE()) -1 = month(`creation_date`) then total_amount else 0 end) - SUM(case when month(CURDATE()) = month(`creation_date`) then total_amount else 0 end)) /  (SUM(case when month(CURDATE()) -1 = month(`creation_date`) then total_amount else 0 end) + SUM(case when month(CURDATE()) = month(`creation_date`) then total_amount else 0 end)) * 100,1) as diff from mv_ms_sales WHERE is_active=1 AND erp_id =" + req.query.erp_id;
  const q4 = " UNION ALL select 'Balance' as title, 'accounts' as p_link, 'View net Balance' as link, SUM(avl_amount) as amount, ROUND((SUM(opening_amount) - SUM(avl_amount)) / (SUM(opening_amount) + SUM(avl_amount)) * 100,1) as diff from mv_ms_accounts WHERE is_active=1 AND erp_id =" + req.query.erp_id;
  const q5 = " UNION ALL select 'Supplier' as title, 'suppliers' as p_link, 'See all customer' as link, COUNT(id) amount, ROUND((COUNT(case when month(CURDATE()) = month(`creation_date`) then is_active+1 end) - COUNT(case when month(CURDATE()) -1 = month(`creation_date`) then is_active+1 end)) /  (COUNT(case when month(CURDATE()) -1 = month(`creation_date`) then is_active+1 end)) * 100,1) as diff from mv_ms_suppliers WHERE is_active=1 AND erp_id =" + req.query.erp_id;
  const q6 = " UNION ALL select 'Purchases' as title, 'purchases' as p_link, 'See all purchases' as link, COUNT(id) amount, ROUND((COUNT(case when month(CURDATE()) = month(`creation_date`) then is_active+1 end) - COUNT(case when month(CURDATE()) -1 = month(`creation_date`) then is_active+1 end)) /  (COUNT(case when month(CURDATE()) -1 = month(`creation_date`) then is_active+1 end)) * 100,1) as diff from mv_ms_purchases WHERE is_active=1 AND erp_id =" + req.query.erp_id;
  const q7 = " UNION ALL select 'Stocks' as title, 'stocks' as p_link, 'See all stocks' as link, COUNT(id) amount, ROUND((COUNT(case when month(CURDATE()) = month(`creation_date`) then is_active+1 end) - COUNT(case when month(CURDATE()) -1 = month(`creation_date`) then is_active+1 end)) /  (COUNT(case when month(CURDATE()) -1 = month(`creation_date`) then is_active+1 end)) * 100,1) as diff from mv_ms_stocks WHERE is_active=1 AND erp_id =" + req.query.erp_id;
  const q8 = " UNION ALL select 'Expanses' as title, 'expenses' as p_link, 'See all expanses' as link, SUM(amount) amount, ROUND((SUM(case when month(CURDATE()) -1 = month(`creation_date`) then amount else 0 end) - SUM(case when month(CURDATE()) = month(`creation_date`) then amount else 0 end)) /  (SUM(case when month(CURDATE()) -1 = month(`creation_date`) then amount else 0 end) + SUM(case when month(CURDATE()) = month(`creation_date`) then amount else 0 end)) * 100,1) as diff from mv_ms_other_incms_expns WHERE is_active=1 AND action_type='OTHR_EXPNS' AND erp_id =" + req.query.erp_id;
  const q = q1 + q2 + q3 + q4 + q5 + q6 + q7 + q8;
  con.query(q, (err, result) => {
    if (err) console.log(err);
    if (result) {
      const q9 = "select date_format(sales_date,'%b') as name, SUM(total_amount) AS amount from mv_ms_sales where is_active=1 AND erp_id =" + req.query.erp_id + " AND sales_date > now() - INTERVAL 6 MONTH group by date_format(sales_date,'%b')";
      con.query(q9, (err, sales_chart) => {
        if (err) console.log(err);
        if (sales_chart) {
          const q10 = "select date_format(purchase_date,'%b') as name, SUM(total_amount) AS amount from mv_ms_purchases where is_active=1 AND erp_id =" + req.query.erp_id + " AND purchase_date > now() - INTERVAL 6 MONTH group by date_format(purchase_date,'%b')";
          con.query(q10, (err, purchase_chart) => {
            if (err) console.log(err);
            if (purchase_chart) {
              const q11 = "select date_format(creation_date,'%b') as name, SUM(case when actions = 'CREDIT' then txn_amount else 0 end) amount from mv_ms_transactions where is_active=1 AND erp_id=" + req.query.erp_id + " AND creation_date > now() - INTERVAL 6 MONTH group by date_format(creation_date,'%b')";
              con.query(q11, (err, inc_chart) => {
                if (err) console.log(err);
                if (inc_chart) {
                  const q12 = "select date_format(creation_date,'%b') as name, SUM(case when actions = 'DEBIT' then txn_amount else 0 end) amount from mv_ms_transactions where is_active=1 AND erp_id=" + req.query.erp_id + " AND creation_date > now() - INTERVAL 6 MONTH group by date_format(creation_date,'%b')";
                  con.query(q12, (err, exp_chart) => {
                    if (err) console.log(err);
                    if (exp_chart) {
                      return res.json([result, sales_chart, purchase_chart, inc_chart, exp_chart]);
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

app.get("/dashboard_featured", (req, res) => {
  const q = "SELECT 'Total Sales made today' as text_sales, round((sum(case when day(CURDATE()) = day(sales_date) then total_amount else 0 end)/12600) * 100,1) AS sales_percent, sum(case when day(CURDATE()) = day(sales_date) then total_amount else 0 end) as sale_today, round(concat(12600/1000,'K'),1) AS target,concat((sum(case when week(CURDATE()) = week(sales_date) then total_amount else 0 end)/1000),'K') as last_week, concat((sum(case when month(CURDATE()) - 1 = month(sales_date) then total_amount else 0 end)/1000),'K') as last_month FROM mv_ms_sales WHERE is_active=1 AND erp_id =" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) console.log(err);
    // console.log(result);
    return res.json(result);
  });
});

app.get("/dashboard_chart", (req, res) => {
  const q = "SELECT date_format(sales_date,'%b') AS name,SUM(total_amount) AS total FROM mv_ms_sales WHERE is_active=1 AND erp_id=" + req.query.erp_id + " GROUP BY YEAR(sales_date), MONTH(sales_date)";
  con.query(q, (err, result) => {
    if (err) console.log(err);
    // console.log(result);
    return res.json(result);
  });
});

app.get("/dashboard_txn", (req, res) => {
  const q = "SELECT id,txn_type_id,txn_type,txn_amount,creation_date,name,actions FROM `mv_ms_transactions_v` WHERE is_active=1 AND erp_id =" + req.query.erp_id + " order by id desc limit 6";
  con.query(q, (err, result) => {
    if (err) console.log(err);
    // console.log(result);
    return res.json(result);
  });
});

/*
app.get("/stats_barchart", (req, res) => {
  var q1 = "select date_format(sales_date,'%b') as name, SUM(total_amount) AS amt from mv_ms_sales where erp_id =" + req.query.erp_id + "AND sales_date > now() - INTERVAL 3 MONTH group by date_format(sales_date,'%b')";
  var q2 = "select date_format(sales_date,'%b') as name, SUM(total_amount) AS amt from mv_ms_sales where erp_id =" + req.query.erp_id + "AND sales_date > now() - INTERVAL 3 MONTH group by date_format(sales_date,'%b')";
  var q3 = "select date_format(sales_date,'%b') as name, SUM(total_amount) AS amt from mv_ms_sales where erp_id =" + req.query.erp_id + "AND sales_date > now() - INTERVAL 3 MONTH group by date_format(sales_date,'%b')";
  var q4 = "select date_format(sales_date,'%b') as name, SUM(total_amount) AS amt from mv_ms_sales where erp_id =" + req.query.erp_id + "AND sales_date > now() - INTERVAL 3 MONTH group by date_format(sales_date,'%b')";
  con.query(q1, (err, sales) => {
    if (err) return res.json(err);
    con.query(q2, (err, purchase) => {
      if (err) return res.json(err);
      con.query(q3, (err, expanse) => {
        if (err) return res.json(err);
        con.query(q4, (err, income) => {
          if (err) return res.json(err);
        return res.json([sales, purchase, expanse,income]);
        });
      });
    });
  });
}); */

app.get("/sales_barchart", (req, res) => {
  var q1 = "select date_format(sales_date,'%b') as name, SUM(total_amount) AS amount from mv_ms_sales where is_active=1 AND erp_id =" + req.query.erp_id + " AND sales_date > now() - INTERVAL 6 MONTH group by date_format(sales_date,'%b')";
  con.query(q1, (err, result) => {
    if (err) return res.json(err);
    // console.log(result);
    return res.json(result);
  });
});

app.get("/purchase_barchart", (req, res) => {
  var q1 = "select date_format(purchase_date,'%b') as name, SUM(total_amount) AS amount from mv_ms_purchases where is_active=1 AND erp_id =" + req.query.erp_id + " AND purchase_date > now() - INTERVAL 6 MONTH group by date_format(purchase_date,'%b')";
  con.query(q1, (err, result) => {
    if (err) return res.json(err);
    // console.log(result);
    return res.json(result);
  });
});

app.get("/income_barchart", (req, res) => {
  var q1 = "select date_format(creation_date,'%b') as name, SUM(case when actions = 'CREDIT' then txn_amount else 0 end) amount from mv_ms_transactions where is_active=1 AND erp_id=" + req.query.erp_id + " AND creation_date > now() - INTERVAL 6 MONTH group by date_format(creation_date,'%b')";
  con.query(q1, (err, result) => {
    if (err) return res.json(err);
    // console.log(result);
    return res.json(result);
  });
});

app.get("/expanses_barchart", (req, res) => {
  var q1 = "select date_format(creation_date,'%b') as name, SUM(case when actions = 'DEBIT' then txn_amount else 0 end) amount from mv_ms_transactions where is_active=1 AND erp_id=" + req.query.erp_id + " AND creation_date > now() - INTERVAL 6 MONTH group by date_format(creation_date,'%b')";
  con.query(q1, (err, result) => {
    if (err) return res.json(err);
    // console.log(result);
    return res.json(result);
  });
});

app.get("/users", (req, res) => {
  const q = "select id,user_name, case user_type when '1' then 'Admin' when '2' then 'User' when '3' then 'SalesPerson' end as user_type,contact_number,pic,pc_address, case is_logged_in when '1' then 'Live' when '0' then 'Inactive' end as status from mv_ms_login_users where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/single_users", (req, res) => {
  const q1 = "select id,user_name, case user_type when '1' then 'Admin' when '2' then 'User' when '3' then 'SalesPerson' end as user_type,contact_number, case is_logged_in when '1' then 'Live' when '0' then 'Inactive' end as status from mv_ms_login_users where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  const q2 = "SELECT date_format(sales_date,'%b') AS name,SUM(total_amount) AS total FROM mv_ms_sales_v WHERE erp_id=" + req.query.erp_id + " and created_by=" + req.query.id + " GROUP BY YEAR(sales_date), MONTH(sales_date)";
  const q3 = "SELECT id,txn_type_id,txn_type,txn_amount,creation_date,name,actions FROM `mv_ms_transactions_v` WHERE erp_id =" + req.query.erp_id + " and created_by=" + req.query.id + " order by creation_date desc  limit 6";
  con.query(q1, (err, customer) => {
    if (err) return res.json(err);
    con.query(q2, (err, cust_chart) => {
      if (err) return res.json(err);
      con.query(q3, (err, sales) => {
        if (err) return res.json(err);
        return res.json([customer, cust_chart, sales]);
      });
    });
  });
});

app.post("/single_users", (req, res) => {
  var q = "UPDATE mv_ms_login_users SET is_active=0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (result) {
      res.send({ message: "The user Datas are removed" });
    }
  });
});

app.get("/manage_users", (req, res) => {
  const q1 = "select id,user_name, user_type,contact_number,pic,user_access,case is_logged_in when '1' then 'Live' when '0' then 'Inactive' end as status from mv_ms_login_users where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  const q2 = "select id as value,user_name as label from mv_ms_login_users where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q1, (err, user) => {
    if (err) return res.json(err);
    con.query(q2, (err, users) => {
      if (err) return res.json(err);
      return res.json([user, users]);
    });
  });
});

app.get("/user_lov", (req, res) => {
  const q = "select id as value,user_name as label from mv_ms_login_users where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    //console.log(result);
    return res.json(result);
  });
});


app.post("/users", (req, res) => {
  //console.log(req.body.contact_number);
  if (req.body.password === req.body.confirm_password) {
    // let pwd = '';
    bcrypt.hash(req.body.password, saltRounds, (error, hash) => {
      if (error) {
        console.log(error);
      }
      if (hash) {
        //pwd = hash;
        var q = "insert into mv_ms_login_users(user_name,password,contact_number,user_type,user_access,is_logged_in,is_active,pic,erp_id,created_by,last_login_id) values (?)";
        var values = [
          req.body.user_name,
          hash,
          req.body.contact_number,
          req.body.user_type,
          req.body.user_access,
          0,
          1,
          req.body.pic,
          req.body.erp_id,
          req.body.user_id,
          req.body.erp_id
        ]
        con.query(q, [values], (err, result) => {
          if (err) {
            var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
            var err_values = [
              err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
            ]
            con.query(q1, [err_values], (er, results) => {
              if (er) res.send({ message: er.code }); //console.log(er.code);
              /// console.log(results.code);
              res.send({ message: err.code });
            });
          } // console.log(err.code);
          //return res.json({message:"New Customer Added"});
          if (result) res.send({ message: "New Customer Added" });
        });
      }
    });
  } else {
    res.send({ message: "Password Not Match" });
  }

});

app.post("/manage_users", (req, res) => {
  if (req.body.new_password) {
    con.query(
      "select id,user_name,password,user_type,erp_id from mv_ms_login_users where is_active=1 and id = '" + req.body.id + "' and erp_id='" + req.body.erp_id + "'",
      (err, usr) => {
        if (err) {
          var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1
          ]
          con.query(eq1, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (usr.length > 0) {
          bcrypt.compare(req.body.old_password, usr[0].password, function (err, resul) {
            if (resul) {

              bcrypt.hash(req.body.new_password, saltRounds, (error, hash) => {
                if (error) {
                  console.log(error);
                }
                con.query(
                  "UPDATE mv_ms_login_users SET user_name='" + req.body.user_name + "',password='" + hash + "',contact_number='" + req.body.contact_number + "',user_type='" + req.body.user_type + "',user_access='" + req.body.user_access + "',pic='" + req.body.pic + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.id + "' and erp_id='" + req.body.erp_id + "' and is_active=1",
                  (err, result) => {
                    if (err) {
                      res.send({ err: err });
                    }
                    if (result) {
                      // res.send(result);
                      res.send({ message: "User and Password Updated" });
                      // console.log(result);
                    } else {
                      res.send({ message: "Invalid password data" })
                    }
                  }
                );
              });
            } else {
              res.send({ message: "Wrong old password" });
            }
          });
        }
      });

  } else {
    var q = "UPDATE mv_ms_login_users SET user_name='" + req.body.user_name + "',contact_number='" + req.body.contact_number + "',user_type='" + req.body.user_type + "',user_access='" + req.body.user_access + "',pic='" + req.body.pic + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
    con.query(q, (err, result) => {
      if (err) {
        var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
        var err_values = [
          err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
        ]
        con.query(q1, [err_values], (er, results) => {
          if (er) res.send({ message: er.code }); //console.log(er.code);
          /// console.log(results.code);
          res.send({ message: err.code });
        });
      }
      if (result) {
        res.send({ message: "User Updated" });
      }
    });
  }
});

app.get("/account_lov", (req, res) => {
  const q = "select id as value,name as label from mv_ms_accounts where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/categories", (req, res) => {
  //console.log(req.query.erp_id);
  const q = "select id,name,details,pic from mv_ms_categories where is_active=1 and erp_id=" + req.query.erp_id + " order by id desc";
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/single_categories", (req, res) => {
  //console.log(req.query.erp_id);
  const q1 = "select id,name,details,pic from mv_ms_categories where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  const q2 = "SELECT date_format(creation_date,'%b') AS name, SUM(total) AS total FROM mv_ms_purchase_details_v WHERE erp_id=" + req.query.erp_id + " and category_id=" + req.query.id + " GROUP BY YEAR(creation_date), MONTH(creation_date)";
  const q3 = "select id, name,details,brand_name from mv_ms_products where is_active=1 and erp_id=" + req.query.erp_id + " and category_id=" + req.query.id + " order by creation_date desc limit 6";
  con.query(q1, (err, supplier) => {
    if (err) return res.json(err);
    con.query(q2, (err, cust_chart) => {
      if (err) return res.json(err);
      con.query(q3, (err, purchase) => {
        if (err) return res.json(err);
        return res.json([supplier, cust_chart, purchase]);
      });
    });
  });
});

app.post("/single_categories", (req, res) => {
  var q = "UPDATE mv_ms_categories SET is_active=0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (result) {
      var q1 = "UPDATE mv_ms_products SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE category_id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
      con.query(q1, (err, result) => {
        if (err) {
          var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
          ]
          con.query(eq3, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (result) {
          res.send({ message: "The Category Datas are removed" });
        }
      });
    }
  });
});

app.get("/manage_categories", (req, res) => {
  const q1 = "select id,name,details,pic from mv_ms_categories where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  con.query(q1, (err, result) => {
    if (err) return res.json(err);
    return res.json([result, '']);
  });
});

app.get("/category_lov", (req, res) => {
  const q = "select id as value,name as label from mv_ms_categories where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.post("/category", (req, res) => {
  var q = "insert into mv_ms_categories(name,details,is_active,pic,erp_id,created_by,last_login_id) values (?)";
  var values = [
    req.body.name,
    req.body.details,
    1,
    req.body.pic,
    req.body.erp_id,
    req.body.user_id,
    req.body.erp_id
  ]
  con.query(q, [values], (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    //return res.json({message:"New Customer Added"});
    if (result) res.send({ message: "New Category Added" });
  });
});

app.post("/manage_categories", (req, res) => {
  var q = "UPDATE mv_ms_categories SET name='" + req.body.name + "',details='" + req.body.details + "',pic='" + req.body.pic + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    }
    if (result) {
      res.send({ message: "Category Updated" });
    }
  });
});

app.get("/logs", (req, res) => {
  const q = "select id,err_code,err_number,message,err_state,err_index,err_details from mv_ms_logs where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/customers", (req, res) => {
  const q = "select id,name,contact_number,address,cash_in_advance from mv_ms_customers where is_active=1 and id!=1 and erp_id=" + req.query.erp_id + " order by id desc";
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/single_customers", (req, res) => {
  const q1 = "select id,name,contact_number,address,cash_in_advance,pic from mv_ms_customers where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  const q2 = "SELECT date_format(sales_date,'%b') AS name,SUM(total_amount) AS total FROM mv_ms_sales_v WHERE erp_id=" + req.query.erp_id + " and customer_id=" + req.query.id + " GROUP BY YEAR(sales_date), MONTH(sales_date)";
  const q3 = "select id, invoice_number,sales_date,total_amount,payment,balance_payment,payment_status from mv_ms_sales_v where is_active=1 and erp_id=" + req.query.erp_id + " and customer_id=" + req.query.id + " order by sales_date desc limit 6";
  con.query(q1, (err, customer) => {
    if (err) return res.json(err);
    con.query(q2, (err, cust_chart) => {
      if (err) return res.json(err);
      con.query(q3, (err, sales) => {
        if (err) return res.json(err);
        return res.json([customer, cust_chart, sales]);
      });
    });
  });
});

app.post("/single_customers", (req, res) => {
  var q = "UPDATE mv_ms_customers SET is_active=0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (result) {
      var q1 = "UPDATE mv_ms_sales SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE customer_id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
      con.query(q1, (err, result) => {
        if (err) {
          var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
          ]
          con.query(eq3, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (result) {
          res.send({ message: "The Customer Datas are removed" });
        }
      });
    }
  });
});

app.get("/manage_customers", (req, res) => {
  const q1 = "select id,name,contact_number,address,ref_code,pic from mv_ms_customers where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  con.query(q1, (err, customer) => {
    if (err) return res.json(err);
    return res.json([customer, ""]);
  });
});

app.get("/single_customers_charts", (req, res) => {
  const q = "SELECT date_format(sales_date,'%b') AS name,SUM(total_amount) AS total FROM mv_ms_sales_v WHERE erp_id=" + req.query.erp_id + " and customer_id=" + req.query.id + " GROUP BY YEAR(sales_date), MONTH(sales_date)";
  con.query(q, (err, cust_chart) => {
    if (err) return res.json(err);
    return res.json(cust_chart);
  });
});

app.get("/single_customers_tableList", (req, res) => {
  const q = "select id, invoice_number,sales_date,total_amount,payment,balance_payment,payment_status from mv_ms_sales_v where is_active=1 and erp_id=" + req.query.erp_id + " and customer_id=" + req.query.id + " order by sales_date desc";
  con.query(q, (err, sales) => {
    if (err) return res.json(err);
    console.log(sales);
    return res.json(sales);
  });
});

app.post("/notifications", (req, res) => {
  //console.log(req.body.contact_number);
  var q = "insert into mv_ms_notifications(msg_from,msg_to,	msg_subject,message,msg_status,is_active,pic,erp_id,created_by,last_login_id) values (?)";
  var values = [
    req.body.user_id,
    req.body.msg_to,
    req.body.msg_subject,
    req.body.message,
    "UnRead",
    1,
    req.body.pic,
    req.body.erp_id,
    req.body.user_id,
    req.body.erp_id
  ]
  con.query(q, [values], (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    //return res.json({message:"New Customer Added"});
    if (result) res.send({ message: "New Customer Added" });
  });
});

app.post("/customer", (req, res) => {
  var q = "insert into mv_ms_customers(name,contact_number,address,ref_code,cash_in_advance,is_active,pic,erp_id,created_by,last_login_id) values (?)";
  var values = [
    req.body.name,
    req.body.contact_number,
    req.body.address,
    req.body.ref_code,
    0,
    1,
    req.body.pic,
    req.body.erp_id,
    req.body.user_id,
    req.body.erp_id
  ]
  con.query(q, [values], (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    }
    if (result) {
        res.send({ message: "New customer added" });    
    }
  });
});

app.post("/manage_customers", (req, res) => {
  var q = "UPDATE mv_ms_customers SET name='" + req.body.name + "',contact_number='" + req.body.contact_number + "',address='" + req.body.address + "',ref_code='" + req.body.ref_code + "',pic='" + req.body.pic + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    }
    if (result) {
      res.send({ message: "Customer Details Updated" });
    }
  });
});

app.get("/products", (req, res) => {
  const q = "select id,name,pic,details,brand_name from mv_ms_products  where is_active=1 and erp_id=" + req.query.erp_id + " order by id desc";
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/single_products", (req, res) => {
  const q1 = "select id,name,pic,details,brand_name,category_name from mv_ms_products_v  where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  const q2 = "SELECT date_format(creation_date,'%b') AS name, SUM(total) AS total FROM mv_ms_sales_details_v WHERE erp_id=" + req.query.erp_id + " and product_id=" + req.query.id + " GROUP BY YEAR(creation_date), MONTH(creation_date)";
  const q3 = "select id, product_code,name,category_name,supplier_name,serial_id,expiry_date,density,quantity,mrp,gst,discount from mv_ms_stocks_v where is_active=1 and erp_id=" + req.query.erp_id + " and product_id=" + req.query.id + " order by creation_date desc  limit 6";
  con.query(q1, (err, supplier) => {
    if (err) return res.json(err);
    con.query(q2, (err, cust_chart) => {
      if (err) return res.json(err);
      con.query(q3, (err, purchase) => {
        if (err) return res.json(err);
        return res.json([supplier, cust_chart, purchase]);
      });
    });
  });
});

app.post("/single_products", (req, res) => {
  var q = "UPDATE mv_ms_products SET is_active=0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (result) {
      var q1 = "UPDATE mv_ms_purchase_details SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE product_id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
      con.query(q1, (err, result) => {
        if (err) {
          var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
          ]
          con.query(eq3, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (result) {
          var q2 = "UPDATE mv_ms_stocks SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE product_id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
          con.query(q2, (err, result) => {
            if (err) {
              var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
              var err_values = [
                err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
              ]
              con.query(eq4, [err_values], (er, results) => {
                if (er) res.send({ message: er.code });
                res.send({ message: err.code });
              });
            }
            if (result) {
              var q3 = "UPDATE mv_ms_sales_details SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE product_id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
              con.query(q3, (err, result) => {
                if (err) {
                  var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                  var err_values = [
                    err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                  ]
                  con.query(eq4, [err_values], (er, results) => {
                    if (er) res.send({ message: er.code });
                    res.send({ message: err.code });
                  });
                }
                if (result) {
                  res.send({ message: "The Product Datas are removed" });
                }
              });
            }
          });
        }
      });
    }
  });
});

app.get("/manage_products", (req, res) => {
  const q1 = "select id,name,category_id,pic,details,brand_name from mv_ms_products  where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  const q2 = "select id as value,name as label from mv_ms_categories where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q1, (err, product) => {
    if (err) return res.json(err);
    con.query(q2, (err, categories) => {
      if (err) return res.json(err);
      return res.json([product, categories]);
    });
  });
});

app.post("/product", (req, res) => {
  var q = "insert into mv_ms_products(name,details,category_id,brand_name,is_active,pic,erp_id,created_by,last_login_id) values (?)";
  var values = [
    req.body.name,
    req.body.details,
    req.body.category_id,
    req.body.brand_name,
    1,
    req.body.pic,
    req.body.erp_id,
    req.body.user_id,
    req.body.erp_id
  ]
  con.query(q, [values], (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    //return res.json({message:"New Customer Added"});
    if (result) res.send({ message: "New Product Added" });
  });
});

app.post("/manage_products", (req, res) => {
  var q = "UPDATE mv_ms_products SET name='" + req.body.name + "',details='" + req.body.details + "',category_id='" + req.body.category_id + "',brand_name='" + req.body.brand_name + "',pic='" + req.body.pic + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    }
    if (result) {
      res.send({ message: "Product Updated" });
    }
  });
});

app.get("/accounts", (req, res) => {
  const q = "select id,name,pic,details,opening_amount,avl_amount,account_type from mv_ms_accounts where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/single_accounts", (req, res) => {
  const q1 = "select id,name,pic,details,opening_amount,avl_amount,account_type from mv_ms_accounts where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  const q2 = "select date_format(creation_date,'%b') as name, (SUM(case when actions = 'CREDIT' then txn_amount else 0 end) - SUM(case when actions = 'DEBIT' then txn_amount else 0 end)) total from mv_ms_transactions where erp_id=" + req.query.erp_id + " and txn_account_id=" + req.query.id + " AND creation_date > now() - INTERVAL 6 MONTH group by date_format(creation_date,'%b')";
  const q3 = "SELECT id,txn_type_id,txn_type,txn_amount,creation_date,name,actions FROM `mv_ms_transactions_v` WHERE erp_id =" + req.query.erp_id + " and txn_account_id=" + req.query.id + " order by creation_date desc  limit 6";
  con.query(q1, (err, supplier) => {
    if (err) return res.json(err);
    con.query(q2, (err, cust_chart) => {
      if (err) return res.json(err);
      con.query(q3, (err, purchase) => {
        if (err) return res.json(err);
        return res.json([supplier, cust_chart, purchase]);
      });
    });
  });
});

app.post("/single_accounts", (req, res) => {
  var q = "UPDATE mv_ms_accounts SET is_active=0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (result) {
      var q1 = "UPDATE mv_ms_other_incms_expns SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
      con.query(q1, (err, result) => {
        if (err) {
          var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
          ]
          con.query(eq3, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (result) {
          var q2 = "UPDATE mv_ms_other_incomes SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE txn_account_id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
          con.query(q2, (err, result) => {
            if (err) {
              var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
              var err_values = [
                err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
              ]
              con.query(eq4, [err_values], (er, results) => {
                if (er) res.send({ message: er.code });
                res.send({ message: err.code });
              });
            }
            if (result) {
              var q3 = "UPDATE mv_ms_sales SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE txn_account_id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
              con.query(q3, (err, result) => {
                if (err) {
                  var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                  var err_values = [
                    err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                  ]
                  con.query(eq4, [err_values], (er, results) => {
                    if (er) res.send({ message: er.code });
                    res.send({ message: err.code });
                  });
                }
                if (result) {
                  var q4 = "UPDATE mv_ms_purchases SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE txn_account_id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
                  con.query(q4, (err, result) => {
                    if (err) {
                      var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                      var err_values = [
                        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                      ]
                      con.query(eq4, [err_values], (er, results) => {
                        if (er) res.send({ message: er.code });
                        res.send({ message: err.code });
                      });
                    }
                    if (result) {
                      var q5 = "UPDATE mv_ms_transactions SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE txn_account_id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
                      con.query(q5, (err, result) => {
                        if (err) {
                          var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                          var err_values = [
                            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                          ]
                          con.query(eq4, [err_values], (er, results) => {
                            if (er) res.send({ message: er.code });
                            res.send({ message: err.code });
                          });
                        }
                        if (result) {
                          res.send({ message: "The Account Datas are removed" });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

app.get("/manage_accounts", (req, res) => {
  const q1 = "select id,name,pic,details,opening_amount,avl_amount,account_type from mv_ms_accounts where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  con.query(q1, (err, result) => {
    if (err) return res.json(err);
    return res.json([result, '']);
  });
});

app.post("/account", (req, res) => {
  var q = "insert into mv_ms_accounts(name,details,opening_amount,avl_amount,account_type,is_active,pic,erp_id,created_by,last_login_id) values (?)";
  var values = [
    req.body.name,
    req.body.details,
    req.body.opening_amount,
    req.body.opening_amount,
    req.body.account_type,
    1,
    req.body.pic,
    req.body.erp_id,
    req.body.user_id,
    req.body.erp_id
  ]
  con.query(q, [values], (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    }
    if (result) res.send({ message: "New Account Added" });
  });
});


app.post("/manage_accounts", (req, res) => {
  var q = "UPDATE mv_ms_accounts SET name='" + req.body.name + "',details='" + req.body.details + "',pic='" + req.body.pic + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    }
    if (result) {
      res.send({ message: "Account Updated" });
    }
  });
});

app.get("/other_incms_expns", (req, res) => {
  const q = "select id,remarks,name,act_type,amount,action_type,actions,pic from mv_ms_other_incms_expns_v where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/single_other_incms_expns", (req, res) => {
  const q1 = "select id,name,remarks,amount,action_type,pic from mv_ms_other_incms_expns_v where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  const q2 = "select date_format(creation_date,'%b') as name, SUM(case when actions = 'DEBIT' then txn_amount else 0 end) total from mv_ms_transactions where erp_id=" + req.query.erp_id + " AND txn_type='OTHR_INCMS_EXPNS' AND txn_type_id=" + req.query.id + " AND creation_date > now() - INTERVAL 6 MONTH group by date_format(creation_date,'%b')";
  const q3 = "SELECT id,txn_type_id,txn_type,txn_amount,creation_date,name,actions FROM mv_ms_transactions_v WHERE erp_id =" + req.query.erp_id + "  AND txn_type='OTHR_INCMS_EXPNS' AND txn_type_id=" + req.query.id + " order by creation_date desc  limit 6";
  con.query(q1, (err, supplier) => {
    if (err) return res.json(err);
    con.query(q2, (err, cust_chart) => {
      if (err) return res.json(err);
      con.query(q3, (err, purchase) => {
        if (err) return res.json(err);
        return res.json([supplier, cust_chart, purchase]);
      });
    });
  });
});

app.post("/single_expenses", (req, res) => {
  var q = "UPDATE mv_ms_other_incms_expns_v SET is_active=0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (result) {
      res.send({ message: "The Expanses Datas are removed" });
    }
  });
});

app.get("/manage_other_incms_expns", (req, res) => {
  const q1 = "select id,remarks,amount as old_amount,txn_account_id,txn_account_id as old_txn_account_id,amount,action_type as old_type,action_type,pic from mv_ms_other_incms_expns_v where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  const q2 = "select id as value,name as label from mv_ms_accounts where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q1, (err, expense) => {
    if (err) return res.json(err);
    con.query(q2, (err, accounts) => {
      if (err) return res.json(err);
      return res.json([expense, accounts]);
    });
  });
});

app.post("/draw_amount", (req, res) => {
  var q3 = "insert into mv_ms_transactions(actions,txn_type,txn_type_id,txn_amount,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
        var txn_values = [
          "DEBIT",
          req.body.txn_type,
          req.body.txn_type_id,
          req.body.amount,
          req.body.txn_account_id,
          1,
          req.body.erp_id,
          req.body.user_id,
          req.body.erp_id
        ]
        con.query(q3, [txn_values], (err, txn) => {
          if (err) {
            var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
            var err_values = [
              err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
            ]
            con.query(eq3, [err_values], (er, results) => {
              if (er) res.send({ message: er.code });
              res.send({ message: err.code });
            });
          }
          if (txn) {
            var q2 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount - '" + parseInt(req.body.amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
            con.query(q2, (err, account) => {
              if (err) {
                var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                var err_values = [
                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                ]
                con.query(eq4, [err_values], (er, results) => {
                  if (er) res.send({ message: er.code });
                  res.send({ message: err.code });
                });
              }
              if (account) {
                res.send({ message: "Amount Drawed" });
              }
            });
          }
        });
});

app.post("/add__amount", (req, res) => {
  var q1 = "insert into mv_ms_transactions(actions,txn_type,txn_type_id,txn_amount,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
        var txn_values = [
          "CREDIT",
          req.body.txn_type,
          req.body.txn_type_id,
          req.body.amount,
          req.body.txn_account_id,
          1,
          req.body.erp_id,
          req.body.user_id,
          req.body.erp_id
        ]
        con.query(q1, [txn_values], (err, txn) => {
          if (err) {
            var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
            var err_values = [
              err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
            ]
            con.query(eq3, [err_values], (er, results) => {
              if (er) res.send({ message: er.code });
              res.send({ message: err.code });
            });
          }
          if (txn) {
            var q2 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(req.body.amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
            con.query(q2, (err, account) => {
              if (err) {
                var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                var err_values = [
                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                ]
                con.query(eq4, [err_values], (er, results) => {
                  if (er) res.send({ message: er.code });
                  res.send({ message: err.code });
                });
              }
              if (account) {
                res.send({ message: "Amount added" });
              }
            });
          }
        });
});

app.post("/other_incms_expns", (req, res) => {
  var q = "insert into mv_ms_other_incms_expns(amount,remarks,action_type,is_active,pic,erp_id,created_by,last_login_id) values (?)";
  var values = [
    req.body.amount,
    req.body.remarks,
    req.body.action_type,
    1,
    req.body.pic,
    req.body.erp_id,
    req.body.user_id,
    req.body.erp_id
  ]
  con.query(q, [values], (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    }
    if (result) {
      var txn_type_id = result.insertId;
      if (req.body.action_type === 'OTHR_EXPNS') {
        var q3 = "insert into mv_ms_transactions(actions,txn_type,txn_type_id,txn_amount,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
        var txn_values = [
          "DEBIT",
          "OTHR_INCMS_EXPNS",
          txn_type_id,
          req.body.amount,
          req.body.txn_account_id,
          1,
          req.body.erp_id,
          req.body.user_id,
          req.body.erp_id
        ]
        con.query(q3, [txn_values], (err, txn) => {
          if (err) {
            var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
            var err_values = [
              err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
            ]
            con.query(eq3, [err_values], (er, results) => {
              if (er) res.send({ message: er.code });
              res.send({ message: err.code });
            });
          }
          if (txn) {
            var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount - '" + parseInt(req.body.amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
            con.query(q4, (err, account) => {
              if (err) {
                var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                var err_values = [
                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                ]
                con.query(eq4, [err_values], (er, results) => {
                  if (er) res.send({ message: er.code });
                  res.send({ message: err.code });
                });
              }
              if (account) {
                res.send({ message: "New Expenses added" });
              }
            });
          }
        });
      } else {
        var q3 = "insert into mv_ms_transactions(actions,txn_type,txn_type_id,txn_amount,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
        var txn_values = [
          "CREDIT",
          "OTHR_INCMS_EXPNS",
          txn_type_id,
          req.body.amount,
          req.body.txn_account_id,
          1,
          req.body.erp_id,
          req.body.user_id,
          req.body.erp_id
        ]
        con.query(q3, [txn_values], (err, txn) => {
          if (err) {
            var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
            var err_values = [
              err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
            ]
            con.query(eq3, [err_values], (er, results) => {
              if (er) res.send({ message: er.code });
              res.send({ message: err.code });
            });
          }
          if (txn) {
            var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(req.body.amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
            con.query(q4, (err, account) => {
              if (err) {
                var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                var err_values = [
                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                ]
                con.query(eq4, [err_values], (er, results) => {
                  if (er) res.send({ message: er.code });
                  res.send({ message: err.code });
                });
              }
              if (account) {
                res.send({ message: "New Incomes added" });
              }
            });
          }
        });
      }
    }
  });
});

app.post("/manage_other_incms_expns", (req, res) => {
  var q = "UPDATE mv_ms_other_incms_expns SET remarks='" + req.body.remarks + "',amount='" + req.body.amount + "',action_type='" + req.body.action_type + "',pic='" + req.body.pic + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    }
    if (result) {
      if (req.body.action_type === 'OTHR_EXPNS' && req.body.action_type === req.body.old_type) {
        var q3 = "UPDATE mv_ms_transactions SET txn_amount= '" + parseInt(req.body.amount) + "',actions='DEBIT',txn_type='OTHR_INCMS_EXPNS',txn_account_id='" + req.body.txn_account_id + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE txn_type_id = '" + req.body.id + "' and txn_type = 'OTHR_INCMS_EXPNS' and erp_id='" + req.body.erp_id + "' and is_active=1";
        con.query(q3, (err, txn) => {
          if (err) {
            var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
            var err_values = [
              err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
            ]
            con.query(eq3, [err_values], (er, results) => {
              if (er) res.send({ message: er.code });
              res.send({ message: err.code });
            });
          }
          if (txn) {
            if (req.body.amount > req.body.old_amount) {
              var current_amount = parseInt(req.body.amount) - parseInt(req.body.old_amount);
              var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount - '" + parseInt(current_amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
              con.query(q4, (err, account) => {
                if (err) {
                  var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                  var err_values = [
                    err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                  ]
                  con.query(eq4, [err_values], (er, results) => {
                    if (er) res.send({ message: er.code });
                    res.send({ message: err.code });
                  });
                }
                if (account) {
                  if (req.body.old_txn_account_id !== req.body.txn_account_id) {
                    var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(req.body.old_amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.old_txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
                    con.query(q4, (err, account) => {
                      if (err) {
                        var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                        var err_values = [
                          err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                        ]
                        con.query(eq4, [err_values], (er, results) => {
                          if (er) res.send({ message: er.code });
                          res.send({ message: err.code });
                        });
                      }
                      if (account) {
                        res.send({ message: "Expanses Updated" });
                      }
                    });
                  } else {
                    res.send({ message: "Expanses Updated" });
                  }
                }
              });
            } else if (req.body.amount < req.body.old_amount) {
              var current_amount = parseInt(req.body.old_amount) - parseInt(req.body.amount);
              var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(current_amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
              con.query(q4, (err, account) => {
                if (err) {
                  var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                  var err_values = [
                    err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                  ]
                  con.query(eq4, [err_values], (er, results) => {
                    if (er) res.send({ message: er.code });
                    res.send({ message: err.code });
                  });
                }
                if (account) {
                  if (req.body.old_txn_account_id !== req.body.txn_account_id) {
                    var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(req.body.old_amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.old_txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
                    con.query(q4, (err, account) => {
                      if (err) {
                        var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                        var err_values = [
                          err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                        ]
                        con.query(eq4, [err_values], (er, results) => {
                          if (er) res.send({ message: er.code });
                          res.send({ message: err.code });
                        });
                      }
                      if (account) {
                        res.send({ message: "Expanses Updated" });
                      }
                    });
                  } else {
                    res.send({ message: "Expanses Updated" });
                  }
                }
              });
            } else {
              if (req.body.old_txn_account_id !== req.body.txn_account_id) {
                var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount - '" + parseInt(req.body.amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
                con.query(q4, (err, account) => {
                  if (err) {
                    var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                    var err_values = [
                      err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                    ]
                    con.query(eq4, [err_values], (er, results) => {
                      if (er) res.send({ message: er.code });
                      res.send({ message: err.code });
                    });
                  }
                  if (account) {
                    var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(req.body.old_amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.old_txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
                    con.query(q4, (err, account) => {
                      if (err) {
                        var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                        var err_values = [
                          err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                        ]
                        con.query(eq4, [err_values], (er, results) => {
                          if (er) res.send({ message: er.code });
                          res.send({ message: err.code });
                        });
                      }
                      if (account) {
                        res.send({ message: "Expanses Updated" });
                      }
                    });
                  }
                });
              } else {
                res.send({ message: "Expanses Updated" });
              }
            }
          }
        });
      } else if (req.body.action_type === 'OTHR_INCMS' && req.body.action_type === req.body.old_type) {
        var q3 = "UPDATE mv_ms_transactions SET txn_amount= '" + parseInt(req.body.amount) + "',actions='CREDIT',txn_type='OTHR_INCMS_EXPNS',txn_account_id='" + req.body.txn_account_id + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE txn_type_id = '" + req.body.id + "' and txn_type = 'OTHR_INCMS_EXPNS' and erp_id='" + req.body.erp_id + "' and is_active=1";
        con.query(q3, (err, txn) => {
          if (err) {
            var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
            var err_values = [
              err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
            ]
            con.query(eq3, [err_values], (er, results) => {
              if (er) res.send({ message: er.code });
              res.send({ message: err.code });
            });
          }
          if (txn) {
            if (req.body.amount > req.body.old_amount) {
              var current_amount = parseInt(req.body.amount) - parseInt(req.body.old_amount);
              var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(current_amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
              con.query(q4, (err, account) => {
                if (err) {
                  var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                  var err_values = [
                    err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                  ]
                  con.query(eq4, [err_values], (er, results) => {
                    if (er) res.send({ message: er.code });
                    res.send({ message: err.code });
                  });
                }
                if (account) {
                  if (req.body.old_txn_account_id !== req.body.txn_account_id) {
                    var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount - '" + parseInt(req.body.old_amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.old_txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
                    con.query(q4, (err, account) => {
                      if (err) {
                        var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                        var err_values = [
                          err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                        ]
                        con.query(eq4, [err_values], (er, results) => {
                          if (er) res.send({ message: er.code });
                          res.send({ message: err.code });
                        });
                      }
                      if (account) {
                        res.send({ message: "Income Updated" });
                      }
                    });
                  } else {
                    res.send({ message: "Income Updated" });
                  }
                }
              });
            } else if (req.body.amount < req.body.old_amount) {
              var current_amount = parseInt(req.body.old_amount) - parseInt(req.body.amount);
              var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount - '" + parseInt(current_amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
              con.query(q4, (err, account) => {
                if (err) {
                  var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                  var err_values = [
                    err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                  ]
                  con.query(eq4, [err_values], (er, results) => {
                    if (er) res.send({ message: er.code });
                    res.send({ message: err.code });
                  });
                }
                if (account) {
                  if (req.body.old_txn_account_id !== req.body.txn_account_id) {
                    var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount - '" + parseInt(req.body.old_amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.old_txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
                    con.query(q4, (err, account) => {
                      if (err) {
                        var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                        var err_values = [
                          err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                        ]
                        con.query(eq4, [err_values], (er, results) => {
                          if (er) res.send({ message: er.code });
                          res.send({ message: err.code });
                        });
                      }
                      if (account) {
                        res.send({ message: "Income Updated" });
                      }
                    });
                  } else {
                    res.send({ message: "Income Updated" });
                  }
                }
              });
            } else {
              if (req.body.old_txn_account_id !== req.body.txn_account_id) {
                var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(req.body.amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
                con.query(q4, (err, account) => {
                  if (err) {
                    var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                    var err_values = [
                      err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                    ]
                    con.query(eq4, [err_values], (er, results) => {
                      if (er) res.send({ message: er.code });
                      res.send({ message: err.code });
                    });
                  }
                  if (account) {
                    var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount - '" + parseInt(req.body.old_amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.old_txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
                    con.query(q4, (err, account) => {
                      if (err) {
                        var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                        var err_values = [
                          err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                        ]
                        con.query(eq4, [err_values], (er, results) => {
                          if (er) res.send({ message: er.code });
                          res.send({ message: err.code });
                        });
                      }
                      if (account) {
                        res.send({ message: "Expanses Updated" });
                      }
                    });
                  }
                });
              } else {
                res.send({ message: "Income Updated" });
              }
            }
          }
        });
      } else if (req.body.action_type === 'OTHR_EXPNS' && req.body.action_type !== req.body.old_type) {
        var q3 = "UPDATE mv_ms_transactions SET txn_amount= '" + parseInt(req.body.amount) + "',actions='DEBIT',txn_type='OTHR_INCMS_EXPNS',txn_account_id='" + req.body.txn_account_id + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE txn_type_id = '" + req.body.id + "' and txn_type = 'OTHR_INCMS_EXPNS' and erp_id='" + req.body.erp_id + "' and is_active=1";
        con.query(q3, (err, txn) => {
          if (err) {
            var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
            var err_values = [
              err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
            ]
            con.query(eq3, [err_values], (er, results) => {
              if (er) res.send({ message: er.code });
              res.send({ message: err.code });
            });
          }
          if (txn) {
            var current_amount = parseInt(req.body.amount) + parseInt(req.body.old_amount);
            var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount - '" + parseInt(current_amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
            con.query(q4, (err, account) => {
              if (err) {
                var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                var err_values = [
                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                ]
                con.query(eq4, [err_values], (er, results) => {
                  if (er) res.send({ message: er.code });
                  res.send({ message: err.code });
                });
              }
              if (account) {
                if (req.body.old_txn_account_id !== req.body.txn_account_id) {
                  var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(req.body.old_amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.old_txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
                  con.query(q4, (err, account) => {
                    if (err) {
                      var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                      var err_values = [
                        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                      ]
                      con.query(eq4, [err_values], (er, results) => {
                        if (er) res.send({ message: er.code });
                        res.send({ message: err.code });
                      });
                    }
                    if (account) {
                      res.send({ message: "Expenses Updated" });
                    }
                  });
                } else {
                  res.send({ message: "Expenses Updated" });
                }
              }
            });
          }
        });
      } else {
        var q3 = "UPDATE mv_ms_transactions SET txn_amount= '" + parseInt(req.body.amount) + "',actions='DEBIT',txn_type='OTHR_INCMS_EXPNS',txn_account_id='" + req.body.txn_account_id + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE txn_type_id = '" + req.body.id + "' and txn_type = 'OTHR_INCMS_EXPNS' and erp_id='" + req.body.erp_id + "' and is_active=1";
        con.query(q3, (err, txn) => {
          if (err) {
            var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
            var err_values = [
              err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
            ]
            con.query(eq3, [err_values], (er, results) => {
              if (er) res.send({ message: er.code });
              res.send({ message: err.code });
            });
          }
          if (txn) {
            var current_amount = parseInt(req.body.amount) + parseInt(req.body.old_amount);
            var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(current_amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
            con.query(q4, (err, account) => {
              if (err) {
                var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                var err_values = [
                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                ]
                con.query(eq4, [err_values], (er, results) => {
                  if (er) res.send({ message: er.code });
                  res.send({ message: err.code });
                });
              }
              if (account) {
                if (req.body.old_txn_account_id !== req.body.txn_account_id) {
                  var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount - '" + parseInt(req.body.old_amount) + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.old_txn_account_id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
                  con.query(q4, (err, account) => {
                    if (err) {
                      var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                      var err_values = [
                        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
                      ]
                      con.query(eq4, [err_values], (er, results) => {
                        if (er) res.send({ message: er.code });
                        res.send({ message: err.code });
                      });
                    }
                    if (account) {
                      res.send({ message: "Income Updated" });
                    }
                  });
                } else {
                  res.send({ message: "Income Updated" });
                }
              }
            });
          }
        });
      }
    }
  });
});

app.get("/employees", (req, res) => {
  const q = "select id,name,gender,contact_number,email,address from mv_ms_employees where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/single_employees", (req, res) => {
  const q = "select id,name,gender,contact_number,email,address from mv_ms_employees where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/manage_employees", (req, res) => {
  const q1 = "select id,name,gender,contact_number,email,address from mv_ms_employees where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  con.query(q1, (err, result) => {
    if (err) return res.json(err);
    return res.json([result, '']);
  });
});

app.post("/employee", (req, res) => {
  var q = "insert into mv_ms_employees(name,contact_number,address,email,gender,job_id,is_active,pic,erp_id,created_by,last_login_id) values (?)";
  var values = [
    req.body.name,
    req.body.contact_number,
    req.body.address,
    req.body.email,
    req.body.gender,
    req.body.job_id,
    1,
    req.body.pic,
    req.body.erp_id,
    req.body.user_id,
    req.body.erp_id
  ]
  con.query(q, [values], (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    //return res.json({message:"New Customer Added"});
    if (result) res.send({ message: "New Employee Added" });
  });
});

app.get("/suppliers", (req, res) => {
  const q = "select id,name,contact_number,email,address from mv_ms_suppliers where is_active=1 and id!=1 and erp_id=" + req.query.erp_id + " order by id desc";
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/single_suppliers", (req, res) => {
  const q1 = "select id,name,contact_number,email,address,gst_number,tin_number,cash_in_advance,pic from mv_ms_suppliers where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  const q2 = "SELECT date_format(purchase_date,'%b') AS name,SUM(total_amount) AS total FROM mv_ms_purchases_v WHERE erp_id=" + req.query.erp_id + " and supplier_id=" + req.query.id + " GROUP BY YEAR(purchase_date), MONTH(purchase_date)";
  const q3 = "select id, invoice_number,purchase_date,total_amount,payment,balance_payment,payment_status from mv_ms_purchases_v where is_active=1 and erp_id=" + req.query.erp_id + " and supplier_id=" + req.query.id + " order by purchase_date desc";
  con.query(q1, (err, supplier) => {
    if (err) return res.json(err);
    con.query(q2, (err, cust_chart) => {
      if (err) return res.json(err);
      con.query(q3, (err, purchase) => {
        if (err) return res.json(err);
        return res.json([supplier, cust_chart, purchase]);
      });
    });
  });
});

app.get("/print_single_suppliers", (req, res) => {
  const q = "SELECT product_id,name,mrp,gst,discount,total FROM mv_ms_purchase_details_v WHERE purchase_id IN (SELECT id FROM mv_ms_purchases WHERE supplier_id=" + req.query.id + " AND erp_id=" + req.query.erp_id + " is_active=1) AND is_active=1  and erp_id=" + req.query.erp_id + " ORDER BY purchase_id DESC";
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.post("/single_suppliers", (req, res) => {
  var q = "UPDATE mv_ms_suppliers SET is_active=0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (result) {
      var q1 = "UPDATE mv_ms_purchases SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE supplier_id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
      con.query(q1, (err, result) => {
        if (err) {
          var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
          ]
          con.query(eq3, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (result) {
          var q2 = "UPDATE mv_ms_stocks SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE supplier_id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
          con.query(q2, (err, result) => {
            if (err) {
              var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
              var err_values = [
                err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
              ]
              con.query(eq4, [err_values], (er, results) => {
                if (er) res.send({ message: er.code });
                res.send({ message: err.code });
              });
            }
            if (result) {
              res.send({ message: "The supplier Datas are removed" });
            }
          });
        }
      });
    }
  });
});

app.get("/manage_suppliers", (req, res) => {
  const q1 = "select id,name,contact_number,email,address,gst_number,tin_number,pic from mv_ms_suppliers where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
 // const q2 = "select id as value,name as label from mv_ms_accounts where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q1, (err, supplier) => {
    if (err) return res.json(err);
    return res.json([supplier, '']);
  });
});

app.get("/manage_purchase", (req, res) => {
  var q1 = 'select id,name as label from mv_ms_products where is_active=1 and erp_id=' + req.query.erp_id;
  var q2 = 'select id,name as label,contact_number from mv_ms_suppliers where is_active=1 and erp_id=' + req.query.erp_id;
  var q3 = 'select id as value,name as label from mv_ms_accounts where is_active=1 and erp_id=' + req.query.erp_id;
  var q4 = 'select id,supplier_id,name,contact_number,purchase_date,invoice_number,txn_account_id,payment,total_gst,total_discount,total_amount,balance_payment,payment_status,status,erp_id from mv_ms_purchases_v where is_active=1 and erp_id=' + req.query.erp_id + ' and id=' + req.query.id;
  var q5 = 'select id,name,product_id,0 as err_product_id,serial_id,0 as err_serial_id,pack,0 as err_pack,density,0 as err_density,expiry_date,0 as err_expiry_date,buy_quantity,0 as err_buy_quantity,free_quantity,0 as err_free_quantity,mrp,0 as err_mrp,rate,0 as err_rate,gst,0 as err_gst,discount,0 as err_discount, gst_total, discount_total, total,0 as err_total,purchase_id,status,erp_id from  mv_ms_purchase_details_v where is_active=1 and erp_id=' + req.query.erp_id + ' and purchase_id=' + req.query.id;
  con.query(q1, (err, products) => {
    if (err) return res.json(err);
    con.query(q2, (err, suppliers) => {
      if (err) return res.json(err);
      con.query(q3, (err, accounts) => {
        if (err) return res.json(err);
        con.query(q4, (err, purchase) => {
          if (err) return res.json(err);
          con.query(q5, (err, details) => {
            if (err) return res.json(err);
            // console.log(suppliers);
            return res.json([purchase, details, products, suppliers, accounts]);
          });
        });
      });
    });
  });
});

app.post("/supplier", (req, res) => {
  //console.log(req.body.contact_number);
  var q = "insert into mv_ms_suppliers(name,contact_number,address,email,gst_number,cash_in_advance,is_active,pic,erp_id,created_by,last_login_id) values (?)";
  var values = [
    req.body.name,
    req.body.contact_number,
    req.body.address,
    req.body.email,
    req.body.gst_number,
    0,
    1,
    req.body.pic,
    req.body.erp_id,
    req.body.user_id,
    req.body.erp_id
  ]
  con.query(q, [values], (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    //return res.json({message:"New Customer Added"});
    if (result) {
        res.send({ message: "New supplier added" });
    }
  });
});

app.post("/manage_suppliers", (req, res) => {
  var q = "UPDATE mv_ms_suppliers SET name='" + req.body.name + "',contact_number='" + req.body.contact_number + "',address='" + req.body.address + "',email='" + req.body.email + "',gst_number='" + req.body.gst_number + "',pic='" + req.body.pic + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "' WHERE id = '" + req.body.id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    }
    if (result) {
      res.send({ message: "Supplier Details Updated" });
    }
  });
});

app.get("/sales", (req, res) => {
  const q = "select id,name, invoice_number,sales_date,total_amount,payment,balance_payment,payment_status from mv_ms_sales_v where is_active=1 and erp_id=" + req.query.erp_id + " order by id desc";
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/single_sales", (req, res) => {
  const q1 = "select id,name, invoice_number,sales_date,total_gst,total_discount,total_amount,payment,balance_payment,payment_status,status from mv_ms_sales_v where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  const q2 = "SELECT 'print' as printer from DUAL";
  const q3 = "select id,name,stock_id,serial_id,expiry_date,pack,density,quantity,mrp,gst,discount,total,status from  mv_ms_sales_details_v where is_active=1 and erp_id=" + req.query.erp_id + " and sales_id=" + req.query.id + " order by creation_date desc";
  con.query(q1, (err, sales) => {
    if (err) return res.json(err);
    con.query(q2, (err, cust_chart) => {
      if (err) return res.json(err);
      con.query(q3, (err, details) => {
        if (err) return res.json(err);
        const print = cust_chart[0].printer;
        return res.json([sales, print, details]);
      });
    });
  });
});

app.post("/single_sales", (req, res) => {
  var q = "UPDATE mv_ms_sales SET is_active=0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (result) {
      var q1 = "UPDATE mv_ms_sales_details SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE sales_id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
      con.query(q1, (err, result) => {
        if (err) {
          var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
          ]
          con.query(eq3, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (result) {
          res.send({ message: "The Purchase Datas are removed" });
        }
      });
    }
  });
});
/*
app.get("/manage_suppliers", (req, res) => {
  const q1 = "select id,name, invoice_number,sales_date,total_gst,total_discount,total_amount,payment,balance_payment,payment_status from mv_ms_sales_v where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  con.query(q1, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});
*/

app.get("/notifications", (req, res) => {
  const q = "select id,msg_from,from_user,msg_to,to_user,msg_subject,message,msg_status from mv_ms_notifications_v where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/single_notifications", (req, res) => {
  const q = "select id, msg_from,from_user,msg_to,to_user,msg_subject,message,msg_status from mv_ms_notifications_v where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  con.query(q, (err, notify) => {
    if (err) return res.json(err);
    if (notify) {
      var updq = "UPDATE mv_ms_notifications SET msg_status= 'Read' WHERE id = '" + req.query.id + "'";
      con.query(updq, (err, result) => {
        if (err) {
          var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1
          ]
          con.query(eq4, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (result) {
          return res.json([notify, '', '']);
        }
      });

    }
  });
});

app.post("/single_notifications", (req, res) => {
  var q = "UPDATE mv_ms_notifications SET is_active=0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (result) {
      res.send({ message: "The Notification Datas are removed" });
    }
  });
});

app.get("/stocks", (req, res) => {
  const q = "select id,name,category_name,product_id,serial_id,expiry_date,density,quantity,mrp,gst,discount,pic from mv_ms_stocks_v where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/single_stocks", (req, res) => {
  const q1 = "select id,name,product_code,serial_id,expiry_date,density,quantity,mrp,gst,discount,pic from mv_ms_stocks_v where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  const q2 = "SELECT date_format(creation_date,'%b') AS name, SUM(total) AS total FROM mv_ms_sales_details_v WHERE erp_id=" + req.query.erp_id + " and stock_id=" + req.query.id + " GROUP BY YEAR(creation_date), MONTH(creation_date)";
  const q3 = "select id, name,serial_id,pack,expiry_date,density,quantity,mrp,gst,discount,total from mv_ms_sales_details_v where is_active=1 and erp_id=" + req.query.erp_id + " and stock_id=" + req.query.id + " order by creation_date desc  limit 6";
  con.query(q1, (err, supplier) => {
    if (err) return res.json(err);
    con.query(q2, (err, cust_chart) => {
      if (err) return res.json(err);
      con.query(q3, (err, purchase) => {
        if (err) return res.json(err);
        return res.json([supplier, cust_chart, purchase]);
      });
    });
  });
});

app.post("/single_stocks", (req, res) => {
  var q = "UPDATE mv_ms_stocks SET is_active=0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (result) {
      var q1 = "UPDATE mv_ms_sales_details SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE stock_id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
      con.query(q1, (err, result) => {
        if (err) {
          var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
          ]
          con.query(eq3, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (result) {
          res.send({ message: "The Stock Datas are removed" });
        }
      });
    }
  });
});

app.get("/pos", (req, res) => {
  const q1 = "select id,name,product_code,category_name,category_id,product_id,serial_id,expiry_date,density,quantity,mrp as price,gst,discount,pic as image from mv_ms_stocks_v where is_active=1 and erp_id=" + req.query.erp_id;
  const q2 = "select id as value,name as label from mv_ms_categories where is_active=1 and erp_id=" + req.query.erp_id;
  const q3 = "select id,name as label,contact_number from mv_ms_customers where is_active=1 and erp_id=" + req.query.erp_id;
  const q4 = "select id as value,name as label from mv_ms_accounts where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q1, (err, stocks) => {
    if (err) return res.json(err);
    con.query(q2, (err, categories) => {
      if (err) return res.json(err);
      con.query(q3, (err, customers) => {
        if (err) return res.json(err);
        con.query(q4, (err, accounts) => {
          if (err) return res.json(err);
          return res.json([stocks, categories, customers, accounts]);
        });
      });
    });
  });
});

app.get("/erp_settings", (req, res) => {
  const q = "select id,erp_title,erp_name,erp_address,api_key,key_token,tin_number,gst_number,pic,erp_admin,erp_user,erp_sales_person,erp_unit,erp_currency,erp_sales_setting,erp_purchase_setting,email,ip_address,language,licence_key,	expire_date,updated_version,sys_email from mv_ms_erp_settings_v where id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});
app.get("/purchases", (req, res) => {
  const q = "select id,name,invoice_number,purchase_date,total_amount,payment,balance_payment,payment_status,status from mv_ms_purchases_v where is_active=1 and erp_id=" + req.query.erp_id + " order by id desc";;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/single_purchases", (req, res) => {
  const q1 = "select id,name,contact_number,invoice_number,purchase_date,total_gst,total_discount,total_amount,payment,balance_payment,payment_status,status,bank from mv_ms_purchases_v where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  const q2 = "SELECT 'print' as printer from DUAL";
  const q3 = "select id, name,serial_id,expiry_date,pack,density,buy_quantity,free_quantity,mrp,rate,gst,discount,total,status from  mv_ms_purchase_details_v where is_active=1 and erp_id=" + req.query.erp_id + " and purchase_id=" + req.query.id;
  con.query(q1, (err, purchases) => {
    if (err) return res.json(err);
    con.query(q2, (err, print_txt) => {
      if (err) return res.json(err);
      con.query(q3, (err, details) => {
        if (err) return res.json(err);
        const print = print_txt[0].printer;
        return res.json([purchases, print, details]);
      });
    });
  });
});

app.post("/single_purchases", (req, res) => {
  var q = "UPDATE mv_ms_purchases SET is_active=0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (result) {
      var q1 = "UPDATE mv_ms_purchase_details SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE purchase_id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
      con.query(q1, (err, result) => {
        if (err) {
          var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
          ]
          con.query(eq3, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (result) {
          res.send({ message: "The Purchase Datas are removed" });
        }
      });
    }
  });
});

app.post("/single_purchases_details", (req, res) => {
  var q1 = "UPDATE mv_ms_purchase_details SET is_active= 0, updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE purchase_id = '" + req.query.id + "' and id = '" + req.query.detail_id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q1, (err, result) => {
    if (err) {
      var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
      ]
      con.query(eq3, [err_values], (er, results) => {
        if (er) res.send({ message: er.code });
        res.send({ message: err.code });
      });
    }
    if (result) {
      res.send({ message: "The Purchase item removed" });
    }
  });

});

app.get("/manage_purchases", (req, res) => {
  const q1 = "select id,name,invoice_number,purchase_date,total_gst,total_discount,total_amount,payment,balance_payment,payment_status from mv_ms_purchases_v where is_active=1 and erp_id=" + req.query.erp_id + " and id=" + req.query.id;
  con.query(q1, (err, result) => {
    if (err) return res.json(err);
    return res.json(result);
  });
});

app.get("/salesLov", (req, res) => {
  var q1 = 'select id ,product_code as label,product_id ,pic,brand_name,category_name,serial_id,expiry_date,density,quantity,mrp,gst,discount,is_active FROM mv_ms_stocks_v where is_active=1 and erp_id=' + req.query.erp_id;
  const q2 = "select id,name as label,contact_number from mv_ms_customers where is_active=1 and erp_id=" + req.query.erp_id;
  const q3 = "select id as value,name as label from mv_ms_accounts where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q1, (err, products) => {
    if (err) return res.json(err);
    con.query(q2, (err, customers) => {
      if (err) return res.json(err);
      con.query(q3, (err, accounts) => {
        if (err) return res.json(err);
        return res.json([products, customers, accounts]);
      });
    });
  });
});

app.get("/manage_sales", (req, res) => {
  var q1 = 'select id,name as label from mv_ms_products where is_active=1 and erp_id=' + req.query.erp_id;
  var q2 = 'select id,name as label,contact_number from mv_ms_customers where is_active=1 and erp_id=' + req.query.erp_id;
  var q3 = 'select id as value,name as label from mv_ms_accounts where is_active=1 and erp_id=' + req.query.erp_id;
  var q4 = 'select id,customer_id,name,contact_number,sales_date,invoice_number,txn_account_id,payment,total_gst,total_discount,total_amount,balance_payment,payment_status,status,erp_id from mv_ms_sales_v where is_active=1 and erp_id=' + req.query.erp_id + ' and id=' + req.query.id;
  var q5 = "select id,concat(SUBSTRING(REPLACE(name,' ',''), 1, 3),concat('666',id)) as product_code,name,product_id,0 as err_product_id,serial_id,0 as err_serial_id,pack,0 as err_pack,density,0 as err_density,expiry_date,0 as err_expiry_date,avl_quantity,0 as err_avl_quantity,quantity,0 as err_quantity,mrp,0 as err_mrp,gst,0 as err_gst,discount,0 as err_discount, gst_total, discount_total, total,0 as err_total,sales_id,status,erp_id from  mv_ms_sales_details_v where is_active=1 and erp_id=" + req.query.erp_id + " and sales_id=" + req.query.id;
  con.query(q1, (err, products) => {
    if (err) return res.json(err);
    console.log(products);
    con.query(q2, (err, customers) => {
      if (err) return res.json(err);
      con.query(q3, (err, accounts) => {
        if (err) return res.json(err);
        con.query(q4, (err, sales) => {
          if (err) return res.json(err);
          con.query(q5, (err, details) => {
            if (err) return res.json(err);
            console.log(details);
            return res.json([sales, details, products, customers, accounts]);
          });
        });
      });
    });
  });
});

app.post("/addsales_order", (req, res) => {
  var q1 = "insert into mv_ms_sales(customer_id,invoice_number,sales_date,total_gst,total_discount,total_amount,payment,balance_payment,payment_status,status,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
  var values = [
    req.body.data.customer_id,
    req.body.data.invoice_number,
    req.body.data.sales_date,
    req.body.data.total_gst,
    req.body.data.total_discount,
    req.body.data.total_amount,
    req.body.data.payment,
    req.body.data.total_amount - req.body.data.payment,
    (req.body.data.total_amount > req.body.data.payment) ? 'DUE' : 'PAID',
    'ORDERED',
    req.body.data.txn_account_id,
    1,
    req.body.data.erp_id,
    req.body.data.user_id,
    req.body.data.erp_id
  ]
  con.query(q1, [values], (err, sales) => {
    if (err) {
      var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
      ]
      con.query(eq, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (sales) {
      var sales_id = sales.insertId;
      var q2 = "insert into mv_ms_sales_details(product_id,stock_id, serial_id, expiry_date, pack, density, quantity, mrp, gst, discount, total, sales_id,status, is_active,erp_id,created_by,last_login_id) values ?";
      let det_values = [];
      for (var i = 0; i < req.body.state.length; i++) {
        det_values.push(new Array(req.body.state[i].product_id, req.body.state[i].id, req.body.state[i].serial_id, req.body.state[i].expiry_date, req.body.state[i].pack, req.body.state[i].density, req.body.state[i].quantity, req.body.state[i].mrp, req.body.state[i].gst, req.body.state[i].discount, req.body.state[i].total, sales_id, 'INORDER', 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id));
      }
      // console.log(det_values);
      con.query(q2, [det_values], (err, sales_details) => {
        if (err) {
          var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
          ]
          con.query(eq1, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (sales_details) {
          if (req.body.data.payment > 0) {
            var q4 = "insert into mv_ms_transactions(actions,txn_type,txn_type_id,txn_amount,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
            var txn_values = [
              "CREDIT",
              "SALES",
              sales_id,
              req.body.data.payment,
              req.body.data.txn_account_id,
              1,
              req.body.data.erp_id,
              req.body.data.user_id,
              req.body.data.erp_id
            ]
            con.query(q4, [txn_values], (err, transactions) => {
              if (err) {
                var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                var err_values = [
                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                ]
                con.query(eq3, [err_values], (er, results) => {
                  if (er) res.send({ message: er.code });
                  res.send({ message: err.code });
                });
              }
              if (transactions) {
                var q5 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(req.body.data.payment) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' WHERE id = '" + req.body.data.txn_account_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
                con.query(q5, (err, accounts) => {
                  if (err) {
                    var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                    var err_values = [
                      err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                    ]
                    con.query(eq4, [err_values], (er, results) => {
                      if (er) res.send({ message: er.code });
                      res.send({ message: err.code });
                    });
                  }
                  if (accounts) {
                    var balance = req.body.data.total_amount - req.body.data.payment;
                    if (balance) {
                      var q6 = "UPDATE mv_ms_customers SET cash_in_advance= cash_in_advance - '" + parseInt(balance) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' WHERE id = '" + req.body.data.customer_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
                      con.query(q6, (err, customers) => {
                        if (err) {
                          var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                          var err_values = [
                            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                          ]
                          con.query(eq4, [err_values], (er, results) => {
                            if (er) res.send({ message: er.code });
                            res.send({ message: err.code });
                          });
                        }
                        if (customers) {
                          res.send({ message: "New Sales invoice Created" });
                        }
                      });
                    } else {
                      res.send({ message: "New Sales invoice Created" });
                    }
                  }
                });
              }
            });
          }
        } else {
          res.send({ message: "New Sales invoice Created" });
        }
      });
    }
  });
});

app.post("/addsales", (req, res) => {
  var q1 = "insert into mv_ms_sales(customer_id,invoice_number,sales_date,total_gst,total_discount,total_amount,payment,balance_payment,payment_status,status,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
  var values = [
    req.body.data.customer_id,
    req.body.data.invoice_number,
    req.body.data.sales_date,
    req.body.data.total_gst,
    req.body.data.total_discount,
    req.body.data.total_amount,
    req.body.data.payment,
    req.body.data.total_amount - req.body.data.payment,
    (req.body.data.total_amount > req.body.data.payment) ? 'DUE' : 'PAID',
    'CONFIRMED',
    req.body.data.txn_account_id,
    1,
    req.body.data.erp_id,
    req.body.data.user_id,
    req.body.data.erp_id
  ]
  con.query(q1, [values], (err, sales) => {
    if (err) {
      var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
      ]
      con.query(eq, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        //  console.log(err.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (sales) {
      var sales_id = sales.insertId;
      var q2 = "insert into mv_ms_sales_details(product_id,stock_id, serial_id, expiry_date, pack, density, quantity, mrp, gst, discount, total, sales_id,status, is_active,erp_id,created_by,last_login_id) values ?";
      let det_values = [];
      for (var i = 0; i < req.body.state.length; i++) {
        det_values.push(new Array(req.body.state[i].product_id, req.body.state[i].id, req.body.state[i].serial_id, req.body.state[i].expiry_date, req.body.state[i].pack, req.body.state[i].density, req.body.state[i].quantity, req.body.state[i].mrp, req.body.state[i].gst, req.body.state[i].discount, req.body.state[i].total, sales_id, 'STOCKOUT', 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id));
      }
      // console.log(det_values);
      con.query(q2, [det_values], (err, sales_details) => {
        if (err) {
          var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
          ]
          con.query(eq1, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (sales_details) {
          var q3 = "UPDATE mv_ms_stocks INNER JOIN mv_ms_sales_details ON (mv_ms_stocks.id=mv_ms_sales_details.stock_id and mv_ms_stocks.erp_id=mv_ms_sales_details.erp_id and mv_ms_stocks.is_active=1 and mv_ms_sales_details.sales_id='" + sales_id + "') SET mv_ms_stocks.quantity =mv_ms_stocks.quantity - mv_ms_sales_details.quantity, mv_ms_stocks.updated_by = '" + req.body.data.user_id + "',mv_ms_stocks.last_login_id = '" + req.body.data.erp_id + "'";
          con.query(q3, (err, stocks) => {
            if (err) {
              var eq2 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
              var err_values = [
                err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
              ]
              con.query(eq2, [err_values], (er, results) => {
                if (er) res.send({ message: er.code });
                res.send({ message: err.code });
              });
            }
          });
          if (req.body.data.payment > 0) {
            var q4 = "insert into mv_ms_transactions(actions,txn_type,txn_type_id,txn_amount,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
            var txn_values = [
              "CREDIT",
              "SALES",
              sales_id,
              req.body.data.payment,
              req.body.data.txn_account_id,
              1,
              req.body.data.erp_id,
              req.body.data.user_id,
              req.body.data.erp_id
            ]
            con.query(q4, [txn_values], (err, transactions) => {
              if (err) {
                var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                var err_values = [
                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                ]
                con.query(eq3, [err_values], (er, results) => {
                  if (er) res.send({ message: er.code });
                  res.send({ message: err.code });
                });
              }
              if (transactions) {
                var q5 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(req.body.data.payment) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' WHERE id = '" + req.body.data.txn_account_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
                con.query(q5, (err, accounts) => {
                  if (err) {
                    var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                    var err_values = [
                      err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                    ]
                    con.query(eq4, [err_values], (er, results) => {
                      if (er) res.send({ message: er.code });
                      res.send({ message: err.code });
                    });
                  }
                  if (accounts) {
                    var balance = req.body.data.total_amount - req.body.data.payment;
                    if (balance) {
                      var q6 = "UPDATE mv_ms_customers SET cash_in_advance= cash_in_advance - '" + parseInt(balance) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' WHERE id = '" + req.body.data.customer_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
                      con.query(q6, (err, customers) => {
                        if (err) {
                          var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                          var err_values = [
                            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                          ]
                          con.query(eq4, [err_values], (er, results) => {
                            if (er) res.send({ message: er.code });
                            res.send({ message: err.code });
                          });
                        }
                        if (customers) {
                          res.send({ message: "New Sales invoice Created" });
                        }
                      });
                    } else {
                      res.send({ message: "New Sales invoice Created" });
                    }
                  }
                });
              }
            });
          } else {
            res.send({ message: "New Sales invoice Created" });
          }
        }
      });
    }
  });
});

app.post("/manage_sales", (req, res) => {
  let due = (req.body.data.total_amount > req.body.data.payment) ? 'DUE' : 'PAID';
  let pay_balance = req.body.data.total_amount - req.body.data.payment;
  var q = "UPDATE mv_ms_sales SET customer_id='" + req.body.data.customer_id + "',invoice_number='" + req.body.data.invoice_number + "',sales_date='" + req.body.data.sales_date + "',total_gst='" + req.body.data.total_gst + "',total_discount='" + req.body.data.total_discount + "',total_amount='" + req.body.data.total_amount + "',payment='" + req.body.data.payment + "',balance_payment='" + pay_balance + "',payment_status='" + due + "',status='" + 'CONFIRMED' + "',txn_account_id='" + req.body.data.txn_account_id + "',updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q, (err, sales) => {
    if (err) {
      var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
      ]
      con.query(eq, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (sales) {
      var sales_id = req.query.id;
      //  var q13 = "UPDATE table_users SET product_id = (case when id = ? then ? end),serial_id = (case when id = ? then ? end),expiry_date = (case when id = ? then ? end),pack = (case when id = ? then ? end),product_id = (case when id = ? then ? end),product_id = (case when id = ? then ? end), date = '12082014' WHERE id in (?) AND sales_id = ?'";
      var q1 = "insert into mv_ms_sales_details_temp(id,stock_id,product_id, serial_id, expiry_date, pack, density, quantity, mrp, gst,gst_total,discount,discount_total, total,status, sales_id, is_active,erp_id,created_by,last_login_id) values ?";
      let det_values = [];
      for (var i = 0; i < req.body.state.length; i++) {
        det_values.push(new Array(req.body.state[i].id, req.body.state[i].stock_id, req.body.state[i].product_id, req.body.state[i].serial_id, req.body.state[i].expiry_date, req.body.state[i].pack, req.body.state[i].density, req.body.state[i].quantity, req.body.state[i].mrp, req.body.state[i].gst, req.body.state[i].gst_total, req.body.state[i].discount, req.body.state[i].discount_total, req.body.state[i].total, 'INSTOCK', sales_id, 1, req.query.erp_id, req.query.user_id, req.query.erp_id));
      }
      // console.log(det_values);
      con.query(q1, [det_values], (err, sales_details_temp) => {
        if (err) {
          var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
          ]
          con.query(eq1, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (sales_details_temp) {
          var q2 = "UPDATE mv_ms_sales_details INNER JOIN mv_ms_sales_details_temp ON (mv_ms_sales_details.id=mv_ms_sales_details_temp.id and mv_ms_sales_details.erp_id=mv_ms_sales_details_temp.erp_id and mv_ms_sales_details.is_active=1 and mv_ms_sales_details.sales_id=mv_ms_sales_details_temp.sales_id) SET mv_ms_sales_details.product_id =mv_ms_sales_details_temp.product_id,mv_ms_sales_details.stock_id =mv_ms_sales_details_temp.stock_id,mv_ms_sales_details.serial_id = mv_ms_sales_details_temp.serial_id,mv_ms_sales_details.expiry_date = mv_ms_sales_details_temp.expiry_date,mv_ms_sales_details.pack = mv_ms_sales_details_temp.pack,mv_ms_sales_details.density = mv_ms_sales_details_temp.density,mv_ms_sales_details.quantity = mv_ms_sales_details_temp.quantity,mv_ms_sales_details.mrp = mv_ms_sales_details_temp.mrp,mv_ms_sales_details.gst = mv_ms_sales_details_temp.gst,mv_ms_sales_details.gst_total = mv_ms_sales_details_temp.gst_total,mv_ms_sales_details.discount = mv_ms_sales_details_temp.discount,mv_ms_sales_details.discount_total = mv_ms_sales_details_temp.discount_total,mv_ms_sales_details.total = mv_ms_sales_details_temp.total,mv_ms_sales_details.status = mv_ms_sales_details_temp.status,mv_ms_sales_details.sales_id =  '" + sales_id + "',mv_ms_sales_details.is_active =  mv_ms_sales_details_temp.is_active ,mv_ms_sales_details.updated_by = '" + req.query.user_id + "',mv_ms_sales_details.last_login_id = '" + req.query.erp_id + "'";
          con.query(q2, (err, update_sales_details) => {
            if (err) {
              var e_verifyquery = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
              var err_values = [
                err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
              ]
              con.query(e_verifyquery, [err_values], (er, results) => {
                if (er) res.send({ message: er.code });
                res.send({ message: err.code });
              });
            }
            if (update_sales_details) {
              var q3 = "insert into mv_ms_sales_details(product_id,stock_id,serial_id,expiry_date,pack,density,quantity,mrp,gst,gst_total,discount,discount_total,total,sales_id,status,is_active,erp_id,created_by,last_login_id) SELECT product_id,stock_id, serial_id,expiry_date,pack,density,quantity,mrp,gst,gst_total,discount,discount_total,total,'" + sales_id + "',status, 1,'" + req.query.erp_id + "','" + req.query.user_id + "','" + req.query.erp_id + "' FROM mv_ms_sales_details_temp WHERE (id,sales_id,erp_id) NOT IN (SELECT id,sales_id,erp_id FROM mv_ms_sales_details) and sales_id='" + sales_id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
              con.query(q3, (err, insert_sales_details) => {
                if (err) {
                  var eq2 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                  var err_values = [
                    err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                  ]
                  con.query(eq2, [err_values], (er, results) => {
                    if (er) res.send({ message: er.code });
                    res.send({ message: err.code });
                  });
                }
                if (insert_sales_details) {
                  var q4 = "DELETE from mv_ms_sales_details_temp where sales_id='" + sales_id + "' and erp_id = '" + req.query.erp_id + "'";
                  con.query(q4, (err, delete_temp) => {
                    if (err) {
                      var e_verifyquery = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                      var err_values = [
                        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                      ]
                      con.query(e_verifyquery, [err_values], (er, results) => {
                        if (er) res.send({ message: er.code });
                        res.send({ message: err.code });
                      });
                    }
                    if (delete_temp) {
                      var q4 = "UPDATE mv_ms_stocks INNER JOIN mv_ms_sales_details ON (mv_ms_stocks.product_id=mv_ms_sales_details.product_id and mv_ms_stocks.serial_id=mv_ms_sales_details.serial_id and mv_ms_stocks.erp_id=mv_ms_sales_details.erp_id and mv_ms_stocks.expiry_date=mv_ms_sales_details.expiry_date and mv_ms_stocks.is_active=1 and mv_ms_sales_details.sales_id='" + sales_id + "') SET mv_ms_stocks.quantity =mv_ms_stocks.quantity - mv_ms_sales_details.quantity,mv_ms_stocks.updated_by = '" + req.query.user_id + "',mv_ms_stocks.last_login_id = '" + req.query.erp_id + "'";
                      con.query(q4, (err, update_stocks) => {
                        if (err) {
                          var e_verifyquery = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                          var err_values = [
                            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                          ]
                          con.query(e_verifyquery, [err_values], (er, results) => {
                            if (er) res.send({ message: er.code });
                            res.send({ message: err.code });
                          });
                        }
                        if (update_stocks) {
                          var q3 = "insert into mv_ms_stocks(product_id,supplier_id,serial_id,expiry_date,density,quantity,mrp,gst,discount,is_active,erp_id,created_by,last_login_id) SELECT product_id,supplier_id, serial_id, expiry_date,  density, quantity, mrp,  gst, discount, 1,'" + req.query.erp_id + "','" + req.query.user_id + "','" + req.query.erp_id + "' FROM mv_ms_sales_details_v WHERE (product_id, serial_id, expiry_date) NOT IN (SELECT product_id,serial_id, expiry_date FROM mv_ms_stocks) and sales_id='" + sales_id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
                          con.query(q3, (err, stocks) => {
                            if (err) {
                              var eq2 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                              var err_values = [
                                err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                              ]
                              con.query(eq2, [err_values], (er, results) => {
                                if (er) res.send({ message: er.code });
                                res.send({ message: err.code });
                              });
                            }
                          });
                        }
                      });
                      if (req.body.data.payment > 0) {
                        var q4 = "insert into mv_ms_transactions(actions,txn_type,txn_type_id,txn_amount,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
                        var txn_values = [
                          "CREDIT",
                          "SALES_CONFIRMED",
                          sales_id,
                          req.body.data.payment,
                          req.body.data.txn_account_id,
                          1,
                          req.query.erp_id,
                          req.query.user_id,
                          req.query.erp_id
                        ]
                        con.query(q4, [txn_values], (err, transactions) => {
                          if (err) {
                            var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                            var err_values = [
                              err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                            ]
                            con.query(eq3, [err_values], (er, results) => {
                              if (er) res.send({ message: er.code });
                              res.send({ message: err.code });
                            });
                          }
                          if (transactions) {
                            var q5 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(req.body.data.payment) + "',updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.body.data.txn_account_id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
                            con.query(q5, (err, accounts) => {
                              if (err) {
                                var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                                var err_values = [
                                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                                ]
                                con.query(eq4, [err_values], (er, results) => {
                                  if (er) res.send({ message: er.code });
                                  res.send({ message: err.code });
                                });
                              }
                              if (accounts) {
                                var balance = req.body.data.total_amount - req.body.data.payment;
                                if (balance) {
                                  var q6 = "UPDATE mv_ms_customers SET cash_in_advance= cash_in_advance - '" + parseInt(balance) + "',updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.body.data.customer_id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
                                  con.query(q6, (err, customers) => {
                                    if (err) {
                                      var eq5 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                                      var err_values = [
                                        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                                      ]
                                      con.query(eq5, [err_values], (er, results) => {
                                        if (er) res.send({ message: er.code });
                                        res.send({ message: err.code });
                                      });
                                    }
                                    if (customers) {
                                      res.send({ message: "Sales invoice Updated" });
                                    }
                                  });
                                } else {
                                  res.send({ message: "Sales invoice Updated" });
                                }
                              }
                            });
                          }
                        });
                      } else {
                        res.send({ message: "Sales invoice updated" });
                      }
                    }//update stock
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});


app.post("/manage_sales_order", (req, res) => {
  let due = (req.body.data.total_amount > req.body.data.payment) ? 'DUE' : 'PAID';
  let pay_balance = req.body.data.total_amount - req.body.data.payment;
  var q = "UPDATE mv_ms_sales SET customer_id='" + req.body.data.customer_id + "',invoice_number='" + req.body.data.invoice_number + "',sales_date='" + req.body.data.sales_date + "',total_gst='" + req.body.data.total_gst + "',total_discount='" + req.body.data.total_discount + "',total_amount='" + req.body.data.total_amount + "',payment='" + req.body.data.payment + "',balance_payment='" + pay_balance + "',payment_status='" + due + "',status='" + 'ORDERED' + "',txn_account_id='" + req.body.data.txn_account_id + "',updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q, (err, sales) => {
    if (err) {
      var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
      ]
      con.query(eq, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (sales) {
      var sales_id = req.query.id;
      //  var q13 = "UPDATE table_users SET product_id = (case when id = ? then ? end),serial_id = (case when id = ? then ? end),expiry_date = (case when id = ? then ? end),pack = (case when id = ? then ? end),product_id = (case when id = ? then ? end),product_id = (case when id = ? then ? end), date = '12082014' WHERE id in (?) AND sales_id = ?'";
      var q1 = "insert into mv_ms_sales_details_temp(id,product_id,stock_id, serial_id, expiry_date, pack, density, quantity, mrp, gst,gst_total, discount,discount_total, total,status, sales_id, is_active,erp_id,created_by,last_login_id) values ?";
      let det_values = [];
      for (var i = 0; i < req.body.state.length; i++) {
        det_values.push(new Array(req.body.state[i].id, req.body.state[i].stock_id, req.body.state[i].product_id, req.body.state[i].serial_id, req.body.state[i].expiry_date, req.body.state[i].pack, req.body.state[i].density, req.body.state[i].quantity, req.body.state[i].mrp, req.body.state[i].gst, req.body.state[i].gst_total, req.body.state[i].discount, req.body.state[i].discount_total, req.body.state[i].total, 'INSTOCK', sales_id, 1, req.query.erp_id, req.query.user_id, req.query.erp_id));
      }
      // console.log(det_values);
      con.query(q1, [det_values], (err, sales_details_temp) => {
        if (err) {
          var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
          ]
          con.query(eq1, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (sales_details_temp) {
          var q2 = "UPDATE mv_ms_sales_details INNER JOIN mv_ms_sales_details_temp ON (mv_ms_sales_details.id=mv_ms_sales_details_temp.id and mv_ms_sales_details.erp_id=mv_ms_sales_details_temp.erp_id and mv_ms_sales_details.sales_id=mv_ms_sales_details_temp.sales_id) SET mv_ms_sales_details.product_id =mv_ms_sales_details_temp.product_id,mv_ms_sales_details.stock_id =mv_ms_sales_details_temp.stock_id,mv_ms_sales_details.serial_id = mv_ms_sales_details_temp.serial_id,mv_ms_sales_details.expiry_date = mv_ms_sales_details_temp.expiry_date,mv_ms_sales_details.pack = mv_ms_sales_details_temp.pack,mv_ms_sales_details.density = mv_ms_sales_details_temp.density,mv_ms_sales_details.quantity = mv_ms_sales_details_temp.quantity,mv_ms_sales_details.mrp = mv_ms_sales_details_temp.mrp,mv_ms_sales_details.gst = mv_ms_sales_details_temp.gst,mv_ms_sales_details.gst_total = mv_ms_sales_details_temp.gst_total,mv_ms_sales_details.discount = mv_ms_sales_details_temp.discount,mv_ms_sales_details.discount_total = mv_ms_sales_details_temp.discount_total,mv_ms_sales_details.total = mv_ms_sales_details_temp.total,mv_ms_sales_details.status =  mv_ms_sales_details_temp.status,mv_ms_sales_details.sales_id =  mv_ms_sales_details_temp.sales_id,mv_ms_sales_details.is_active =  mv_ms_sales_details_temp.is_active ,mv_ms_sales_details.updated_by = '" + req.query.user_id + "',mv_ms_sales_details.last_login_id = '" + req.query.erp_id + "'";
          con.query(q2, (err, update_sales_details) => {
            if (err) {
              var e_verifyquery = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
              var err_values = [
                err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
              ]
              con.query(e_verifyquery, [err_values], (er, results) => {
                if (er) res.send({ message: er.code });
                res.send({ message: err.code });
              });
            }
            if (update_sales_details) {
              var q3 = "insert into mv_ms_sales_details(product_id,stock_id,serial_id,expiry_date,pack,density,quantity,mrp,gst,gst_total,discount,discount_total,total,sales_id,status,is_active,erp_id,created_by,last_login_id) SELECT product_id,stock_id, serial_id,expiry_date,pack,density,quantity,mrp,gst,gst_total,discount,discount_total,total,'" + sales_id + "',status, 1,'" + req.query.erp_id + "','" + req.query.user_id + "','" + req.query.erp_id + "' FROM mv_ms_sales_details_temp WHERE (id,sales_id,erp_id) NOT IN (SELECT id,sales_id,erp_id FROM mv_ms_sales_details) and sales_id='" + sales_id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
              con.query(q3, (err, insert_sales_details) => {
                if (err) {
                  var eq2 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                  var err_values = [
                    err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                  ]
                  con.query(eq2, [err_values], (er, results) => {
                    if (er) res.send({ message: er.code });
                    res.send({ message: err.code });
                  });
                }
                if (insert_sales_details) {
                  var q4 = "DELETE from mv_ms_sales_details_temp where sales_id='" + sales_id + "' and erp_id = '" + req.query.erp_id + "'";
                  con.query(q4, (err, delete_temp) => {
                    if (err) {
                      var e_verifyquery = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                      var err_values = [
                        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                      ]
                      con.query(e_verifyquery, [err_values], (er, results) => {
                        if (er) res.send({ message: er.code });
                        res.send({ message: err.code });
                      });
                    }
                    if (delete_temp) {
                      if (req.body.data.payment > 0) {
                        var q4 = "insert into mv_ms_transactions(actions,txn_type,txn_type_id,txn_amount,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
                        var txn_values = [
                          "CREDIT",
                          "SALES_CONFIRMED",
                          sales_id,
                          req.body.data.payment,
                          req.body.data.txn_account_id,
                          1,
                          req.query.erp_id,
                          req.query.user_id,
                          req.query.erp_id
                        ]
                        con.query(q4, [txn_values], (err, transactions) => {
                          if (err) {
                            var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                            var err_values = [
                              err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                            ]
                            con.query(eq3, [err_values], (er, results) => {
                              if (er) res.send({ message: er.code });
                              res.send({ message: err.code });
                            });
                          }
                          if (transactions) {
                            var q5 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(req.body.data.payment) + "',updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.body.data.txn_account_id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
                            con.query(q5, (err, accounts) => {
                              if (err) {
                                var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                                var err_values = [
                                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                                ]
                                con.query(eq4, [err_values], (er, results) => {
                                  if (er) res.send({ message: er.code });
                                  res.send({ message: err.code });
                                });
                              }
                              if (accounts) {
                                var balance = req.body.data.total_amount - req.body.data.payment;
                                if (balance) {
                                  var q6 = "UPDATE mv_ms_customers SET cash_in_advance= cash_in_advance - '" + parseInt(balance) + "',updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.body.data.customer_id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
                                  con.query(q6, (err, customers) => {
                                    if (err) {
                                      var eq5 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                                      var err_values = [
                                        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                                      ]
                                      con.query(eq5, [err_values], (er, results) => {
                                        if (er) res.send({ message: er.code });
                                        res.send({ message: err.code });
                                      });
                                    }
                                    if (customers) {
                                      res.send({ message: "Sales invoice updated" });
                                    }
                                  });
                                } else {
                                  res.send({ message: "Sales invoice updated" });
                                }
                              }
                            });
                          }
                        });
                      } else {
                        res.send({ message: "Sales invoice updated" });
                      }
                    }//update stock
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

/*
app.post("/addsales", (req, res) => {
  var q1 = "insert into mv_ms_sales(customer_id,invoice_number,sales_date,total_gst,total_discount,total_amount,payment,balance_payment,payment_status,status,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
  var values = [
    req.body.data.customer_id,
    req.body.data.invoice_number,
    req.body.data.sales_date,
    req.body.data.total_gst,
    req.body.data.total_discount,
    req.body.data.total_amount,
    req.body.data.payment,
    req.body.data.total_amount - req.body.data.payment,
    (req.body.data.total_amount > req.body.data.payment) ? 'DUE' : 'PAID',
    'CONFIRMED',
    req.body.data.txn_account_id,
    1,
    req.body.data.erp_id,
    req.body.data.user_id,
    req.body.data.erp_id
  ]
  con.query(q1, [values], (err, sales) => {
    if (err) {
      var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
      ]
      con.query(eq, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (sales) {
      var sales_id = sales.insertId;
      var q2 = "insert into mv_ms_sales_details(product_id,stock_id, serial_id, expiry_date, pack, density, quantity, mrp, gst, discount, total, sales_id,status, is_active,erp_id,created_by,last_login_id) values ?";
      let det_values = [];
      for (var i = 0; i < req.body.state.length; i++) {
        det_values.push(new Array(req.body.state[i].product_id, req.body.state[i].stock_id, req.body.state[i].serial_id, req.body.state[i].expiry_date, req.body.state[i].pack, req.body.state[i].density, req.body.state[i].sale_quantity, req.body.state[i].mrp, req.body.state[i].gst, req.body.state[i].discount, req.body.state[i].total, sales_id,'STOCKOUT', 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id));
      }
      // console.log(det_values);
      con.query(q2, [det_values], (err, sales_details) => {
        if (err) {
          var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
          ]
          con.query(eq1, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (sales_details) {
          for (var i = 0; i < req.body.state.length; i++) {
            var q3 = "UPDATE mv_ms_stocks SET quantity =quantity -'" + parseInt(req.body.state[i].sale_quantity) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' where id='" + req.body.state[i].stock_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
            con.query(q3, (err, stocks) => {
              if (err) {
                var eq2 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                var err_values = [
                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                ]
                con.query(eq2, [err_values], (er, results) => {
                  if (er) res.send({ message: er.code });
                  res.send({ message: err.code });
                });
              }
            });
          } //end for loop
          var q4 = "insert into mv_ms_transactions(actions,txn_type,txn_type_id,txn_amount,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
          var txn_values = [
            "CREDIT",
            "SALES",
            sales_id,
            req.body.data.payment,
            req.body.data.txn_account_id,
            1,
            req.body.data.erp_id,
            req.body.data.user_id,
            req.body.data.erp_id
          ]
          con.query(q4, [txn_values], (err, transactions) => {
            if (err) {
              var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
              var err_values = [
                err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
              ]
              con.query(eq3, [err_values], (er, results) => {
                if (er) res.send({ message: er.code });
                res.send({ message: err.code });
              });
            }
            if (transactions) {
              var q5 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(req.body.data.payment) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' WHERE id = '" + req.body.data.txn_account_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
              con.query(q5, (err, accounts) => {
                if (err) {
                  var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                  var err_values = [
                    err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                  ]
                  con.query(eq4, [err_values], (er, results) => {
                    if (er) res.send({ message: er.code });
                    res.send({ message: err.code });
                  });
                }
                if (accounts) {
                  var balance = req.body.data.total_amount - req.body.data.payment;
                  if (balance) {
                    var q6 = "UPDATE mv_ms_customers SET cash_in_advance= cash_in_advance - '" + parseInt(balance) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' WHERE id = '" + req.body.data.customer_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
                    con.query(q6, (err, customers) => {
                      if (err) {
                        var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                        var err_values = [
                          err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                        ]
                        con.query(eq4, [err_values], (er, results) => {
                          if (er) res.send({ message: er.code });
                          res.send({ message: err.code });
                        });
                      }
                      if (customers) {
                        res.send({ message: "New Sales invoice Created" });
                      }
                    });
                  } else {
                    res.send({ message: "New Sales invoice Created" });
                  }
                }
              });
            }
          });
        }
      });
    }
  });
});
*/

app.post("/addpos", (req, res) => {
  var q = "insert into mv_ms_sales(customer_id,invoice_number,sales_date,total_gst,total_discount,total_amount,payment,balance_payment,payment_status,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
  var values = [
    req.body.data.customer_id,
    req.body.data.invoice_number,
    req.body.data.sales_date,
    req.body.data.total_gst,
    req.body.data.total_discount,
    req.body.data.total_amount,
    req.body.data.payment,
    req.body.data.total_amount - req.body.data.payment,
    (req.body.data.total_amount > req.body.data.payment) ? 'DUE' : 'PAID',
    req.body.data.txn_account_id,
    1,
    req.body.data.erp_id,
    req.body.data.user_id,
    req.body.data.erp_id
  ]
  con.query(q, [values], (err, result) => {
    if (err) {
      var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
      ]
      con.query(eq, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (result) {
      var sales_id = result.insertId;
      var q1 = "insert into mv_ms_sales_details(product_id,stock_id, serial_id, expiry_date, pack, density, quantity, mrp, gst, discount, total, sales_id, is_active,erp_id,created_by,last_login_id) values ?";
      let det_values = [];
      for (var i = 0; i < req.body.cart.length; i++) {
        det_values.push(new Array(req.body.cart[i].product_id, req.body.cart[i].id, req.body.cart[i].serial_id, req.body.cart[i].expiry_date, 1, req.body.cart[i].density, req.body.cart[i].quantaty, req.body.cart[i].price, req.body.cart[i].gst, req.body.cart[i].discount, req.body.cart[i].totalAmount, sales_id, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id));
      }
      // console.log(det_values);
      con.query(q1, [det_values], (err, result) => {
        if (err) {
          var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
          ]
          con.query(eq1, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (result) {
          for (var i = 0; i < req.body.cart.length; i++) {
            var q2 = "UPDATE mv_ms_stocks SET quantity =quantity -'" + parseInt(req.body.cart[i].quantaty) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' where id='" + req.body.cart[i].id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
            con.query(q2, (err, result) => {
              if (err) {
                var eq2 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                var err_values = [
                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                ]
                con.query(eq2, [err_values], (er, results) => {
                  if (er) res.send({ message: er.code });
                  res.send({ message: err.code });
                });
              }
            });
          } //end for loop
          var q3 = "insert into mv_ms_transactions(actions,txn_type,txn_type_id,txn_amount,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
          var txn_values = [
            "CREDIT",
            "SALES",
            sales_id,
            req.body.data.payment,
            req.body.data.txn_account_id,
            1,
            req.body.data.erp_id,
            req.body.data.user_id,
            req.body.data.erp_id
          ]
          con.query(q3, [txn_values], (err, result) => {
            if (err) {
              var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
              var err_values = [
                err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
              ]
              con.query(eq3, [err_values], (er, results) => {
                if (er) res.send({ message: er.code });
                res.send({ message: err.code });
              });
            }
            if (result) {
              var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount + '" + parseInt(req.body.data.payment) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' WHERE id = '" + req.body.data.txn_account_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
              con.query(q4, (err, result) => {
                if (err) {
                  var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                  var err_values = [
                    err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                  ]
                  con.query(eq4, [err_values], (er, results) => {
                    if (er) res.send({ message: er.code });
                    res.send({ message: err.code });
                  });
                }
                if (result) {
                  var balance = req.body.data.total_amount - req.body.data.payment;
                  if (balance) {
                    var q4 = "UPDATE mv_ms_customers SET cash_in_advance= cash_in_advance - '" + parseInt(balance) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' WHERE id = '" + req.body.data.customer_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
                    con.query(q4, (err, result) => {
                      if (err) {
                        var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                        var err_values = [
                          err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                        ]
                        con.query(eq4, [err_values], (er, results) => {
                          if (er) res.send({ message: er.code });
                          res.send({ message: err.code });
                        });
                      }
                      if (result) {
                        res.send({ message: "New Sales invoice Created" });
                      }
                    });
                  } else {
                    res.send({ message: "New Sales invoice Created" });
                  }
                }
              });
            }
          });
        }
      });
    }
  });
});

app.get("/purchaseLov", (req, res) => {
  var q = "select id,name as label from mv_ms_products where is_active=1 and erp_id=" + req.query.erp_id;
  var q1 = "select id,concat(name,' ',contact_number) as label from mv_ms_suppliers where is_active=1 and erp_id=" + req.query.erp_id;
  var q2 = "select id as value,name as label from mv_ms_accounts where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, products) => {
    if (err) return res.json(err);
    con.query(q1, (err, suppliers) => {
      if (err) return res.json(err);
      con.query(q2, (err, accounts) => {
        if (err) return res.json(err);
        return res.json([products, suppliers, accounts]);
      });
    });
  });
});


app.get("/purchaseInv", (req, res) => {
  var q = 'SELECT count(id) as count FROM mv_ms_purchases where erp_id=' + req.query.erp_id;
  con.query(q, (err, invno) => {
    if (err) return res.json(err);
    const count = invno[0].count;
    return res.json(count);
  });
});

app.get("/salesInv", (req, res) => {
  var q = 'SELECT count(id) as count FROM mv_ms_sales where erp_id=' + req.query.erp_id;
  con.query(q, (err, invno) => {
    if (err) return res.json(err);
    const count = invno[0].count;
    return res.json(count);
  });
});

app.get("/supplier_lov", (req, res) => {
  const q = "select id,name as label from mv_ms_suppliers where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    //console.log(result);
    return res.json(result);
  });
});

app.get("/customer_lov", (req, res) => {
  const q = "select id,name as label from mv_ms_customers where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    //console.log(result);
    return res.json(result);
  });
});

app.get("/product_lov", (req, res) => {
  const q = "select id,name as label from mv_ms_products where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    //console.log(result);
    return res.json(result);
  });
});

app.get("/product_code_lov", (req, res) => {
  const q = "select id ,product_code as label ,pic,brand_name,category_name,serial_id,expiry_date,density,quantity,mrp,gst,discount,is_active FROM mv_ms_stocks_v where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    //console.log(result);
    return res.json(result);
  });
});

app.get("/productsLov", (req, res) => {
  const q = "SELECT id as value,name as label FROM mv_ms_products where erp_id=" + req.query.erp_id + "";
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    //console.log(result);
    return res.json(result);
  });
});

app.get("/appinfo", (req, res) => {
  const q = "SELECT id,email,ip_address,licence_key,expire_date,sys_email,updated_version,concat(DATEDIFF(expire_date, CURDATE()),' Days Remaining') as expired_days FROM mv_ms_logins where is_active=1 and id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    //console.log(result);
    return res.json(result);
  });
});

app.get("/erpsetting", (req, res) => {
  const q = "SELECT id,erp_txn_type,erp_unit,erp_currency,erp_sales_setting,erp_language FROM mv_ms_erp_settings where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    //console.log(result);
    return res.json(result);
  });
});

app.post("/updatesetting", (req, res) => {
  //console.log(req.body.contact_number);
  var q = "UPDATE mv_ms_erp_settings SET erp_txn_type = '" + req.body.erp_txn_type + "',erp_language='" + req.body.erp_language + "',erp_unit='" + req.body.erp_unit + "',erp_currency='" + req.body.erp_currency + "',erp_sales_setting='" + req.body.erp_sales_setting + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "',erp_purchase_setting='" + req.body.erp_purchase_setting + "' where id='" + req.body.id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    //return res.json({message:"New Customer Added"});
    if (result) res.send({ message: "Company Setting Updated" });
  });
});

app.get("/userprofile", (req, res) => {
  const q = "SELECT id,erp_title,erp_name,erp_contact,erp_address,erp_type,tin_number,gst_number,pic FROM mv_ms_profile_settings where is_active=1 and erp_id=" + req.query.erp_id;
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    //console.log(result);
    return res.json(result);
  });
});

app.post("/updateprofile", (req, res) => {
  //console.log(req.body.contact_number);
  var q = "UPDATE mv_ms_profile_settings SET erp_title = '" + req.body.erp_title + "',erp_name='" + req.body.erp_name + "',erp_contact='" + req.body.erp_contact + "',erp_address='" + req.body.erp_address + "',erp_type='" + req.body.erp_type + "',tin_number='" + req.body.tin_number + "',gst_number='" + req.body.gst_number + "',updated_by='" + req.body.user_id + "',last_login_id='" + req.body.erp_id + "',pic='" + req.body.pic + "' where id='" + req.body.id + "' and erp_id='" + req.body.erp_id + "' and is_active=1";
  con.query(q, (err, result) => {
    if (err) {
      var q1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.erp_id, req.body.user_id, req.body.erp_id
      ]
      con.query(q1, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    //return res.json({message:"New Customer Added"});
    if (result) res.send({ message: "Company Profile Updated" });
  });
});

app.post("/re_order", (req, res) => {
  var q = "insert into mv_ms_purchases(supplier_id,invoice_number,purchase_date,total_gst,total_discount,total_amount,payment,balance_payment,payment_status,status,txn_account_id,is_active,erp_id,created_by,last_login_id) SELECT supplier_id,'" + Date.now() + "',CURDATE(),total_gst,total_discount,total_amount,0,total_amount,'DUE','ORDERED',txn_account_id,1,'" + req.query.erp_id + "','" + req.query.user_id + "','" + req.query.erp_id + "' FROM mv_ms_purchases WHERE id = '" + req.query.id + "'";
  con.query(q, (err, purchases) => {
    if (err) {
      var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
      ]
      con.query(eq, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (purchases) {
      var purchase_id = purchases.insertId;
      var q1 = "insert into mv_ms_purchase_details(product_id, serial_id, expiry_date, pack, density, buy_quantity, free_quantity, mrp, rate, gst, discount, total,status, purchase_id, is_active,erp_id,created_by,last_login_id) SELECT product_id, serial_id, expiry_date, pack, density, buy_quantity, free_quantity, mrp, rate, gst, discount, total,'INORDER', '" + purchase_id + "', 1,'" + req.query.erp_id + "','" + req.query.user_id + "','" + req.query.erp_id + "' FROM mv_ms_purchase_details WHERE purchase_id = '" + req.query.id + "'";

      // console.log(det_values);
      con.query(q1, (err, purchase_details) => {
        if (err) {
          var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
          ]
          con.query(eq1, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (purchase_details) {
          res.send({ message: "New Purchase invoice Created" });
        }
      });
    }
  });
});

app.post("/confirm_stock", (req, res) => {
  var q = "UPDATE mv_ms_purchases SET status='CONFIRMED' WHERE id = '" + req.query.id + "'";
  con.query(q, (err, purchases) => {
    if (err) {
      var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
      ]
      con.query(eq, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (purchases) {
      var q1 = "UPDATE mv_ms_purchase_details SET status='INSTOCK' WHERE purchase_id = '" + req.query.id + "'";
      // console.log(det_values);
      con.query(q1, (err, purchase_details) => {
        if (err) {
          var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
          ]
          con.query(eq1, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (purchase_details) {
          var q2 = "UPDATE mv_ms_stocks INNER JOIN mv_ms_purchase_details ON (mv_ms_stocks.product_id=mv_ms_purchase_details.product_id and mv_ms_stocks.serial_id=mv_ms_purchase_details.serial_id and mv_ms_stocks.erp_id=mv_ms_purchase_details.erp_id and mv_ms_stocks.expiry_date=mv_ms_purchase_details.expiry_date and mv_ms_stocks.is_active=1 and mv_ms_purchase_details.purchase_id='" + req.query.id + "') SET mv_ms_stocks.quantity =mv_ms_stocks.quantity + mv_ms_purchase_details.buy_quantity+mv_ms_purchase_details.free_quantity,mv_ms_stocks.mrp = mv_ms_purchase_details.mrp,mv_ms_stocks.updated_by = '" + req.query.user_id + "',mv_ms_stocks.last_login_id = '" + req.query.erp_id + "'";
          // console.log(det_values);
          con.query(q2, (err, update_stocks) => {
            if (err) {
              var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
              var err_values = [
                err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
              ]
              con.query(eq1, [err_values], (er, results) => {
                if (er) res.send({ message: er.code });
                res.send({ message: err.code });
              });
            }
            if (update_stocks) {
              var q3 = "insert into mv_ms_stocks(product_id,supplier_id, serial_id, expiry_date, density,quantity, mrp, gst, discount, is_active,erp_id,created_by,last_login_id) SELECT product_id,supplier_id, serial_id, expiry_date,  density, buy_quantity + free_quantity, mrp,  gst, discount, 1,'" + req.query.erp_id + "','" + req.query.user_id + "','" + req.query.erp_id + "' FROM mv_ms_purchase_details_v WHERE (product_id, serial_id, expiry_date) NOT IN (SELECT product_id,serial_id, expiry_date FROM mv_ms_stocks) and purchase_id='" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
              // console.log(det_values);
              con.query(q3, (err, insert_stocks) => {
                if (err) {
                  var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                  var err_values = [
                    err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                  ]
                  con.query(eq1, [err_values], (er, results) => {
                    if (er) res.send({ message: er.code });
                    res.send({ message: err.code });
                  });
                }
                if (insert_stocks) {
                  res.send({ message: "Purchase Order Confirmed" });
                }
              });
            }
          });
        }
      });
    }
  });
});

app.post("/cancel_order", (req, res) => {
  var q = "UPDATE mv_ms_purchases SET status='CANCELED' WHERE id = '" + req.query.id + "'";
  con.query(q, (err, purchases) => {
    if (err) {
      var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
      ]
      con.query(eq, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (purchases) {
      var q1 = "UPDATE mv_ms_purchase_details SET status='CANCELED' WHERE purchase_id = '" + req.query.id + "'";
      // console.log(det_values);
      con.query(q1, (err, purchase_details) => {
        if (err) {
          var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
          ]
          con.query(eq1, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (purchase_details) {
          res.send({ message: "Purchase Order Canceled" });
        }
      });
    }
  });
});

app.post("/addpurchase_order", (req, res) => {
  var q = "insert into mv_ms_purchases(supplier_id,invoice_number,purchase_date,total_gst,total_discount,total_amount,payment,balance_payment,payment_status,status,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
  var values = [
    req.body.data.supplier_id,
    req.body.data.invoice_number,
    req.body.data.purchase_date,
    req.body.data.total_gst,
    req.body.data.total_discount,
    req.body.data.total_amount,
    req.body.data.payment,
    req.body.data.total_amount - req.body.data.payment,
    (req.body.data.total_amount > req.body.data.payment) ? 'DUE' : 'PAID',
    'ORDERED',
    req.body.data.txn_account_id,
    1,
    req.body.data.erp_id,
    req.body.data.user_id,
    req.body.data.erp_id
  ]
  con.query(q, [values], (err, purchases) => {
    if (err) {
      var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
      ]
      con.query(eq, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (purchases) {
      var purchase_id = purchases.insertId;
      var q1 = "insert into mv_ms_purchase_details(product_id, serial_id, expiry_date, pack, density, buy_quantity, free_quantity, mrp, rate, gst, 	gst_total,discount, discount_total,total,status, purchase_id, is_active,erp_id,created_by,last_login_id) values ?";
      let det_values = [];
      for (var i = 0; i < req.body.state.length; i++) {
        det_values.push(new Array(req.body.state[i].product_id, req.body.state[i].serial_id, req.body.state[i].expiry_date, req.body.state[i].pack, req.body.state[i].density, req.body.state[i].buy_quantity, req.body.state[i].free_quantity, req.body.state[i].mrp, req.body.state[i].rate, req.body.state[i].gst, req.body.state[i].gst_total, req.body.state[i].discount, req.body.state[i].discount_total, req.body.state[i].total, 'INORDER', purchase_id, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id));
      }
      // console.log(det_values);
      con.query(q1, [det_values], (err, purchase_details) => {
        if (err) {
          var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
          ]
          con.query(eq1, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (purchase_details) {
          if (req.body.data.payment > 0) {
            var q3 = "insert into mv_ms_transactions(actions,txn_type,txn_type_id,txn_amount,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
            var txn_values = [
              "DEBIT",
              "PURCHASE_ORDERED",
              purchase_id,
              req.body.data.payment,
              req.body.data.txn_account_id,
              1,
              req.body.data.erp_id,
              req.body.data.user_id,
              req.body.data.erp_id
            ]
            con.query(q3, [txn_values], (err, transactions) => {
              if (err) {
                var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                var err_values = [
                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                ]
                con.query(eq3, [err_values], (er, results) => {
                  if (er) res.send({ message: er.code });
                  res.send({ message: err.code });
                });
              }
              if (transactions) {
                var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount - '" + parseInt(req.body.data.payment) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' WHERE id = '" + req.body.data.txn_account_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
                con.query(q4, (err, accounts) => {
                  if (err) {
                    var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                    var err_values = [
                      err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                    ]
                    con.query(eq4, [err_values], (er, results) => {
                      if (er) res.send({ message: er.code });
                      res.send({ message: err.code });
                    });
                  }
                  if (accounts) {
                    var balance = req.body.data.total_amount - req.body.data.payment;
                    if (balance) {
                      var q4 = "UPDATE mv_ms_suppliers SET cash_in_advance= cash_in_advance + '" + parseInt(balance) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' WHERE id = '" + req.body.data.supplier_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
                      con.query(q4, (err, suppliers) => {
                        if (err) {
                          var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                          var err_values = [
                            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                          ]
                          con.query(eq4, [err_values], (er, results) => {
                            if (er) res.send({ message: er.code });
                            res.send({ message: err.code });
                          });
                        }
                        if (suppliers) {
                          res.send({ message: "New Purchase invoice Created" });
                        }
                      });
                    } else {
                      res.send({ message: "New Purchase invoice Created" });
                    }
                  }
                });
              }
            });
          } else {
            res.send({ message: "New Purchase invoice Created" });
          }
        }
      });
    }
  });
});

app.post("/addpurchases", (req, res) => {
  var q = "insert into mv_ms_purchases(supplier_id,invoice_number,purchase_date,total_gst,total_discount,total_amount,payment,balance_payment,payment_status,status,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
  var values = [
    req.body.data.supplier_id,
    req.body.data.invoice_number,
    req.body.data.purchase_date,
    req.body.data.total_gst,
    req.body.data.total_discount,
    req.body.data.total_amount,
    req.body.data.payment,
    req.body.data.total_amount - req.body.data.payment,
    (req.body.data.total_amount > req.body.data.payment) ? 'DUE' : 'PAID',
    'CONFIRMED',
    req.body.data.txn_account_id,
    1,
    req.body.data.erp_id,
    req.body.data.user_id,
    req.body.data.erp_id
  ]
  con.query(q, [values], (err, purchases) => {
    if (err) {
      var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
      ]
      con.query(eq, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (purchases) {
      var purchase_id = purchases.insertId;
      var q1 = "insert into mv_ms_purchase_details(product_id, serial_id, expiry_date, pack, density, buy_quantity, free_quantity, mrp, rate, gst, gst_total,discount, discount_total,total,status, purchase_id, is_active,erp_id,created_by,last_login_id) values ?";
      let det_values = [];
      for (var i = 0; i < req.body.state.length; i++) {
        det_values.push(new Array(req.body.state[i].product_id, req.body.state[i].serial_id, req.body.state[i].expiry_date, req.body.state[i].pack, req.body.state[i].density, req.body.state[i].buy_quantity, req.body.state[i].free_quantity, req.body.state[i].mrp, req.body.state[i].rate, req.body.state[i].gst, req.body.state[i].gst_total, req.body.state[i].discount, req.body.state[i].discount_total, req.body.state[i].total, 'INSTOCK', purchase_id, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id));
      }
      // console.log(det_values);
      con.query(q1, [det_values], (err, purchase_details) => {
        if (err) {
          var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
          ]
          con.query(eq1, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (purchase_details) {
          var q2 = "UPDATE mv_ms_stocks INNER JOIN mv_ms_purchase_details ON (mv_ms_stocks.product_id=mv_ms_purchase_details.product_id and mv_ms_stocks.serial_id=mv_ms_purchase_details.serial_id and mv_ms_stocks.erp_id=mv_ms_purchase_details.erp_id and mv_ms_stocks.expiry_date=mv_ms_purchase_details.expiry_date and mv_ms_stocks.is_active=1 and mv_ms_purchase_details.purchase_id='" + purchase_id + "') SET mv_ms_stocks.quantity =mv_ms_stocks.quantity + mv_ms_purchase_details.buy_quantity + mv_ms_purchase_details.free_quantity,mv_ms_stocks.mrp = mv_ms_purchase_details.mrp,mv_ms_stocks.updated_by = '" + req.body.data.user_id + "',mv_ms_stocks.last_login_id = '" + req.body.data.erp_id + "'";
          con.query(q2, (err, update_stocks) => {
            if (err) {
              var e_verifyquery = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
              var err_values = [
                err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
              ]
              con.query(e_verifyquery, [err_values], (er, results) => {
                if (er) res.send({ message: er.code });
                res.send({ message: err.code });
              });
            }
            if (update_stocks) {
              var q3 = "insert into mv_ms_stocks(product_id,supplier_id,serial_id,expiry_date,density,quantity,mrp,gst,discount,is_active,erp_id,created_by,last_login_id) SELECT product_id,supplier_id, serial_id, expiry_date,  density, buy_quantity + free_quantity, mrp,  gst, discount, 1,'" + req.body.data.erp_id + "','" + req.body.data.user_id + "','" + req.body.data.erp_id + "' FROM mv_ms_purchase_details_v WHERE (product_id, serial_id, expiry_date) NOT IN (SELECT product_id,serial_id, expiry_date FROM mv_ms_stocks) and purchase_id='" + purchase_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
              con.query(q3, (err, stocks) => {
                if (err) {
                  var eq2 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                  var err_values = [
                    err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                  ]
                  con.query(eq2, [err_values], (er, results) => {
                    if (er) res.send({ message: er.code });
                    res.send({ message: err.code });
                  });
                }
              });
            }
          });
          if (req.body.data.payment > 0) {
            var q4 = "insert into mv_ms_transactions(actions,txn_type,txn_type_id,txn_amount,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
            var txn_values = [
              "DEBIT",
              "PURCHASE_CONFIRMED",
              purchase_id,
              req.body.data.payment,
              req.body.data.txn_account_id,
              1,
              req.body.data.erp_id,
              req.body.data.user_id,
              req.body.data.erp_id
            ]
            con.query(q4, [txn_values], (err, transactions) => {
              if (err) {
                var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                var err_values = [
                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                ]
                con.query(eq3, [err_values], (er, results) => {
                  if (er) res.send({ message: er.code });
                  res.send({ message: err.code });
                });
              }
              if (transactions) {
                var q5 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount - '" + parseInt(req.body.data.payment) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' WHERE id = '" + req.body.data.txn_account_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
                con.query(q5, (err, accounts) => {
                  if (err) {
                    var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                    var err_values = [
                      err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                    ]
                    con.query(eq4, [err_values], (er, results) => {
                      if (er) res.send({ message: er.code });
                      res.send({ message: err.code });
                    });
                  }
                  if (accounts) {
                    var balance = req.body.data.total_amount - req.body.data.payment;
                    if (balance) {
                      var q6 = "UPDATE mv_ms_suppliers SET cash_in_advance= cash_in_advance + '" + parseInt(balance) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' WHERE id = '" + req.body.data.supplier_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
                      con.query(q6, (err, suppliers) => {
                        if (err) {
                          var eq5 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                          var err_values = [
                            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                          ]
                          con.query(eq5, [err_values], (er, results) => {
                            if (er) res.send({ message: er.code });
                            res.send({ message: err.code });
                          });
                        }
                        if (suppliers) {
                          res.send({ message: "New Purchase invoice Created" });
                        }
                      });
                    } else {
                      res.send({ message: "New Purchase invoice Created" });
                    }
                  }
                });
              }
            });
          } else {
            res.send({ message: "New Purchase invoice Created" });
          }
        }
      });
    }
  });
});

app.post("/manage_purchases_order", (req, res) => {
  let due = (req.body.data.total_amount > req.body.data.payment) ? 'DUE' : 'PAID';
  let pay_balance = req.body.data.total_amount - req.body.data.payment;
  var q = "UPDATE mv_ms_purchases SET supplier_id='" + req.body.data.supplier_id + "',invoice_number='" + req.body.data.invoice_number + "',purchase_date='" + req.body.data.purchase_date + "',total_gst='" + req.body.data.total_gst + "',total_discount='" + req.body.data.total_discount + "',total_amount='" + req.body.data.total_amount + "',payment='" + req.body.data.payment + "',balance_payment='" + pay_balance + "',payment_status='" + due + "',status='" + 'ORDERED' + "',txn_account_id='" + req.body.data.txn_account_id + "',updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q, (err, purchases) => {
    if (err) {
      var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
      ]
      con.query(eq, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (purchases) {
      var purchase_id = req.query.id;
      //  var q13 = "UPDATE table_users SET product_id = (case when id = ? then ? end),serial_id = (case when id = ? then ? end),expiry_date = (case when id = ? then ? end),pack = (case when id = ? then ? end),product_id = (case when id = ? then ? end),product_id = (case when id = ? then ? end), date = '12082014' WHERE id in (?) AND purchase_id = ?'";
      var q1 = "insert into mv_ms_purchase_details_temp(id,product_id, serial_id, expiry_date, pack, density, buy_quantity, free_quantity, mrp, rate, gst,gst_total, discount,discount_total, total,status, purchase_id, is_active,erp_id,created_by,last_login_id) values ?";
      let det_values = [];
      for (var i = 0; i < req.body.state.length; i++) {
        det_values.push(new Array(req.body.state[i].id, req.body.state[i].product_id, req.body.state[i].serial_id, req.body.state[i].expiry_date, req.body.state[i].pack, req.body.state[i].density, req.body.state[i].buy_quantity, req.body.state[i].free_quantity, req.body.state[i].mrp, req.body.state[i].rate, req.body.state[i].gst, req.body.state[i].gst_total, req.body.state[i].discount, req.body.state[i].discount_total, req.body.state[i].total, 'INSTOCK', purchase_id, 1, req.query.erp_id, req.query.user_id, req.query.erp_id));
      }
      // console.log(det_values);
      con.query(q1, [det_values], (err, purchase_details_temp) => {
        if (err) {
          var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
          ]
          con.query(eq1, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (purchase_details_temp) {
          var q2 = "UPDATE mv_ms_purchase_details INNER JOIN mv_ms_purchase_details_temp ON (mv_ms_purchase_details.id=mv_ms_purchase_details_temp.id and mv_ms_purchase_details.erp_id=mv_ms_purchase_details_temp.erp_id and mv_ms_purchase_details.purchase_id=mv_ms_purchase_details_temp.purchase_id) SET mv_ms_purchase_details.product_id =mv_ms_purchase_details_temp.product_id,mv_ms_purchase_details.serial_id = mv_ms_purchase_details_temp.serial_id,mv_ms_purchase_details.expiry_date = mv_ms_purchase_details_temp.expiry_date,mv_ms_purchase_details.pack = mv_ms_purchase_details_temp.pack,mv_ms_purchase_details.density = mv_ms_purchase_details_temp.density,mv_ms_purchase_details.buy_quantity = mv_ms_purchase_details_temp.buy_quantity,mv_ms_purchase_details.free_quantity = mv_ms_purchase_details_temp.free_quantity,mv_ms_purchase_details.mrp = mv_ms_purchase_details_temp.mrp,mv_ms_purchase_details.rate = mv_ms_purchase_details_temp.rate,mv_ms_purchase_details.gst = mv_ms_purchase_details_temp.gst,mv_ms_purchase_details.gst_total = mv_ms_purchase_details_temp.gst_total,mv_ms_purchase_details.discount = mv_ms_purchase_details_temp.discount,mv_ms_purchase_details.discount_total = mv_ms_purchase_details_temp.discount_total,mv_ms_purchase_details.total = mv_ms_purchase_details_temp.total,mv_ms_purchase_details.purchase_id =  mv_ms_purchase_details_temp.purchase_id ,mv_ms_purchase_details.is_active =  mv_ms_purchase_details_temp.is_active ,mv_ms_purchase_details.updated_by = '" + req.query.user_id + "',mv_ms_purchase_details.last_login_id = '" + req.query.erp_id + "'";
          con.query(q2, (err, update_purchase_details) => {
            if (err) {
              var e_verifyquery = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
              var err_values = [
                err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
              ]
              con.query(e_verifyquery, [err_values], (er, results) => {
                if (er) res.send({ message: er.code });
                res.send({ message: err.code });
              });
            }
            if (update_purchase_details) {
              var q3 = "insert into mv_ms_purchase_details(product_id,serial_id,expiry_date,pack,density,buy_quantity,free_quantity,mrp,rate,gst,gst_total,discount,discount_total,total,purchase_id,status,is_active,erp_id,created_by,last_login_id) SELECT product_id, serial_id,expiry_date,pack,density,buy_quantity,free_quantity,mrp,rate,gst,gst_total,discount,discount_total,total,'" + purchase_id + "',status, 1,'" + req.query.erp_id + "','" + req.query.user_id + "','" + req.query.erp_id + "' FROM mv_ms_purchase_details_temp WHERE (id,purchase_id,erp_id) NOT IN (SELECT id,purchase_id,erp_id FROM mv_ms_purchase_details) and purchase_id='" + purchase_id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
              con.query(q3, (err, insert_purchase_details) => {
                if (err) {
                  var eq2 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                  var err_values = [
                    err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                  ]
                  con.query(eq2, [err_values], (er, results) => {
                    if (er) res.send({ message: er.code });
                    res.send({ message: err.code });
                  });
                }
                if (insert_purchase_details) {
                  var q4 = "DELETE from mv_ms_purchase_details_temp where purchase_id='" + purchase_id + "' and erp_id = '" + req.query.erp_id + "'";
                  con.query(q4, (err, delete_temp) => {
                    if (err) {
                      var e_verifyquery = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                      var err_values = [
                        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                      ]
                      con.query(e_verifyquery, [err_values], (er, results) => {
                        if (er) res.send({ message: er.code });
                        res.send({ message: err.code });
                      });
                    }
                    if (delete_temp) {
                      if (req.body.data.payment > 0) {
                        var q4 = "insert into mv_ms_transactions(actions,txn_type,txn_type_id,txn_amount,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
                        var txn_values = [
                          "DEBIT",
                          "PURCHASE_CONFIRMED",
                          purchase_id,
                          req.body.data.payment,
                          req.body.data.txn_account_id,
                          1,
                          req.query.erp_id,
                          req.query.user_id,
                          req.query.erp_id
                        ]
                        con.query(q4, [txn_values], (err, transactions) => {
                          if (err) {
                            var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                            var err_values = [
                              err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                            ]
                            con.query(eq3, [err_values], (er, results) => {
                              if (er) res.send({ message: er.code });
                              res.send({ message: err.code });
                            });
                          }
                          if (transactions) {
                            var q5 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount - '" + parseInt(req.body.data.payment) + "',updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.body.data.txn_account_id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
                            con.query(q5, (err, accounts) => {
                              if (err) {
                                var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                                var err_values = [
                                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                                ]
                                con.query(eq4, [err_values], (er, results) => {
                                  if (er) res.send({ message: er.code });
                                  res.send({ message: err.code });
                                });
                              }
                              if (accounts) {
                                var balance = req.body.data.total_amount - req.body.data.payment;
                                if (balance) {
                                  var q6 = "UPDATE mv_ms_suppliers SET cash_in_advance= cash_in_advance + '" + parseInt(balance) + "',updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.body.data.supplier_id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
                                  con.query(q6, (err, suppliers) => {
                                    if (err) {
                                      var eq5 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                                      var err_values = [
                                        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                                      ]
                                      con.query(eq5, [err_values], (er, results) => {
                                        if (er) res.send({ message: er.code });
                                        res.send({ message: err.code });
                                      });
                                    }
                                    if (suppliers) {
                                      res.send({ message: "New Purchase invoice Created" });
                                    }
                                  });
                                } else {
                                  res.send({ message: "New Purchase invoice Created" });
                                }
                              }
                            });
                          }
                        });
                      } else {
                        res.send({ message: "New Purchase invoice Created" });
                      }
                    }//update stock
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

app.post("/manage_purchases", (req, res) => {
  let due = (req.body.data.total_amount > req.body.data.payment) ? 'DUE' : 'PAID';
  let pay_balance = req.body.data.total_amount - req.body.data.payment;
  var q = "UPDATE mv_ms_purchases SET supplier_id='" + req.body.data.supplier_id + "',invoice_number='" + req.body.data.invoice_number + "',purchase_date='" + req.body.data.purchase_date + "',total_gst='" + req.body.data.total_gst + "',total_discount='" + req.body.data.total_discount + "',total_amount='" + req.body.data.total_amount + "',payment='" + req.body.data.payment + "',balance_payment='" + pay_balance + "',payment_status='" + due + "',status='" + 'CONFIRMED' + "',txn_account_id='" + req.body.data.txn_account_id + "',updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.query.id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
  con.query(q, (err, purchases) => {
    if (err) {
      var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
      ]
      con.query(eq, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (purchases) {
      var purchase_id = req.query.id;
      //  var q13 = "UPDATE table_users SET product_id = (case when id = ? then ? end),serial_id = (case when id = ? then ? end),expiry_date = (case when id = ? then ? end),pack = (case when id = ? then ? end),product_id = (case when id = ? then ? end),product_id = (case when id = ? then ? end), date = '12082014' WHERE id in (?) AND purchase_id = ?'";
      var q1 = "insert into mv_ms_purchase_details_temp(id,product_id, serial_id, expiry_date, pack, density, buy_quantity, free_quantity, mrp, rate, gst,gst_total,discount,discount_total, total,status, purchase_id, is_active,erp_id,created_by,last_login_id) values ?";
      let det_values = [];
      for (var i = 0; i < req.body.state.length; i++) {
        det_values.push(new Array(req.body.state[i].id, req.body.state[i].product_id, req.body.state[i].serial_id, req.body.state[i].expiry_date, req.body.state[i].pack, req.body.state[i].density, req.body.state[i].buy_quantity, req.body.state[i].free_quantity, req.body.state[i].mrp, req.body.state[i].rate, req.body.state[i].gst, req.body.state[i].gst_total, req.body.state[i].discount, req.body.state[i].discount_total, req.body.state[i].total, 'INSTOCK', purchase_id, 1, req.query.erp_id, req.query.user_id, req.query.erp_id));
      }
      // console.log(det_values);
      con.query(q1, [det_values], (err, purchase_details_temp) => {
        if (err) {
          var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
          ]
          con.query(eq1, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (purchase_details_temp) {
          var q2 = "UPDATE mv_ms_purchase_details INNER JOIN mv_ms_purchase_details_temp ON (mv_ms_purchase_details.id=mv_ms_purchase_details_temp.id and mv_ms_purchase_details.erp_id=mv_ms_purchase_details_temp.erp_id and mv_ms_purchase_details.is_active=1 and mv_ms_purchase_details.purchase_id=mv_ms_purchase_details_temp.purchase_id) SET mv_ms_purchase_details.product_id =mv_ms_purchase_details_temp.product_id,mv_ms_purchase_details.serial_id = mv_ms_purchase_details_temp.serial_id,mv_ms_purchase_details.expiry_date = mv_ms_purchase_details_temp.expiry_date,mv_ms_purchase_details.pack = mv_ms_purchase_details_temp.pack,mv_ms_purchase_details.density = mv_ms_purchase_details_temp.density,mv_ms_purchase_details.buy_quantity = mv_ms_purchase_details_temp.buy_quantity,mv_ms_purchase_details.free_quantity = mv_ms_purchase_details_temp.free_quantity,mv_ms_purchase_details.mrp = mv_ms_purchase_details_temp.mrp,mv_ms_purchase_details.rate = mv_ms_purchase_details_temp.rate,mv_ms_purchase_details.gst = mv_ms_purchase_details_temp.gst,mv_ms_purchase_details.gst_total = mv_ms_purchase_details_temp.gst_total,mv_ms_purchase_details.discount = mv_ms_purchase_details_temp.discount,mv_ms_purchase_details.discount_total = mv_ms_purchase_details_temp.discount_total,mv_ms_purchase_details.total = mv_ms_purchase_details_temp.total,mv_ms_purchase_details.purchase_id =  '" + purchase_id + "',mv_ms_purchase_details.is_active =  mv_ms_purchase_details_temp.is_active ,mv_ms_purchase_details.updated_by = '" + req.query.user_id + "',mv_ms_purchase_details.last_login_id = '" + req.query.erp_id + "'";
          con.query(q2, (err, update_purchase_details) => {
            if (err) {
              var e_verifyquery = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
              var err_values = [
                err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
              ]
              con.query(e_verifyquery, [err_values], (er, results) => {
                if (er) res.send({ message: er.code });
                res.send({ message: err.code });
              });
            }
            if (update_purchase_details) {
              var q3 = "insert into mv_ms_purchase_details(product_id,serial_id,expiry_date,pack,density,buy_quantity,free_quantity,mrp,rate,gst,gst_total,discount,discount_total,total,purchase_id,status,is_active,erp_id,created_by,last_login_id) SELECT product_id, serial_id,expiry_date,pack,density,buy_quantity,free_quantity,mrp,rate,gst,gst_total,discount,discount_total,total,'" + purchase_id + "',status, 1,'" + req.query.erp_id + "','" + req.query.user_id + "','" + req.query.erp_id + "' FROM mv_ms_purchase_details_temp WHERE (id,purchase_id,erp_id) NOT IN (SELECT id,purchase_id,erp_id FROM mv_ms_purchase_details) and purchase_id='" + purchase_id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
              con.query(q3, (err, insert_purchase_details) => {
                if (err) {
                  var eq2 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                  var err_values = [
                    err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                  ]
                  con.query(eq2, [err_values], (er, results) => {
                    if (er) res.send({ message: er.code });
                    res.send({ message: err.code });
                  });
                }
                if (insert_purchase_details) {
                  var q4 = "DELETE from mv_ms_purchase_details_temp where purchase_id='" + purchase_id + "' and erp_id = '" + req.query.erp_id + "'";
                  con.query(q4, (err, delete_temp) => {
                    if (err) {
                      var e_verifyquery = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                      var err_values = [
                        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                      ]
                      con.query(e_verifyquery, [err_values], (er, results) => {
                        if (er) res.send({ message: er.code });
                        res.send({ message: err.code });
                      });
                    }
                    if (delete_temp) {
                      var q4 = "UPDATE mv_ms_stocks INNER JOIN mv_ms_purchase_details ON (mv_ms_stocks.product_id=mv_ms_purchase_details.product_id and mv_ms_stocks.serial_id=mv_ms_purchase_details.serial_id and mv_ms_stocks.erp_id=mv_ms_purchase_details.erp_id and mv_ms_stocks.expiry_date=mv_ms_purchase_details.expiry_date and mv_ms_stocks.is_active=1 and mv_ms_purchase_details.purchase_id='" + purchase_id + "') SET mv_ms_stocks.quantity =mv_ms_stocks.quantity + mv_ms_purchase_details.buy_quantity + mv_ms_purchase_details.free_quantity,mv_ms_stocks.mrp = mv_ms_purchase_details.mrp,mv_ms_stocks.updated_by = '" + req.query.user_id + "',mv_ms_stocks.last_login_id = '" + req.query.erp_id + "'";
                      con.query(q4, (err, update_stocks) => {
                        if (err) {
                          var e_verifyquery = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                          var err_values = [
                            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                          ]
                          con.query(e_verifyquery, [err_values], (er, results) => {
                            if (er) res.send({ message: er.code });
                            res.send({ message: err.code });
                          });
                        }
                        if (update_stocks) {
                          var q3 = "insert into mv_ms_stocks(product_id,supplier_id,serial_id,expiry_date,density,quantity,mrp,gst,discount,is_active,erp_id,created_by,last_login_id) SELECT product_id,supplier_id, serial_id, expiry_date,  density, buy_quantity + free_quantity, mrp,  gst, discount, 1,'" + req.query.erp_id + "','" + req.query.user_id + "','" + req.query.erp_id + "' FROM mv_ms_purchase_details_v WHERE (product_id, serial_id, expiry_date) NOT IN (SELECT product_id,serial_id, expiry_date FROM mv_ms_stocks) and purchase_id='" + purchase_id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
                          con.query(q3, (err, stocks) => {
                            if (err) {
                              var eq2 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                              var err_values = [
                                err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                              ]
                              con.query(eq2, [err_values], (er, results) => {
                                if (er) res.send({ message: er.code });
                                res.send({ message: err.code });
                              });
                            }
                          });
                        }
                      });
                      if (req.body.data.payment > 0) {
                        var q4 = "insert into mv_ms_transactions(actions,txn_type,txn_type_id,txn_amount,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
                        var txn_values = [
                          "DEBIT",
                          "PURCHASE_CONFIRMED",
                          purchase_id,
                          req.body.data.payment,
                          req.body.data.txn_account_id,
                          1,
                          req.query.erp_id,
                          req.query.user_id,
                          req.query.erp_id
                        ]
                        con.query(q4, [txn_values], (err, transactions) => {
                          if (err) {
                            var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                            var err_values = [
                              err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                            ]
                            con.query(eq3, [err_values], (er, results) => {
                              if (er) res.send({ message: er.code });
                              res.send({ message: err.code });
                            });
                          }
                          if (transactions) {
                            var q5 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount - '" + parseInt(req.body.data.payment) + "',updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.body.data.txn_account_id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
                            con.query(q5, (err, accounts) => {
                              if (err) {
                                var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                                var err_values = [
                                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                                ]
                                con.query(eq4, [err_values], (er, results) => {
                                  if (er) res.send({ message: er.code });
                                  res.send({ message: err.code });
                                });
                              }
                              if (accounts) {
                                var balance = req.body.data.total_amount - req.body.data.payment;
                                if (balance) {
                                  var q6 = "UPDATE mv_ms_suppliers SET cash_in_advance= cash_in_advance + '" + parseInt(balance) + "',updated_by='" + req.query.user_id + "',last_login_id='" + req.query.erp_id + "' WHERE id = '" + req.body.data.supplier_id + "' and erp_id='" + req.query.erp_id + "' and is_active=1";
                                  con.query(q6, (err, suppliers) => {
                                    if (err) {
                                      var eq5 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                                      var err_values = [
                                        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.query.erp_id, req.query.user_id, req.query.erp_id
                                      ]
                                      con.query(eq5, [err_values], (er, results) => {
                                        if (er) res.send({ message: er.code });
                                        res.send({ message: err.code });
                                      });
                                    }
                                    if (suppliers) {
                                      res.send({ message: "New Purchase invoice Created" });
                                    }
                                  });
                                } else {
                                  res.send({ message: "New Purchase invoice Created" });
                                }
                              }
                            });
                          }
                        });
                      } else {
                        res.send({ message: "New Purchase invoice Created" });
                      }
                    }//update stock
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

/*
app.post("/addpurchases", (req, res) => {
  var q = "insert into mv_ms_purchases(supplier_id,invoice_number,purchase_date,total_gst,total_discount,total_amount,payment,balance_payment,payment_status,status,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
  var values = [
    req.body.data.supplier_id,
    req.body.data.invoice_number,
    req.body.data.purchase_date,
    req.body.data.total_gst,
    req.body.data.total_discount,
    req.body.data.total_amount,
    req.body.data.payment,
    req.body.data.total_amount - req.body.data.payment,
    (req.body.data.total_amount > req.body.data.payment) ? 'DUE' : 'PAID',
    'CONFIRMED',
    req.body.data.txn_account_id,
    1,
    req.body.data.erp_id,
    req.body.data.user_id,
    req.body.data.erp_id
  ]
  con.query(q, [values], (err, purchases) => {
    if (err) {
      var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
      var err_values = [
        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
      ]
      con.query(eq, [err_values], (er, results) => {
        if (er) res.send({ message: er.code }); //console.log(er.code);
        /// console.log(results.code);
        res.send({ message: err.code });
      });
    } // console.log(err.code);
    if (purchases) {
      var purchase_id = purchases.insertId;
      var q1 = "insert into mv_ms_purchase_details(product_id, serial_id, expiry_date, pack, density, buy_quantity, free_quantity, mrp, rate, gst, discount, total,status, purchase_id, is_active,erp_id,created_by,last_login_id) values ?";
      let det_values = [];
      for (var i = 0; i < req.body.state.length; i++) {
        det_values.push(new Array(req.body.state[i].product_id, req.body.state[i].serial_id, req.body.state[i].expiry_date, req.body.state[i].pack, req.body.state[i].density, req.body.state[i].buy_quantity, req.body.state[i].free_quantity, req.body.state[i].mrp, req.body.state[i].rate, req.body.state[i].gst, req.body.state[i].discount, req.body.state[i].total, 'INSTOCK', purchase_id, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id));
      }
      // console.log(det_values);
      con.query(q1, [det_values], (err, purchase_details) => {
        if (err) {
          var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
          ]
          con.query(eq1, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (purchase_details) {
          for (var i = 0; i < req.body.state.length; i++) {
            const verifyquery = "SELECT id FROM mv_ms_stocks where product_id='" + req.body.state[i].product_id + "' and serial_id='" + req.body.state[i].serial_id + "' and expiry_date='" + req.body.state[i].expiry_date + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
            var tVal = i;
            (function (j) {
              con.query(verifyquery, (err, verify_stocks) => {
                if (err) {
                  var e_verifyquery = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                  var err_values = [
                    err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                  ]
                  con.query(e_verifyquery, [err_values], (er, results) => {
                    if (er) res.send({ message: er.code });
                    res.send({ message: err.code });
                  });
                }
                if (!verify_stocks || verify_stocks.length < 1 || !verify_stocks[0].id) {
                  var q2 = "insert into mv_ms_stocks(product_id,supplier_id,serial_id,expiry_date,density,quantity,mrp,gst,discount,is_active,erp_id,created_by,last_login_id) values (?)";
                  var stock_values = [
                    req.body.state[j].product_id,
                    req.body.data.supplier_id,
                    req.body.state[j].serial_id,
                    req.body.state[j].expiry_date,
                    req.body.state[j].density,
                    parseInt(req.body.state[j].buy_quantity) + parseInt(req.body.state[j].free_quantity),
                    req.body.state[j].mrp,
                    req.body.state[j].gst,
                    req.body.state[j].discount,
                    1,
                    req.body.data.erp_id,
                    req.body.data.user_id,
                    req.body.data.erp_id
                  ]
                  con.query(q2, [stock_values], (err, stocks) => {
                    if (err) {
                      var eq2 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                      var err_values = [
                        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                      ]
                      con.query(eq2, [err_values], (er, results) => {
                        if (er) res.send({ message: er.code });
                        res.send({ message: err.code });
                      });
                    }
                  });
                } else {
                  var q2 = "UPDATE mv_ms_stocks SET quantity =quantity +'" + parseInt(req.body.state[j].buy_quantity) + parseInt(req.body.state[j].free_quantity) + "',mrp='" + req.body.state[j].mrp + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' where product_id='" + req.body.state[j].product_id + "' and serial_id='" + req.body.state[j].serial_id + "' and erp_id='" + req.body.data.erp_id + "' and expiry_date='" + req.body.state[j].expiry_date + "' and is_active=1";
                  con.query(q2, (err, stocks) => {
                    if (err) {
                      var eq2 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                      var err_values = [
                        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                      ]
                      con.query(eq2, [err_values], (er, results3) => {
                        if (er) res.send({ message: er.code });
                        res.send({ message: err.code });
                      });
                    }
                  });
                }
              });
            })(tVal);
          } //end for loop
          if (req.body.data.payment > 0) {
            var q3 = "insert into mv_ms_transactions(actions,txn_type,txn_type_id,txn_amount,txn_account_id,is_active,erp_id,created_by,last_login_id) values (?)";
            var txn_values = [
              "DEBIT",
              "PURCHASE_CONFIRMED",
              purchase_id,
              req.body.data.payment,
              req.body.data.txn_account_id,
              1,
              req.body.data.erp_id,
              req.body.data.user_id,
              req.body.data.erp_id
            ]
            con.query(q3, [txn_values], (err, transactions) => {
              if (err) {
                var eq3 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                var err_values = [
                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                ]
                con.query(eq3, [err_values], (er, results) => {
                  if (er) res.send({ message: er.code });
                  res.send({ message: err.code });
                });
              }
              if (transactions) {
                var q4 = "UPDATE mv_ms_accounts SET avl_amount= avl_amount - '" + parseInt(req.body.data.payment) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' WHERE id = '" + req.body.data.txn_account_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
                con.query(q4, (err, accounts) => {
                  if (err) {
                    var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                    var err_values = [
                      err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                    ]
                    con.query(eq4, [err_values], (er, results) => {
                      if (er) res.send({ message: er.code });
                      res.send({ message: err.code });
                    });
                  }
                  if (accounts) {
                    var balance = req.body.data.total_amount - req.body.data.payment;
                    if (balance) {
                      var q4 = "UPDATE mv_ms_suppliers SET cash_in_advance= cash_in_advance + '" + parseInt(balance) + "',updated_by='" + req.body.data.user_id + "',last_login_id='" + req.body.data.erp_id + "' WHERE id = '" + req.body.data.supplier_id + "' and erp_id='" + req.body.data.erp_id + "' and is_active=1";
                      con.query(q4, (err, suppliers) => {
                        if (err) {
                          var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                          var err_values = [
                            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, req.body.data.erp_id, req.body.data.user_id, req.body.data.erp_id
                          ]
                          con.query(eq4, [err_values], (er, results) => {
                            if (er) res.send({ message: er.code });
                            res.send({ message: err.code });
                          });
                        }
                        if (suppliers) {
                          res.send({ message: "New Purchase invoice Created" });
                        }
                      });
                    } else {
                      res.send({ message: "New Purchase invoice Created" });
                    }
                  }
                });
              }
            });
          } else {
            res.send({ message: "New Purchase invoice Created" });
          }
        }
      });
    }
  });
});  */

app.get("/supplierLov", (req, res) => {
  const q = "SELECT id as value,name as label FROM mv_ms_suppliers where erp_id=" + req.query.erp_id + " order by id desc limit 1";
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    //console.log(result);
    return res.json(result);
  });
});

app.get("/customerLov", (req, res) => {
  const q = "SELECT id as value,name as label FROM mv_ms_customers where erp_id=" + req.query.erp_id + " order by id desc limit 1";
  con.query(q, (err, result) => {
    if (err) return res.json(err);
    //console.log(result);
    return res.json(result);
  });
});

app.post("/purases", (req, res) => {
  var q = "insert into stdd(id, name) values ?";
  var values = [
    [2, 'Mohammed'],
    [3, 'Great'],
    [4, 'Maya'],
    [5, 'Ratchu']
  ]
  con.query(q, [values], (err, result) => {
    if (err) return res.json(err);
    return res.json("rows inserted");
  });
});

app.post("/reg", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log(username);
  bcrypt.hash(password, saltRounds, (error, hash) => {
    if (error) {
      console.log(error);
    }

    con.query(
      "INSERT INTO mv_res_users (user_name, password) VALUES (?,?)",
      [username, hash],
      (err, result) => {
        if (err) {
          res.send({ err: err });
        }
        if (result) {
          // res.send(result);
          res.send({ message: "done" })
          // console.log(result);
        } else {
          res.send({ message: "Invalid data" })
        }
      }
    );
  });
});


function randomValueHex(len) {
  return crypto.randomBytes(Math.ceil(len / 2))
    .toString('hex') // convert to hexadecimal format
    .slice(0, len).toUpperCase();   // return required number of characters
}

app.post("/signup", (req, res) => {

  var licenceKey = randomValueHex(4) + "-" + randomValueHex(4) + "-" + randomValueHex(4) + "-" + randomValueHex(4);
  var tokenKey = randomValueHex(12);
  var date = new Date();
  var expireDate = date.setDate(date.getDate() + 6);
  var pwd = randomValueHex(saltRounds);
  var usrStr = req.body.email;
  var usrName = usrStr.replace(/\@[^@]+$/, '');
  var mailText = "Hello " + usrName + ",\n" + "\t Welcome to Ratchus Business Applications, \n Your temporary userName/Password : " + usrName + "/" + pwd + "\n You can login your ratchu account via this username and password";
  let mailOptions = {
    from: "donotreply@ratchu.com",
    to: req.body.email,
    subject: "Temporary UserName and Password Created from Ratchus",
    text: mailText
  }

  transpoter.sendMail(mailOptions, function (err, success) {
    if (err) {
      res.send({ message: err });
    }
    if (success) {
      var q1 = "insert into mv_ms_logins(email,ip_address,licence_key,expire_date,updated_version,sys_email,api_key,key_token,is_active,created_by,last_login_id) values (?)";
      var values = [
        req.body.email,
        req.body.IPv4,
        licenceKey,
        expireDate,
        appVersion,
        sysEmail,
        appKey,
        tokenKey,
        1,
        1,
        1
      ]
      con.query(q1, [values], (err, result) => {
        if (err) {
          var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
          var err_values = [
            err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, 1, 1, 1
          ]
          con.query(eq4, [err_values], (er, results) => {
            if (er) res.send({ message: er.code });
            res.send({ message: err.code });
          });
        }
        if (result) {
          var erp_id = result.insertId;
          console.log(erp_id);
          var q2 = "insert into mv_ms_web_viewers(country_code,country_name,city,postal,latitude,longitude,IPv4,state,email,is_active,erp_id,created_by,last_login_id) values (?)";
          var pc_values = [
            req.body.country_code,
            req.body.country_name,
            req.body.city,
            req.body.postal,
            req.body.latitude,
            req.body.longitude,
            req.body.IPv4,
            req.body.state,
            req.body.email,
            1,
            erp_id,
            1,
            erp_id
          ]
          con.query(q2, [pc_values], (err, pc_result) => {
            if (err) {
              var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
              var err_values = [
                err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, 1, 1, 1
              ]
              con.query(eq4, [err_values], (er, results) => {
                if (er) res.send({ message: er.code });
                res.send({ message: err.code });
              });
            }
            if (pc_result) {
              bcrypt.hash(pwd, saltRounds, (error, hash) => {
                if (error) {
                  res.send({ message: error })
                }
                if (hash) {
                  var q3 = "insert into mv_ms_login_users(user_name,password,user_type,user_access,pc_address,user_token,is_logged_in,is_active,erp_id,created_by,last_login_id) values (?)";
                  var usr_values = [
                    usrName,
                    hash,
                    1,
                    1,
                    req.body.IPv4,
                    tokenKey,
                    0,
                    1,
                    erp_id,
                    1,
                    erp_id
                  ]
                  con.query(q3, [usr_values], (err, usr_result) => {
                    if (err) {
                      var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                      var err_values = [
                        err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, 1, 1, 1
                      ]
                      con.query(eq4, [err_values], (er, results) => {
                        if (er) res.send({ message: er.code });
                        res.send({ message: err.code });
                      });
                    }
                    if (usr_result) {
                      res.send({ message: "Please Check your Email for UserName and Password" })
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});



app.post("/login", (req, res) => {
  const ipv_id = '106.217.13.2';
  //console.log(ipv_id);
  con.query(
    "select id,email,expire_date,ip_address,key_token,DATEDIFF(expire_date, CURDATE()) as expire_days,pic,erp_txn_type,erp_unit,erp_currency,erp_sales_setting,erp_purchase_setting,erp_language,erp_type,erp_title,erp_contact,erp_address,gst_number from mv_ms_logins_v where is_active=1 and ip_address = ?",
    [ipv_id],
    (err, erp) => {
      if (err) {
        var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
        var err_values = [
          err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, 1, 1, 1
        ]
        con.query(eq, [err_values], (er, results) => {
          if (er) res.send({ message: er.code });
          res.send({ message: err.code });
        });
        //  console.log(password);
      }
      if (erp.length > 0) {
        if (erp[0].expire_days > 0) {
          con.query(
            "select id,user_name,password,user_type,user_access,erp_id from mv_ms_login_users where is_active=1 and user_name = '" + req.body.username + "' and erp_id='" + erp[0].id + "'",
            (err, usr) => {
              if (err) {
                var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                var err_values = [
                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, erp[0].id, 1, erp[0].id
                ]
                con.query(eq1, [err_values], (er, results) => {
                  if (er) res.send({ message: er.code });
                  res.send({ message: err.code });
                });
              }
              if (usr.length > 0) {
                bcrypt.compare(req.body.password, usr[0].password, function (err, resul) {
                  if (resul) {
                    var updq = "UPDATE mv_ms_login_users SET is_logged_in= 1,pc_address='" + erp[0].ip_address + "', user_token='" + erp[0].key_token + "' WHERE id = '" + usr[0].id + "'";
                    con.query(updq, (err, result) => {
                      if (err) {
                        var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                        var err_values = [
                          err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, erp[0].id, 1, erp[0].id
                        ]
                        con.query(eq4, [err_values], (er, results) => {
                          if (er) res.send({ message: er.code });
                          res.send({ message: err.code });
                        });
                      }
                      if (result) {
                        return res.json([erp, usr]);
                      }
                    });

                  } else {
                    res.send({ message: "Wrong password" });
                  }
                });
              } else {
                res.send({ message: "User Not available in you PC ip" });
              }
            });
        } else {
          res.send({ message: "Your PC software expired" });
        }
      } else {
        res.send({ message: "Your PC not registered" });
      }
    });

});

app.post("/user_login", (req, res) => {
  con.query(
    "select id,email,expire_date,ip_address,key_token,DATEDIFF(expire_date, CURDATE()) as expire_days,pic,erp_txn_type,erp_unit,erp_currency,erp_sales_setting,erp_purchase_setting,erp_language,erp_type,erp_title from mv_ms_logins_v where is_active=1 and ip_address = ?",
    [req.body.IPv4],
    (err, erp) => {
      if (err) {
        var eq = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
        var err_values = [
          err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, 1, 1, 1
        ]
        con.query(eq, [err_values], (er, results) => {
          if (er) res.send({ message: er.code });
          res.send({ message: err.code });
        });
        //  console.log(password);
      }
      if (erp.length > 0) {
        if (erp[0].expire_days > 0) {
          con.query(
            "select id,user_name,password,user_type,erp_id from mv_ms_login_users where is_active=1 and user_name = '" + req.body.username + "' and erp_id='" + erp[0].id + "'",
            (err, usr) => {
              if (err) {
                var eq1 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                var err_values = [
                  err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, erp[0].id, 1, erp[0].id
                ]
                con.query(eq1, [err_values], (er, results) => {
                  if (er) res.send({ message: er.code });
                  res.send({ message: err.code });
                });
              }
              if (usr.length > 0) {
                bcrypt.compare(req.body.password, usr[0].password, function (err, resul) {
                  if (resul) {
                    var updq = "UPDATE mv_ms_login_users SET is_logged_in= 1,pc_address='" + erp[0].ip_address + "', user_token='" + erp[0].key_token + "' WHERE id = '" + usr[0].id + "'";
                    con.query(updq, (err, result) => {
                      if (err) {
                        var eq4 = "insert into mv_ms_logs(err_code,err_number,message,err_state,err_index,err_details,is_active,erp_id,created_by,last_login_id) values (?)";
                        var err_values = [
                          err.code, err.errno, err.sqlMessage, err.sqlState, err.index, err.sql, 1, erp[0].id, 1, erp[0].id
                        ]
                        con.query(eq4, [err_values], (er, results) => {
                          if (er) res.send({ message: er.code });
                          res.send({ message: err.code });
                        });
                      }
                      if (result) {
                        return res.json([erp, usr]);
                      }
                    });

                  } else {
                    res.send({ message: "Wrong password" });
                  }
                });
              } else {
                res.send({ message: "User Not available in you PC ip" });
              }
            });
        } else {
          res.send({ message: "Your PC software expired" });
        }
      } else {
        res.send({ message: "Your PC not registered" });
      }
    });

});

app.get("/", (req, res) => {
  /* if (req.session.user) {
     res.send({ loggedIn: true, user: req.session.user });
   } else {
     res.send({ loggedIn: false });
   } */

  const q = "select * from mv_ms_categories where is_active=1";
  con.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  })
});

/*
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.query(
    "SELECT * FROM users WHERE username = ?;",
    username,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            req.session.user = result;
            console.log(req.session.user);
            res.send(result);
          } else {
            res.send({ message: "Wrong username/password combination!" });
          }
        });
      } else {
        res.send({ message: "User doesn't exist" });
      }
    }
  );
}); */


app.listen(PORT, function (error) {
  if (error) throw error
  console.log("Server created Successfully on PORT", PORT);
});

module.exports = con;