const express = require('express');
const CheckOutRouter = express.Router();
const dateFormat = require('dateformat');
const bcrypt = require('bcrypt');
const { F_Select, F_Insert, F_Delete, LastId } = require('../modules/MasterModule');

CheckOutRouter.post('/', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
        date = dateFormat(new Date(), "yyyy-mm-dd"),
        curr_date = dateFormat(new Date(), "ddmmyyyy");
    var data = req.body;
    var lastId = await LastId('td_prod_trans');
    // console.log(tnx_no);
    var table_name, fields, values, whr, flag, dt = '', insert_res;
    for (let i = 0; i < data.prod_list.length; i++) {
        // let tnx_no = 'TNX' + curr_date + lastId;
        let tnx_no = data.trans_no;
        // console.log(tnx_no);
        table_name = 'td_prod_trans';
        fields = '(trans_dt, trans_no, user_id, prod_id, qty, delivery_charge, price, in_out_flag, created_by, created_dt)';
        values = `("${date}", "${tnx_no}", "${data.user_id}", "${data.prod_list[i].id}", "${data.prod_list[i].cartCount}", "${data.delivery_charge}", "${data.prod_list[i].cartCount * data.prod_list[i].offer_price}", "${data.flag}", "${data.user}", "${datetime}")`;
        whr = null;
        flag = 0;
        insert_res = await F_Insert(table_name, fields, values, whr, flag);
        lastId = parseInt(lastId) + parseInt(1);
        if (insert_res.suc == 0) {
            res.send({ suc: insert_res.suc, msg: data.prod_list[i].prod_name + ' is not inserted', err: insert_res.msg });
            break;
        }
    }
    // data.prod_list.forEach(async dt => {
    //     let tnx_no = 'TNX' + curr_date + lastId;
    //     console.log(tnx_no);
    //     table_name = 'td_prod_trans';
    //     fields = '(trans_dt, trans_no, user_id, prod_id, qty, delivery_charge, price, in_out_flag, created_by, created_dt)';
    //     values = `("${date}", "${tnx_no}", "${data.user_id}", "${dt.id}", "${dt.cartCount}", "${data.delivery_charge}", "${dt.cartCount * dt.offer_price}", "${data.flag}", "${data.user}", "${datetime}")`;
    //     whr = null;
    //     flag = 0;
    //     insert_res = await F_Insert(table_name, fields, values, whr, flag);
    //     lastId = parseInt(lastId) + parseInt(1);
    // });
    res.send({ suc: 1, msg: 'Inserted Successfully!!' });
})

CheckOutRouter.post('/transaction', async (req, res) => {
    var data = req.body;
    var date = new Date(Number(data.created_at) * 1000);
    var created_at = dateFormat(date, "yyyy-mm-dd HH:MM:ss")
    var table_name = 'td_transaction',
        fields = '(tnx_id, bank_tnx_id, order_id, contact, amount, order_amount, delivery_charge, entity, bank, currency, method, status, refund_status, description, created_dt, created_by)',
        values = `("${data.id}", "${data.bank_transaction_id}", "${data.order_id}", "${data.contact}", "${data.amount}", "${Number(data.amount) - Number(data.delivery_charge)}", "${data.delivery_charge}", "${data.entity}", "${data.bank}", "${data.currency}", "${data.method}", "${data.status}", "${data.refund_status}", "${data.description}", "${created_at}", "${data.user_email}")`,
        whr = null,
        flag = 0;
    var insert_res = await F_Insert(table_name, fields, values, whr, flag);

    res.send(insert_res);
})

module.exports = { CheckOutRouter }