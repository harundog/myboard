
//MariaDB + Node.js 접속 코드
var mariadb = require('mariadb');
// 커넥션 풀 생성
const pool = mariadb.createPool({

    host: "localhost",
    user: "root",
    password: "1234",
    database: "myboard",
    connectionLimit: 5
});

// 연결 & 쿼리 실행
async function connectDB() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM post");
        console.log(rows); // [{ val: 1 }]
    } catch (err) {
        console.error(err);
    } finally {
        if (conn) conn.release(); // 커넥션 반환
    }
}

async function saveDB(params, sql){
    let conn;
    conn = await pool.getConnection()
        .then(conn => {
            return conn.query(sql, [params[0], params[1]])
                            .then(result => {
                                console.log("✅ insert:", result.insertId);
                                conn.release();
                            })
                            .catch(err => {
                                console.error("❌ Error:", err);
                                conn.release();
                            });
        })
        .catch(err => console.error("❌ Connection Error:", err));
}

//connectDB();


const mongoclient = require('mongodb').MongoClient;
const url = 'mongodb+srv://greenjvtraining:hint1384@cluster0.yje52dv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

let mydb;

mongoclient.connect(url)
    .then(client => {
        mydb = client.db('myboard');
        /*
        mydb.collection('post').find().toArray().then(result => {
            console.log(result);
        });
        */
        app.listen(8080, function(){
            console.log('포트 8080으로 서버 대기중...');
        });
        console.log('몽고DB 접속 성공');
    }).catch(err => {
        console.log(err);
    });

const express = require('express');

const app = express();
app.set('view engine', 'ejs');
/*
app.listen(8080, function(){
    console.log('포트 8080으로 서버 대기중...');
});
*/

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));


app.get('/', function(req, res){
    //res.send('홈입니다.');
    /*
    res.send(
        '<html>\
        <body>\
        <h1>홈입니다</h1>\
        <marquee>홍길동님 반갑습니다.</marquee>\
        </body>\
        </html>'
    );
    */
    res.sendFile(__dirname + '/index.html'); // __dirnmae : node 내부에 현재 디렉토리를 나타내는 문자열 변수
});

app.get('/book', function(req, res){
    res.send('도서 목록 관련 페이지입니다.');
});

app.get('/list', function(req, res){
    console.log('데이터 베이스를 조회합니다.');
    //connectDB(); //mariadb 접속 코드
    mydb.collection('post').find().toArray().then(result => {
            console.log(result);
            res.render('list', {data : result});
        });

    //res.sendFile(__dirname + "/list.html");
});

app.get('/test', function(req, res){
    console.log('test입니다....');
    //res.send('Test입니다.');
    res.render('test', {data : 'I Love You'});
});

app.get('/regform', function(req, res){
    res.sendFile(__dirname + '/regform.html');
});

app.post('/save', function(req, res){
    console.log(req.body.title);
    console.log(req.body.content);
    let sql = "INSERT INTO post (title, content, created) VALUES(?, ?, NOW())";
    let params = [req.body.title, req.body.content];

    //MongoDB에 저장하기
    mydb.collection('post').insertOne(
        {title: params[0], content: params[1]}
    ).then(result => {
        console.log(result);
        console.log('데이터 추가 성공');
    });

    res.send('데이터 추가 성공');
});

app.post('/save2', function(req, res){
    console.log(req.body.title);
    console.log(req.body.content);
    let sql = "INSERT INTO post (title, content, created) VALUES(?, ?, NOW())";
    let params = [req.body.title, req.body.content];

    //MariaDB에 저장하기
    saveDB(params, sql);

    res.send('데이터 추가 성공');
});
