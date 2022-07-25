const express = require('express');
const ProdRouter = express.Router();
const dateFormat = require('dateformat');
const { F_Select, F_Insert, F_Delete, LastId } = require('../modules/MasterModule');

const fs = require('fs');
const upload = require('express-fileupload')

ProdRouter.use(upload());

////////////////////////////// PRODUCT MASTER //////////////////////////////////////
ProdRouter.get('/prod', async (req, res) => {
    // var id = req.query.id,
    //     table_name = 'md_product a, md_category b, md_sub_category c',
    //     select = 'a.cat_id, b.name AS cat_name, a.sub_cat_id, c.name AS sub_cat_name, a.prod_name',
    //     whr = id > 0 ? `a.cat_id=b.id AND a.sub_cat_id=c.id AND id = ${id}` : `a.cat_id=b.id AND a.sub_cat_id=c.id`;
    var id = req.query.id,
        table_name = 'md_product a, td_product_desc b, td_product_price c',
        select = 'a.id, a.cat_id, a.sub_cat_id, a.prod_name, a.hsn_code, b.prod_code, b.prod_type_id, b.prod_color_id, b.prod_material_id, b.prod_height, b.prod_width, b.dimention_unit, b.prod_weight, b.prod_vendor, b.prod_history, b.prod_desc, c.prod_cp, c.prod_sp, c.discount, c.offer_price, c.sgst, c.cgst',
        whr = id > 0 ? `a.id=b.item_id AND a.id=c.item_id AND a.id = ${id}` : `a.id=b.item_id AND a.id=c.item_id`;
    var dt = await F_Select(select, table_name, whr, null);
    if (id > 0) {
        var img_table_name = 'td_product_img',
            img_select = 'id, item_id, img_path',
            img_whr = `item_id = ${id}`;
        var img_dt = await F_Select(img_select, img_table_name, img_whr, null);
        dt.msg.push({ img: img_dt.msg });
    }
    res.send(dt);
})

ProdRouter.post('/prod', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var data = req.body;
    var table_name = 'md_product',
        fields = data.id > 0 ? `cat_id = "${data.cat_id}", sub_cat_id = "${data.sub_cat_id}", prod_name = "${data.prod_name}", hsn_code = "${data.hsn_code}", modified_by = "${data.user}", modified_dt = "${datetime}"` :
            '(cat_id, sub_cat_id, prod_name, hsn_code, created_by, created_dt)',
        values = `("${data.cat_id}", "${data.sub_cat_id}", "${data.prod_name}", "${data.hsn_code}", "${data.user}", "${datetime}")`,
        whr = `id = ${data.id}`,
        flag = data.id > 0 ? 1 : 0;

    var dt = await F_Insert(table_name, fields, values, whr, flag);
    var res_dt = { suc: dt.suc, msg: dt.msg, item_id: dt.res.insertId };
    res.send(res_dt)
})

ProdRouter.post('/prod_dtls', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var min = 11111111;
    var max = 99999999;
    var prod_code = Math.floor(Math.random() * min) + max;
    var data = req.body;
    var table_name = 'td_product_desc',
        fields = data.id > 0 ? `prod_type_id = "${data.prod_type_id}", prod_color_id = "${data.prod_color_id}", prod_material_id = "${data.prod_material_id}", prod_height = "${data.prod_height}", prod_width = "${data.prod_width}", dimention_unit = "${data.dimention_unit}", prod_weight = "${data.prod_weight}", prod_vendor = "${data.prod_vendor}", prod_history = "${data.prod_history}", prod_desc = "${data.prod_desc}", modified_by = "${data.user}", modified_dt = "${datetime}"` :
            '(item_id, prod_code, prod_type_id, prod_color_id, prod_material_id, prod_height, prod_width, dimention_unit, prod_weight, prod_vendor, prod_history, prod_desc, created_by, created_dt)',
        values = `("${data.item_id}", "${prod_code}", "${data.prod_type_id}", "${data.prod_color_id}", "${data.prod_material_id}", "${data.prod_height}", "${data.prod_width}", "${data.dimention_unit}", "${data.prod_weight}", "${data.prod_vendor}", "${data.prod_history}", "${data.prod_desc}", "${data.user}", "${datetime}")`,
        whr = `item_id = ${data.id}`,
        flag = data.id > 0 ? 1 : 0;

    var dt = await F_Insert(table_name, fields, values, whr, flag);
    res.send(dt)
})

ProdRouter.post('/prod_price', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    var data = req.body;
    var table_name = 'td_product_price',
        fields = data.id > 0 ? `prod_cp = "${data.prod_cp}", prod_sp = "${data.prod_sp}", discount = "${data.discount}", offer_price = "${data.offer_price}", sgst = "${data.sgst}", cgst = "${data.cgst}", modified_by = "${data.user}", modified_dt = "${datetime}"` :
            '(item_id, prod_cp, prod_sp, discount, offer_price, sgst, cgst, created_by, created_dt)',
        values = `("${data.item_id}", "${data.prod_cp}", "${data.prod_sp}", "${data.discount}", "${data.offer_price}", "${data.sgst}", "${data.cgst}", "${data.user}", "${datetime}")`,
        whr = `item_id = ${data.id}`,
        flag = data.id > 0 ? 1 : 0;

    var dt = await F_Insert(table_name, fields, values, whr, flag);
    res.send(dt)
})

ProdRouter.get('/all_prod_list', async (req, res) => {
    var id = req.query.id,
        sub_cat_whr = req.query.sub_cat_id > 0 ? `AND a.sub_cat_id = ${req.query.sub_cat_id}` : '',
        cat_id_whr = req.query.cat_id > 0 ? `AND a.cat_id = ${req.query.cat_id}` : '',
        type_id_whr = req.query.type_id > 0 ? `AND d.prod_type_id = ${req.query.type_id}` : '',
        mat_id_whr = req.query.mat_id > 0 ? `AND d.prod_material_id = ${req.query.mat_id}` : '',
        min = req.query.min >= 0 ? `AND h.offer_price >= ${req.query.min}` : '',
        max = req.query.max <= 0 ? `AND h.offer_price <= ${req.query.max}` : '',
        range = max + ' ' + min,
        sort_flag = req.query.sort_flag == 0 ? `h.offer_price DESC, ` : (req.query.sort_flag > 0 ? `h.offer_price ASC, ` : ''),
        select_img = `(SELECT i.img_path FROM td_product_img i WHERE a.id=i.item_id ORDER BY id ASC LIMIT 1)`,
        select_stock = `(SELECT SUM(j.qty + SUM((SELECT IF(h.qty>0, SUM(h.qty*(h.in_out_flag)), 0) FROM td_prod_trans h WHERE a.id=h.prod_id))) FROM md_prod_stock j WHERE j.prod_id=a.id)`,
        table_name = 'md_product a, md_category b, md_sub_category c, td_product_desc d, md_product_type e, md_material f, md_color g, td_product_price h',
        select = `a.id, b.name cat_name, a.cat_id, a.sub_cat_id, c.name sub_cat_name, a.prod_name, a.hsn_code, d.prod_code, e.type_name, g.color_name, g.color_code, f.name material_name, d.prod_height, d.prod_width, d.dimention_unit, d.prod_weight, d.prod_vendor, d.prod_history, d.prod_desc, h.prod_cp, h.prod_sp, h.discount, h.offer_price, h.sgst, h.cgst, ${select_img} as img_path, ${select_stock} as stock`,
        whr = id > 0 ? `a.cat_id=b.id AND a.sub_cat_id=c.id AND a.id=d.item_id AND d.prod_type_id=e.id AND d.prod_color_id=g.id AND d.prod_material_id=f.id AND a.id=h.item_id AND a.id = ${id}` : `a.cat_id=b.id AND a.sub_cat_id=c.id AND a.id=d.item_id AND d.prod_type_id=e.id AND d.prod_color_id=g.id AND d.prod_material_id=f.id AND a.id=h.item_id ${sub_cat_whr} ${cat_id_whr} ${range} ${type_id_whr} ${mat_id_whr}`,
        order = `GROUP BY a.id ORDER BY ${sort_flag} a.id DESC`;
    var dt = await F_Select(select, table_name, whr, order);

    if (id > 0) {
        var img_table_name = 'td_product_img',
            img_select = 'id, item_id, img_path',
            img_whr = `item_id = ${id}`;
        var img_dt = await F_Select(img_select, img_table_name, img_whr, null);
        dt.msg.push({ img: img_dt.msg });
    }
    res.send(dt);
})

ProdRouter.post('/prod_img_upload', async (req, res) => {
    var data = req.body;
    var files = req.files ? (req.files.file ? req.files.file : null) : null;
    var res_data = '';
    var file_path = '';
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    console.log(req);
    // console.log('files');
    // console.log(files);
    var prod_name = data.prod_name.toLowerCase();
    var folder_name = prod_name.split(' ').join('_');
    var dir = 'uploads',
        subdir = dir + '/' + folder_name;
    if (!fs.existsSync(subdir)) {
        fs.mkdirSync(subdir);
    }
    const file_save = async (file_path, item_id, user, datetime) => {
        console.log(file_path);
        for (let j = 0; j < file_path.length; j++) {
            var table_name = 'td_product_img',
                fields = '(item_id, img_path, created_by, created_dt)',
                values = `("${item_id}", "${file_path[j].filename}", "${user}", "${datetime}")`,
                whr = null,
                flag = 0;

            var dt = await F_Insert(table_name, fields, values, whr, flag);
        }
        return (dt);
    }
    // try {
    if (files) {
        file_path = new Array();
        if (Array.isArray(files)) {
            for (let i = 0; i < files.length; i++) {
                var file = files[i];
                // console.log(files[i].name);
                var filename = '';
                filename = subdir + '/' + file.name;
                // // console.log(filename);
                file_path.push({ i, filename });
                // // console.log({ file_path });
                files[i].mv(filename, async (err) => {
                    if (err) {
                        console.log(`${filename} not uploaded`);
                        res_data = { suc: 0, msg: `${filename} is not uploaded. ${err}` };
                    } else {
                        console.log(`Successfully ${filename} uploaded`);
                    }
                })
            }
        } else {
            console.log('Else Here');
            var file = files;
            // console.log(files[i].name);
            var filename = '';
            filename = subdir + '/' + file.name;
            // // console.log(filename);
            file_path.push({ i: 0, filename });
            // // console.log({ file_path });
            files.mv(filename, async (err) => {
                if (err) {
                    console.log(`${filename} not uploaded`);
                    res_data = { suc: 0, msg: `${filename} is not uploaded. ${err}` };
                } else {
                    console.log(`Successfully ${filename} uploaded`);
                }
            })
        }
        // console.log(file_path);
        res_data = await file_save(file_path, data.item_id, data.user, datetime);
        res.send({ suc: 1, msg: 'Files are uploaded successfully' });
    } else {
        res.send({ suc: 1, msg: 'Updated successfully' });
    }
    // } catch (err) {
    //     res.send(err);
    // }
})

ProdRouter.post('/prod_img_del', async (req, res) => {
    var id = req.body.id,
        img_path = req.body.img_path,
        table_name = 'td_product_img',
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

ProdRouter.post('/prod_del', async (req, res) => {
    var id = req.body.id,
        item_name = req.body.item_name,
        dir = 'uploads/' + item_name.split(' ').join('_'),
        prod_table_name = 'md_product',
        prod_whr = `id = ${id}`;
    var prod_dt = await F_Delete(prod_table_name, prod_whr);

    var prod_desc_table_name = 'td_product_desc',
        prod_desc_whr = `item_id = ${id}`;
    var prod_desc_dt = await F_Delete(prod_desc_table_name, prod_desc_whr);

    var prod_price_table_name = 'td_product_price',
        prod_price_whr = `item_id = ${id}`;
    var prod_price_dt = await F_Delete(prod_price_table_name, prod_price_whr);

    var prod_img_table_name = 'td_product_img',
        prod_img_whr = `item_id = ${id}`;
    var prod_img_dt = await F_Delete(prod_img_table_name, prod_img_whr);

    if (prod_dt.suc == 1) {
        if (fs.existsSync(dir)) {
            fs.rmdir(dir, { recursive: true }, async (err) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                } else {
                    res.send(prod_dt);
                }
            })
        } else {
            res.send(prod_dt);
        }
    } else {
        res.send(prod_dt);
    }
})
///////////////////////////////////// END ////////////////////////////////////

ProdRouter.get('/prod_dash', async (req, res) => {
    var id = req.query.id,
        flag = req.query.flag, // 1 => Featured; 2 => On Sale; 3 => Top Rated; 4 => New Arrivals
        table_name = `md_product a, md_category b, td_product_price c, td_featured e`,
        select = `a.id, b.name cat_name, a.prod_name, c.prod_sp, c.discount, c.offer_price, ( SELECT d.img_path FROM td_product_img d WHERE a.id = d.item_id ORDER BY d.id ASC LIMIT 1 ) AS img_path`,
        whr = id > 0 ? `a.cat_id = b.id AND a.id = c.item_id AND a.id = e.product_id AND a.id = ${id}` : `a.cat_id = b.id AND a.id = c.item_id AND a.id = e.product_id AND e.type=${flag}`,
        order = flag == 2 ? 'ORDER BY c.discount DESC, a.id DESC LIMIT 6' : 'ORDER BY a.id DESC LIMIT 6';
    //     table_name = `md_product a, md_category b, td_product_price c ${flag == 1 ? ', td_featured e' : (flag == 3 ? ', td_rating f' : '')}`,
    //     select = `a.id, b.name cat_name, a.prod_name, c.prod_sp, c.discount, c.offer_price, (SELECT d.img_path FROM td_product_img d WHERE a.id=d.item_id ORDER BY d.id ASC LIMIT 1) as img_path ${flag == 3 ? ', SUM(f.rating) as rating' : ''}`,
    //     whr = id > 0 ? `a.cat_id=b.id AND a.id=c.item_id AND a.id = ${id}` : `a.cat_id=b.id AND a.id=c.item_id ${flag == 1 ? 'AND a.id=e.product_id' : (flag == 3 ? 'AND a.id=f.product_id' : '')}`,
    //     order = flag == 2 ? 'ORDER BY c.discount DESC, a.id DESC LIMIT 6' : (flag == 3 ? 'GROUP BY a.id ORDER BY rating DESC' : 'ORDER BY a.id DESC LIMIT 6')
    var dt = await F_Select(select, table_name, whr, order);
    res.send(dt);
})

ProdRouter.get('/related_product', async (req, res) => {
    var cat_id = req.query.cat_id,
        id = req.query.id,
        limit = req.query.limit,
        table_name = `md_product a, md_category b, td_product_price c`,
        select = `a.id, b.name cat_name, a.prod_name, c.prod_sp, c.discount, c.offer_price, (SELECT d.img_path FROM td_product_img d WHERE a.id=d.item_id ORDER BY d.id ASC LIMIT 1) as img_path`,
        whr = `a.cat_id=b.id AND a.id=c.item_id AND a.cat_id=${cat_id} AND a.id!=${id}`,
        order = `ORDER BY a.id DESC LIMIT ${limit}`;
    var dt = await F_Select(select, table_name, whr, order);
    res.send(dt);
})

ProdRouter.post('/search', async (req, res) => {
    var name = req.body.name,
        cat_id = req.body.cat_id,
        cat_whr = cat_id > 0 ? `AND a.cat_id = ${cat_id}` : '',
        name_whr = name != '' && name != "null" && name != "undefined" && name.length > 0 ? `AND (a.prod_name LIKE "%${name}%" OR b.name LIKE "%${name}%" OR c.name LIKE "%${name}%" OR d.offer_price LIKE "%${name}%")` : '',
        table_name = `md_product a, md_category b, md_sub_category c, td_product_price d`,
        select = `a.id, a.prod_name, b.name AS cat_name, c.name AS sub_cat_name, d.prod_sp, d.discount, d.offer_price, (SELECT e.img_path FROM td_product_img e WHERE a.id=e.item_id ORDER BY e.id ASC LIMIT 1) as img_path`,
        whr = `a.cat_id=b.id AND a.sub_cat_id=c.id AND a.id=d.item_id ${name_whr} ${cat_whr}`,
        order = 'GROUP BY a.id ORDER BY a.prod_name';
    var dt = await F_Select(select, table_name, whr, order);
    res.send(dt);
})

ProdRouter.get('/stock_list', async (req, res) => {
    var curr_year = dateFormat(new Date(), "yyyy");
    var year = dateFormat(new Date(), "yyyymmdd") > curr_year + '0401' ? curr_year : curr_year - 1;
    var id = req.query.prod_id,
        table_name = `md_product a LEFT JOIN md_prod_stock b ON a.id=b.prod_id AND b.ac_year=${year}`,
        select = `a.id, a.prod_name, a.hsn_code, b.qty opening_stock, SUM(b.qty + (SELECT IF(c.qty>0, SUM(c.qty*c.in_out_flag), 0) FROM td_prod_trans c WHERE a.id=c.prod_id)) stock_in_hand`,
        whr = id > 0 ? `a.id=${id}` : '',
        order = 'GROUP BY a.id ORDER BY a.prod_name';
    var dt = await F_Select(select, table_name, whr, order);
    res.send(dt);
})

ProdRouter.post('/stock_entry', async (req, res) => {
    var datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
        date = dateFormat(new Date(), "yyyy-mm-dd"),
        curr_year = dateFormat(new Date(), "yyyy");
    var data = req.body;
    var year = dateFormat(new Date(), "yyyymmdd") > curr_year + '0401' ? curr_year : curr_year - 1;
    var id = data.prod_id,
        table_name = `md_prod_stock`,
        select = `id, ac_year, prod_id, qty`,
        whr = id > 0 ? `prod_id=${id} AND ac_year=${year}` : `ac_year=${year}`,
        order = null;
    var dt = await F_Select(select, table_name, whr, order);
    var inTableName, inFields, inValues, inWhr, inFlag;
    if (dt.msg.length > 0) {
        if (dt.msg[0].qty != data.ostock) {
            inTableName = 'md_prod_stock';
            inFields = `date = "${date}", qty = "${data.ostock}", in_out_flag = "${data.flag}", modified_by = "${data.user}", modified_dt = "${datetime}"`;
            inValues = null;
            inWhr = `prod_id = ${id} AND ac_year=${year}`;
            inFlag = 1;
            res_dt = await F_Insert(inTableName, inFields, inValues, inWhr, inFlag);
        } else {
            var lastId = await LastId('td_prod_trans');
            let tnx_no = 'TNX' + dateFormat(new Date(), "yyyymmdd") + lastId;
            inTableName = 'td_prod_trans';
            inFields = '(trans_dt, trans_no, user_id, prod_id, qty, in_out_flag, created_by, created_dt)';
            inValues = `("${date}", "${tnx_no}", "${data.user_id}", "${id}", "${data.entry}", "${data.flag}", "${data.user}", "${datetime}")`;
            inWhr = null;
            inFlag = 0;
            res_dt = await F_Insert(inTableName, inFields, inValues, inWhr, inFlag);
        }
    } else {
        inTableName = 'md_prod_stock';
        inFields = '(ac_year, date, prod_id, qty, in_out_flag, created_by, created_dt)';
        inValues = `("${year}", "${date}", "${id}", "${data.ostock}", "${data.flag}", "${data.user}", "${datetime}")`;
        inWhr = `prod_id = ${id}`;
        inFlag = 0;
        res_dt = await F_Insert(inTableName, inFields, inValues, inWhr, inFlag);
    }

    res.send(res_dt)
})

module.exports = { ProdRouter }