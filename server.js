const express = require('express')
const path = require('path')
const app = express()
const history = require('connect-history-api-fallback');

app.use("/app", express.static(path.join(__dirname, './dist/app')))

//这句代码需要在express.static上面
app.use(history());
app.use(express.static(path.join(__dirname, './dist/main')))

// app.all('*', function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//     next();
// });

app.listen(8888, () => {
  console.log(`App listening at port 8888`)
})

// http://localhost:8888/sub-umi-product#/ 带基座
// http://localhost:8888/app/product/#/ 独立运行