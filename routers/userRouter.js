const express = require('express');
const UserRouter = express.Router();
const dateFormat = require('dateformat');
const bcrypt = require('bcrypt');
const { F_Select, F_Insert, F_Delete } = require('../modules/MasterModule');

UserRouter.post('/', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var data = req.body;
    var table_name = 'md_user',
        fields = data.id > 0 ? `name = "${data.custName}", country_id = "${data.country}", city = "${data.city}", state = "${data.state}", zip_code = "${data.zip}", address = "${data.address}", modified_by = "${data.custName}", modified_dt = "${datetime}"` :
            '(name, email, phone_no, country_id, city, state, zip_code, address, created_by, created_dt)',
        values = `("${data.custName}", "${data.email}", "${data.phone}", "${data.country}", "${data.city}", "${data.state}", "${data.zip}", "${data.address}", "${data.custName}", "${datetime}")`,
        whr = `id = ${data.id}`,
        flag = data.id > 0 ? 1 : 0;
    var dt = await F_Insert(table_name, fields, values, whr, flag);
    if (dt.suc > 0 && data.id <= 0) {
        var pass = bcrypt.hashSync("123", 10);
        var log_table_name = 'md_user_login',
            log_fields = '(user_id, user_name, password, created_by, created_dt)',
            log_values = `("${dt.res.insertId}", "${data.email}", "${pass}", "${data.custName}", "${datetime}")`,
            log_whr = `id = ${data.id}`,
            log_flag = 0;
        var log_dt = await F_Insert(log_table_name, log_fields, log_values, log_whr, log_flag);
    }
    res.send(dt)
})

UserRouter.post('/registration', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var data = req.body;
    var table_name = 'md_user',
        fields = data.id > 0 ? `name = "${data.name}", email = "${data.email}", phone_no = "${data.phone}", modified_by = "${data.name}", modified_dt = "${datetime}"` :
            '(name, email, phone_no, created_by, created_dt)',
        values = `("${data.name}", "${data.email}", "${data.phone}", "${data.name}", "${datetime}")`,
        whr = `id = ${data.id}`,
        flag = data.id > 0 ? 1 : 0;
    var dt = await F_Insert(table_name, fields, values, whr, flag);
    if (dt.suc > 0) {
        var pass = data.password ? bcrypt.hashSync(data.password, 10) : bcrypt.hashSync('123', 10);
        var log_table_name = 'md_user_login',
            log_fields = '(user_id, user_name, password, created_by, created_dt)',
            log_values = `("${dt.res.insertId}", "${data.email}", "${pass}", "${data.name}", "${datetime}")`,
            log_whr = `id = ${data.id}`,
            log_flag = 0;
        var log_dt = await F_Insert(log_table_name, log_fields, log_values, log_whr, log_flag);
    }
    res.send(dt)
})

UserRouter.post('/login', async (req, res) => {
    var res_dt = '';
    var data = req.body,
        table_name = 'md_user_login a, md_user b',
        select = 'a.id, b.id userId, a.user_name email, a.password, b.name, b.phone_no, b.country_id, b.city, b.state, b.zip_code, b.address',
        whr = `a.user_id=b.id AND user_name = "${data.email}"`;
    var dt = await F_Select(select, table_name, whr, null);
    if (dt.msg.length > 0) {
        var db_pass = dt.msg[0].password;
        if (await bcrypt.compare(data.password, db_pass)) {
            var status = 'Login';
            // var userUpdate = await UpdateUserStatus(dt.msg[0].employee_id, data.email, 'L');
            // if (await UpdateUserLog(data.email, status)) {
            res_dt = { suc: 1, msg: dt.msg };
            res.send(res_dt)
            // } else {
            //     res_dt = { suc: 0, msg: "Something Went Wrong" }
            // }

        } else {
            res_dt = { suc: 0, msg: "Please Check Your User ID or Password" };
            res.send(res_dt)
        }
    } else {
        res_dt = { suc: 0, msg: "User Does Not Exist" }
        res.send(res_dt)
    }
    //res.send(res_dt)
})

UserRouter.get('/details', async (req, res) => {
    var id = req.query.id,
        table_name = 'md_user',
        select = 'id, name, email, phone_no, country_id, city, state, zip_code, address',
        whr = `id = "${id}"`;
    var dt = await F_Select(select, table_name, whr, null);
    res.send(dt)
})

UserRouter.get('/orderHistory', async (req, res) => {
    var data = req.query,
        res_dt = '',
        prod = new Array();
    var user_id = data.user_id,
        table_name = 'td_prod_trans',
        select = `DISTINCT DATE_FORMAT(trans_dt, '%Y-%m-%d') trans_dt`,
        whr = `user_id = ${user_id} AND in_out_flag = -1`;
    var dt = await F_Select(select, table_name, whr, null);
    if (dt.msg.length > 0) {
        for (let i = 0; i < dt.msg.length; i++) {
            let tb_name = `td_prod_trans a, md_product b, td_transaction c`,
                tb_select = `a.trans_dt, a.trans_no, a.user_id, a.prod_id id, b.prod_name, b.hsn_code, a.qty, a.price, c.tnx_id, ROUND((c.amount/100), 2) amount, c.method, c.status`,
                tb_whr = `a.prod_id=b.id AND a.trans_no=c.tnx_id AND user_id = ${user_id} AND in_out_flag = -1 AND trans_dt = "${dt.msg[i].trans_dt}"`;
            let prod_dt = await F_Select(tb_select, tb_name, tb_whr, null);
            if (prod_dt.msg.length > 0) {
                prod.push({ tnx_date: dt.msg[i].trans_dt, data: prod_dt.msg })
            }
        }
        res_dt = dt.suc > 0 ? { suc: 1, msg: prod } : dt
    } else {
        res_dt = { suc: 1, msg: [] };
    }
    res.send(res_dt)
})

UserRouter.post('/changePassword', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var res_dt = '';
    var data = req.body,
        table_name = 'md_user_login',
        select = 'id, password',
        whr = `user_name = "${data.email}"`;
    var dt = await F_Select(select, table_name, whr, null);
    if (dt.msg.length > 0) {
        var db_pass = dt.msg[0].password;

        if (await bcrypt.compare(data.currentPassword, db_pass)) {
            var pass = data.newPassword ? bcrypt.hashSync(data.newPassword, 10) : bcrypt.hashSync('123', 10);

            var in_table_name = 'md_user_login',
                in_fields = `password = "${pass}", modified_by = "${data.email}", modified_dt = "${datetime}"`,
                in_values = null,
                in_whr = `id = ${dt.msg[0].id}`,
                in_flag = 1;
            res_dt = await F_Insert(in_table_name, in_fields, in_values, in_whr, in_flag);
        } else {
            res_dt = { suc: 0, msg: "Please Check Your Old Password" };
        }
    } else {
        res_dt = { suc: 0, msg: "User Does Not Exist" }
    }
    res.send(res_dt)
})

UserRouter.post('/changeName', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var data = req.body;
    var in_table_name = 'md_user',
        in_fields = `name = "${data.name}", modified_by = "${data.email}", modified_dt = "${datetime}"`,
        in_values = null,
        in_whr = `id = ${data.id}`,
        in_flag = 1;
    var res_dt = await F_Insert(in_table_name, in_fields, in_values, in_whr, in_flag);
    res.send(res_dt)
})

module.exports = { UserRouter }