const express = require('express');
const AdmRouter = express.Router();
const dateFormat = require('dateformat');
const { F_Select, F_Insert, F_Delete } = require('../modules/MasterModule');

AdmRouter.get('/category', async (req, res) => {
    var id = req.query.id,
        table_name = 'md_category',
        select = 'id, name',
        whr = id > 0 ? `id = ${id}` : null;
    var dt = await F_Select(select, table_name, whr, null);
    res.send(dt);
})

AdmRouter.post('/category', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var data = req.body;
    var table_name = 'md_category',
        fields = data.id > 0 ? `name = "${data.name}", modified_by = "${data.user}", modified_dt = "${datetime}"` :
            '(name, created_by, created_dt)',
        values = `("${data.name}", "${data.user}", "${datetime}")`,
        whr = `id = ${data.id}`,
        flag = data.id > 0 ? 1 : 0;

    var dt = await F_Insert(table_name, fields, values, whr, flag);
    res.send(dt)
})

AdmRouter.post('/category_del', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var data = req.body;
    var table_name = 'md_category',
        whr = `id = ${data.id}`;

    var dt = await F_Delete(table_name, whr);
    res.send(dt)
})

AdmRouter.get('/sub_category', async (req, res) => {
    var id = req.query.id,
        cat_id = req.query.cat_id,
        table_name = 'md_sub_category a, md_category b',
        select = 'a.id, b.name cat_name, a.cat_id, a.name',
        cat_id_whr = cat_id > 0 ? `AND cat_id = ${cat_id}` : '',
        whr = id > 0 ? `a.cat_id=b.id AND a.id = ${id} ${cat_id_whr}` : `a.cat_id=b.id ${cat_id_whr}`;
    var dt = await F_Select(select, table_name, whr, null);
    res.send(dt);
})

AdmRouter.post('/sub_category', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var data = req.body;
    var table_name = 'md_sub_category',
        fields = data.id > 0 ? `cat_id = "${data.cat_id}", name = "${data.name}", modified_by = "${data.user}", modified_dt = "${datetime}"` :
            '(cat_id, name, created_by, created_dt)',
        values = `("${data.cat_id}", "${data.name}", "${data.user}", "${datetime}")`,
        whr = `id = ${data.id}`,
        flag = data.id > 0 ? 1 : 0;

    var dt = await F_Insert(table_name, fields, values, whr, flag);
    res.send(dt)
})

AdmRouter.post('/sub_category_del', async (req, res) => {
    var data = req.body;
    var table_name = 'md_sub_category',
        whr = `id = ${data.id}`;
    console.log(data);
    var dt = await F_Delete(table_name, whr);
    res.send(dt);
})
///////////////////////////////////// END ////////////////////////////////////

////////////////////////////// MATERIAL /////////////////////////////
AdmRouter.get('/material', async (req, res) => {
    var id = req.query.id,
        table_name = 'md_material',
        select = 'id, name',
        whr = id > 0 ? `id = ${id}` : null;
    var dt = await F_Select(select, table_name, whr, null);
    res.send(dt);
})

AdmRouter.post('/material', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var data = req.body;
    var table_name = 'md_material',
        fields = data.id > 0 ? `name = "${data.name}", modified_by = "${data.user}", modified_dt = "${datetime}"` :
            '(name, created_by, created_dt)',
        values = `("${data.name}", "${data.user}", "${datetime}")`,
        whr = `id = ${data.id}`,
        flag = data.id > 0 ? 1 : 0;

    var dt = await F_Insert(table_name, fields, values, whr, flag);
    res.send(dt)
})

AdmRouter.post('/material_del', async (req, res) => {
    var data = req.body;
    var table_name = 'md_material',
        whr = `id = ${data.id}`;
    console.log(data);
    var dt = await F_Delete(table_name, whr);
    res.send(dt);
})
///////////////////////////////////// END ////////////////////////////////////

////////////////////////////// PRODUCT TYPE //////////////////////////////////////
AdmRouter.get('/product_type', async (req, res) => {
    var id = req.query.id,
        table_name = 'md_product_type',
        select = 'id, type_name',
        whr = id > 0 ? `id = ${id}` : null;
    var dt = await F_Select(select, table_name, whr, null);
    res.send(dt);
})

AdmRouter.post('/product_type', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var data = req.body;
    var table_name = 'md_product_type',
        fields = data.id > 0 ? `type_name = "${data.type_name}", modified_by = "${data.user}", modified_dt = "${datetime}"` :
            '(type_name, created_by, created_dt)',
        values = `("${data.type_name}", "${data.user}", "${datetime}")`,
        whr = `id = ${data.id}`,
        flag = data.id > 0 ? 1 : 0;

    var dt = await F_Insert(table_name, fields, values, whr, flag);
    res.send(dt)
})

AdmRouter.post('/product_type_del', async (req, res) => {
    var data = req.body;
    var table_name = 'md_product_type',
        whr = `id = ${data.id}`;
    console.log(data);
    var dt = await F_Delete(table_name, whr);
    res.send(dt);
})
///////////////////////////////////// END ////////////////////////////////////

////////////////////////////// COLOR //////////////////////////////////////
AdmRouter.get('/color', async (req, res) => {
    var id = req.query.id,
        table_name = 'md_color',
        select = 'id, color_name, color_code',
        whr = id > 0 ? `id = ${id}` : null;
    var dt = await F_Select(select, table_name, whr, null);
    res.send(dt);
})

AdmRouter.post('/color', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var data = req.body;
    var table_name = 'md_color',
        fields = data.id > 0 ? `color_name = "${data.color_name}", color_code = "${data.color_code}", modified_by = "${data.user}", modified_dt = "${datetime}"` :
            '(color_name, color_code, created_by, created_dt)',
        values = `("${data.color_name}", "${data.color_code}", "${data.user}", "${datetime}")`,
        whr = `id = ${data.id}`,
        flag = data.id > 0 ? 1 : 0;

    var dt = await F_Insert(table_name, fields, values, whr, flag);
    res.send(dt)
})

AdmRouter.post('/color_del', async (req, res) => {
    var data = req.body;
    var table_name = 'md_color',
        whr = `id = ${data.id}`;
    console.log(data);
    var dt = await F_Delete(table_name, whr);
    res.send(dt);
})
///////////////////////////////////// END ////////////////////////////////////

AdmRouter.get('/cat_sub_list', async (req, res) => {
    var id = req.query.id,
        table_name = 'md_category',
        select = 'id, name cat_name',
        whr = id > 0 ? `id = ${id}` : null;
    var dt = await F_Select(select, table_name, whr, null);
    var result = new Array();
    for (let i = 0; i < dt.msg.length; i++) {
        var cat_id = dt.msg[i].id,
            sub_table_name = 'md_sub_category',
            sub_select = 'id, name sub_cat_name',
            sub_whr = `cat_id = ${cat_id}`;
        var sub_dt = await F_Select(sub_select, sub_table_name, sub_whr, null);
        result.push({ id: dt.msg[i].id, cat_name: dt.msg[i].cat_name, sub_cat: sub_dt.msg })
    }

    var res_dt = { suc: dt.suc, msg: dt.suc > 0 ? result : dt.msg };
    res.send(res_dt);
})

AdmRouter.get('/country', async (req, res) => {
    var id = req.query.id,
        table_name = 'md_country',
        select = 'id, name, code',
        whr = id > 0 ? `id = ${id}` : null,
        order = `ORDER BY name`;
    var dt = await F_Select(select, table_name, whr, null);
    res.send(dt)
})

AdmRouter.post('/contact_us', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var data = req.body;
    var table_name = 'td_contact_us',
        fields = '(name, email, phone, message, created_by, created_dt)',
        values = `("${data.name}", "${data.email}", "${data.phone}", "${data.message}", "${data.user}", "${datetime}")`,
        whr = null,
        flag = 0;

    var dt = await F_Insert(table_name, fields, values, whr, flag);
    res.send(dt)
})

module.exports = { AdmRouter };