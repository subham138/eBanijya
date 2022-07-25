const express = require('express'),
    cors = require('cors'),
    app = express(),
    port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

const { AdmRouter } = require('./routers/masterRouter');
const { ProdRouter } = require('./routers/productRouter');
const { BannerRouter } = require('./routers/bannerRouter');
const { UserRouter } = require('./routers/userRouter');
const { CheckOutRouter } = require('./routers/checkOutRouter');
const { CartRouter } = require('./routers/cartRouter');
const { WishListRouter } = require('./routers/wishListRouter');

app.use('/admin', AdmRouter);
app.use('/product', ProdRouter);
app.use('/params', BannerRouter)
app.use('/user', UserRouter)
app.use('/check_out', CheckOutRouter)
app.use('/cart', CartRouter)
app.use('/wishlist', WishListRouter)

app.get('/', (req, res) => {
    res.send('Welcome to eBanijya API');
})

app.listen(port, (err) => {
    if (err) console.log(err);
    else console.log(`App is running at port- ${port}`);
})