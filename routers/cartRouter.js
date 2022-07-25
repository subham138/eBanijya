const express = require('express');
const CartRouter = express.Router();
const dateFormat = require('dateformat');
const bcrypt = require('bcrypt');
const { F_Select, F_Insert, F_Delete, LastId, F_Check } = require('../modules/MasterModule');

CartRouter.get('/', async (req, res) => {
    var user_id = req.query.user_id,
        table_name = 'td_cart a, md_product b, td_product_price c, md_category d',
        select = 'a.id cart_id, a.prod_id id, a.user_id, b.prod_name, c.prod_sp, c.offer_price, c.discount, d.name cat_name, a.qty cartCount, (SELECT i.img_path FROM td_product_img i WHERE a.prod_id=i.item_id ORDER BY i.id ASC LIMIT 1) img_path',
        whr = user_id > 0 ? `a.prod_id=b.id AND a.prod_id=c.item_id AND b.cat_id=d.id AND user_id = ${user_id}` : `a.prod_id=b.id AND a.prod_id=c.item_id AND b.cat_id=d.id`;
    var dt = await F_Select(select, table_name, whr, null);
    res.send(dt);
})

CartRouter.post('/', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var data = req.body;
    var chk_table_name = 'td_cart',
        chk_select = 'id',
        chk_whr = `prod_id = ${data.prod_dtls.id} AND user_id = ${data.user_id}`;
    var dt = await F_Check(chk_select, chk_table_name, chk_whr);
    var flag = dt.msg.res_len > 0 ? 1 : 0;

    var table_name = 'td_cart',
        fields = flag > 0 ? `qty = "${data.prod_dtls.cartCount}", modified_by = "${data.user_email}", modified_dt = "${datetime}"` :
            '(user_id, prod_id, qty, created_by, created_dt)',
        values = `("${data.user_id}", "${data.prod_dtls.id}", "${data.prod_dtls.cartCount}", "${data.user_email}", "${datetime}")`,
        whr = `prod_id = ${data.prod_dtls.id} AND user_id = ${data.user_id}`;
    var dt = await F_Insert(table_name, fields, values, whr, flag);
    res.send(dt)
})

CartRouter.post('/del', async (req, res) => {
    var data = req.body;
    var prod_id, table_name, whr, dt;
    if (!Array.isArray(data.prod_dtls)) {
        prod_id = data.prod_dtls.id;
        table_name = 'td_cart';
        whr = `user_id = ${data.user_id} AND prod_id = ${prod_id}`;
        dt = await F_Delete(table_name, whr);
        res.send(dt);
    } else {
        for (let i = 0; i < data.prod_dtls.length; i++) {
            prod_id = data.prod_dtls[i].id;
            table_name = 'td_cart';
            whr = `user_id = ${data.user_id} AND prod_id = ${prod_id}`;
            dt = await F_Delete(table_name, whr);
        }
        res.send(dt);
    }
})

module.exports = { CartRouter }