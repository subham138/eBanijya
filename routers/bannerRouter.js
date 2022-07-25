const express = require('express');
const BannerRouter = express.Router();
const dateFormat = require('dateformat');
const { F_Select, F_Insert, F_Delete } = require('../modules/MasterModule');

const fs = require('fs');
const upload = require('express-fileupload')

BannerRouter.use(upload());

BannerRouter.get('/', async (req, res) => {
    var id = req.query.id,
        table_name = 'md_params',
        select = 'id, name, no_of_element',
        whr = id > 0 ? `id = ${id}` : null;
    var dt = await F_Select(select, table_name, whr, null);
    res.send(dt);
})

BannerRouter.get('/banner', async (req, res) => {
    var id = req.query.id,
        param_id = req.query.param_id,
        flag = req.query.flag, // 0 => Admin; 1 => User Dashboard
        table_name = 'td_banner',
        select = 'id, param_id, img_path, heading, sub_heading, page_url',
        whr = flag > 0 ? (param_id == 1 ? `param_id = ${param_id}` : (param_id > 1) ? `param_id IN(2,3,4,5,6,7)` : `param_id = ${param_id}`) : (id > 0 ? `id = ${id}` : `param_id = ${param_id}`);
    var dt = await F_Select(select, table_name, whr, null);
    res.send(dt);
})

BannerRouter.post('/banner', async (req, res) => {
    var data = req.body;
    var files = req.files ? (req.files.file ? req.files.file : null) : null;
    var filename = null;
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    // console.log(req);
    // console.log('files');
    // console.log(files);
    var param_name = data.param_name.toLowerCase();
    var folder_name = param_name.split(' ').join('_');
    var dir = 'uploads',
        subdir = dir + '/' + folder_name;
    if (!fs.existsSync(subdir)) {
        fs.mkdirSync(subdir);
    }
    const file_save = async (id, file_path, param_id, heading, sub_heading, page_url, user, datetime) => {
        var table_name = 'td_banner',
            file_path_field = file_path ? `img_path = "${file_path}", ` : '',
            fields = id > 0 ? `${file_path_field} heading = "${heading}", sub_heading = "${sub_heading}", page_url = "${page_url}", modified_by = "${user}", modified_dt = "${datetime}"` :
                '(param_id, img_path, heading, sub_heading, page_url, created_by, created_dt)',
            values = `("${param_id}", "${file_path}", "${heading}", "${sub_heading}", "${page_url}", "${user}", "${datetime}")`,
            whr = `id=${id}`,
            flag = id > 0 ? 1 : 0;
        var dt = await F_Insert(table_name, fields, values, whr, flag);
        res.send(dt);
    }
    // try {
    if (files) {
        var file = files;
        // console.log(files[i].name);
        filename = subdir + '/' + file.name;
        file.mv(filename, async (err) => {
            if (err) {
                console.log(`${filename} not uploaded`);
                res_data = { suc: 0, msg: `${filename} is not uploaded. ${err}` };
                res.send(res_data);
            } else {
                console.log(`Successfully ${filename} uploaded`);
                await file_save(data.id, filename, data.param_id, data.heading, data.sub_heading, data.page_url, data.user, datetime);
            }
        })
        // console.log(file_path);

    } else {
        await file_save(data.id, filename, data.param_id, data.heading, data.sub_heading, data.page_url, data.user, datetime);
    }
})

BannerRouter.post('/banner_del', async (req, res) => {
    var id = req.body.id,
        img_path = req.body.img_path,
        table_name = 'td_banner',
        whr = `id = ${id}`;
    var dt = await F_Delete(table_name, whr);
    if (dt.suc == 1) {
        fs.unlink(img_path, (err) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send(dt);
            }
        })
    } else {
        res.send(dt);
    }
})

BannerRouter.get('/featured', async (req, res) => {
    var id = req.query.id,
        type = req.query.type,
        table_name = 'md_product a, md_category b, td_product_price c, md_sub_category d, td_product_desc e, md_product_type f',
        select = `a.id, b.name cat_name, a.prod_name, c.prod_sp, c.discount, d.name sub_cat_name, f.type_name, c.offer_price, (SELECT d.img_path FROM td_product_img d WHERE a.id=d.item_id ORDER BY d.id ASC LIMIT 1) as img_path, IF((SELECT e.id FROM td_featured e WHERE a.id=e.product_id AND e.type=${type}) > 0, 'Y', 'N') AS featured`,
        whr = id > 0 ? `a.cat_id=b.id AND a.id=c.item_id AND a.sub_cat_id=d.id AND a.id=e.item_id AND e.prod_type_id=f.id AND a.id = ${id}` : `a.cat_id=b.id AND a.id=c.item_id AND a.sub_cat_id=d.id AND a.id=e.item_id AND e.prod_type_id=f.id`,
        order = `ORDER BY a.id DESC`;
    var dt = await F_Select(select, table_name, whr, order);
    res.send(dt);
})

BannerRouter.post('/featured', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var data = req.body;
    var table_name, fields, values, whr, flag, dt;
    var v = '',
        v1 = '';
    for (let i = 0; i < data.product_id.length; i++) {
        if (data.product_id[i].id > 0) {
            v = data.product_id[i].id;
            if (v1 != '') {
                v1 = v + ',' + v1;
            } else {
                v1 = v;
            }
        }
    }
    var del_table_name = 'td_featured',
        del_whr = `product_id NOT IN(${v1}) AND type=${data.type}`;
    var del_flag = await F_Delete(del_table_name, del_whr);
    // console.log(v1);
    if (del_flag.suc == 1) {
        for (let i = 0; i < data.product_id.length; i++) {
            var chk = await F_Select('count(id) as ct_id', 'td_featured', `product_id=${data.product_id[i].id} AND type=${data.type}`, null)
            if (chk.msg[0].ct_id < 1) {
                table_name = 'td_featured';
                fields = '(product_id, type, created_by, created_dt)';
                values = `("${data.product_id[i].id}", "${data.type}", "${data.user}", "${datetime}")`;
                whr = null;
                flag = 0;
                await F_Insert(table_name, fields, values, whr, flag);
            }
        }
        dt = { suc: 1, msg: 'Inserted Successfully !!' }
    } else {
        dt = { suc: 0, msg: 'Data not inserted' }
    }
    res.send(dt)
})

module.exports = { BannerRouter };  