const axios = require('axios'),
    cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017", function (err, client) {
    if (!err) {
        console.log("We are connected");
        const db = client.db('minha-colecao')
        main(db);
        //mainArticleTable(db)
    }
});

const fetchData = async (url) => {
    const result = await axios.get(url);
    return result.data;
}

const categoria = 'Star Wars'
const teste = true  

const main = async (db) => {
    const content = await fetchData(`https://funko.fandom.com/wiki/Pop!_Star_Wars`);
    const $ = cheerio.load(content);

    let numAntigo = 0;
    console.log($('.wikitable tbody tr').length);
    let arrayCheck = []
    $('.wikitable tbody tr').each(function (i, elem) {
        if (i > 0) {
            let nome = ""
            let url = ""
            let num = "";
            let subCategoria = '';
            let ano = '???'

            if ($(this).add('img')['1'] && $(this).add('img')['1'].attribs['data-src']) {
                url = formatUrlImage($(this).add('img')['1'].attribs['data-src']);
            } else if ($(this).add('img')['1'] && $(this).add('img')['1'].attribs['src']) {
                url = formatUrlImage($(this).add('img')['1'].attribs['src']);
            } else {
                url = 'noimage.png'
            }

            if ($(this).add('th')['1']) {
                if ($(this).add('th')['1'].children[0].data && $(this).add('th')['1'].children[0].data.length > 1) {
                    num = $(this).add('th')['1'].children[0].data.replace('#', '').replace('\n', '')
                } else {
                    num = $(this).add('th p')['1'].children[0].data.replace('#', '').replace('\n', '')
                }
            }

            if ($(this).add('a')['1'] && $(this).add('a')['1'].children[0].data) {
                nome = $(this).add('a')['1'].children[0].data;
            }
            else if ($(this).add('th')['2']) {
                if ($(this).add('th')['2'].children[0].data && $(this).add('th')['2'].children[0].data.length > 1) {
                    nome = $(this).add('th')['2'].children[0].data.replace('#', '').replace('\n', '')
                } else if ($(this).add('th p')['1']) {
                    nome = $(this).add('th p')['1'].children[0].data.replace('#', '').replace('\n', '')
                } else {
                    nome = '???'
                }
            }

            if ($(this).add('td i')['1']) {
                if ($(this).add('td i')['1'].children[0].data) {
                    subCategoria = $(this).add('td i')['1'].children[0].data.replace('\n', '').replace('"', '\'')
                } else {
                    subCategoria = $(this).add('td i b')['1'].children[0].data.replace('\n', '').replace('"', '\'')
                }
            } else if ($(this).add('td b')['1']) {
                subCategoria = $(this).add('td b')['1'].children[0].data.replace('\n', '').replace('"', '\'')
            } else if ($(this).add('td')['4'] && $(this).add('td')['4'].children) {
                subCategoria = $(this).add('td')['4'].children[0].data.replace('\n', '').replace('"', '\'')
            } else if (subCategoria = $(this).add('td')['4']) {
                subCategoria = $(this).add('td')['4'].replace('\n', '')
            } else if ($(this).add('th i')['1']) {
                if ($(this).add('th i')['1'].children[0].data) {
                    subCategoria = $(this).add('th i')['1'].children[0].data.replace('\n', '').replace('"', '\'')
                } else {
                    subCategoria = $(this).add('th i b')['1'].children[0].data.replace('\n', '').replace('"', '\'')
                }
            } else {
                subCategoria = "N/A"
            }
            
            if ($(this).add('td')['2']) {
                ano = $(this).add('td')['2'].children[0].data
            } else if ($(this).add('th')['4']) {
                ano = $(this).add('th')['4'].children[0].data
            }

            if (ano) {
                ano = ano.replace('\n', '').replace('"', '\'').replace('Due ', '').replace('20??', '???')
            }

            if (ano === 'N/A') {
                ano = '???'
            }
      
            if (isNaN(num)) {
                numAntigo -= 1;
                nome = num;
                num = numAntigo;
            } else {
                numAntigo = i;
            }

            if (!isNaN(parseInt(num))) {
                arrayCheck.push(num)
                if (teste){
                    console.log('index:', i, parseInt(num), (nome.trim() === '') ? '???' : nome.replace('"', '\'').trim(), url, (subCategoria.trim() === '') ? 'N/A' : subCategoria.trim(), (ano === '') ? '???' : ano);
                } else {
                    insertFunko(db, parseInt(num), (nome.trim() === '') ? '???' : nome.replace('"', '\'').trim(), url, subCategoria.trim(), (ano === '') ? '???' : ano)
                }
            }
        }
    });

    // if (!teste){
    //     db.collection('ItemTipo').updateOne({
    //         tipo: 'Funko Pop!'
    //     },
    //     {
    //         $push: {
    //             categorias: {
    //                 nome: categoria
    //             }
    //         }
    //     })
    // }

    console.log('done:', arrayCheck.length)
}

const formatUrlImage = (url) => {
    url = url.replace(url.match(/\/revision.*\/.*$/)[0], '');
    return url
}

const mainArticleTable = async (db) => {
    const content = await fetchData(`https://funko.fandom.com/wiki/Pop!_Wreck-It_Ralph`);
    const $ = cheerio.load(content);

    let numAntigo = 0;
    console.log($('.article-table tbody tr').length);
    let arrayCheck = []
    $('.article-table tbody tr').each(function (i, elem) {
        if (i > 5) {
            let nome = $(this).add('td')['3'].children[0].data.replace('"', '\'')
            let url = ''
            let num = $(this).add('td')['1'].children[0].data.replace('#', '').replace('\n', '')
            let subCategoria = 'Ralph Breaks the Internet';

            if ($(this).add('img')['1'] && $(this).add('img')['1'].attribs['data-src']) {
                url = formatUrlImage($(this).add('img')['1'].attribs['data-src']);
            } else if ($(this).add('img')['1'] && $(this).add('img')['1'].attribs['src']) {
                url = formatUrlImage($(this).add('img')['1'].attribs['src']);
            } else {
                url = 'noimage.png'
            }

            if (!isNaN(parseInt(num))) {
                arrayCheck.push(num)
                if (teste){
                    console.log(parseInt(num), nome.replace('"', '\'').trim(), url, subCategoria.trim(), '???');
                } else {
                    insertFunko(db, parseInt(num), nome.replace('"', '\'').trim(), url, subCategoria.trim(), '???')
                }
            }
        }
    });

    // if (!teste){
    //     db.collection('ItemTipo').updateOne({
    //         tipo: 'Funko Pop!'
    //     },
    //     {
    //         $push: {
    //             categorias: {
    //                 nome: categoria
    //             }
    //         }
    //     })
    // }

    console.log('done:', arrayCheck.length)
}

function insertFunko(db, num, nome, url, subCategoria, ano) {
    db.collection('Item').insertOne({
        'tipo': 'Funko Pop!',
        'numeracao': parseInt(num),
        'nome': nome,
        'imagem': url,
        'ano': ano,
        'categoria': categoria,
        'subCategoria': subCategoria,
        'delete': false,
        'status': true
    })
}