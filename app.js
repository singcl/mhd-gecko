
const request = require('superagent')
const cheerio = require('cheerio')
const fs = require('fs-extra')
const path = require('path')

let homeURL = 'http://www.mmjpg.com/tag/meitui/'
let desDir = 'dest'

/**
 * 底层基本函数：随机产生[min, max]区间的整数
 * @param  {Number} min     最小整数
 * @param  {Numer} max      最大整数
 * @return {Number}         最终输出的随机整数
 */
function rInt(min, max) {
	let gap = max - min
	return Math.floor(min + Math.random() * (gap + 1))
}

/**
 * 获取图集的URL
 *
 * @async
 * @function getUrl
 * @param {string} url - The URL to download from.
 * @return {Promise<array>} The data from the URL.
 */
async function getUrl(url) {
    let linkArr = []
    for (let i = 1; i <= 10; i++) {
        const res = await request.get(url + i)
        const $ = cheerio.load(res.text)
        $('.pic li').each(function (i, elem) {
            let link = $(this).find('a').attr('href')
            linkArr.push(link)
        })
    }
    return linkArr
}

/**
 * 获取图集中的图片
 *
 * @async
 * @function getPic
 * @param {String} url 图集URL
 */
async function getPic(url) {
    const res = await request.get(url)
    const $ = cheerio.load(res.text)
    // 以图集名称来分目录
    const dir = $('.article h2').text()
    try {
        console.log(`创建文件夹:${dir}`)
        await fs.mkdir(path.join(__dirname, desDir))
        await fs.mkdir(path.join(__dirname, desDir, dir))
    } catch(e) {
        if (e && e.code === 'EEXIST') {
            console.log('目录已存在：', e.path)
        } else {
            console.error(e)
        }
    }
    const pageCount = parseInt($('#page .ch.all').prev().text())
    for (let i = 1; i <= pageCount; i++) {
        let pageUrl = url + '/' + i
        const data = await request.get(pageUrl)
        const _$ = cheerio.load(data.text)
        // 获取图片的真实地址
        const imgUrl = _$('#content img').attr('src')
        download(dir, imgUrl)
        await sleep(rInt(1000, 5000))
    }
}

/**
 * 图片下载
 *
 * @param {String} 图片要保存的目录
 * @param {String} 要下载的图片路径
 */
function download(dir, imgUrl) {
    console.log(`正在下载: ${imgUrl}`)
    const filename = imgUrl.split('/').pop()
    const writeStream = fs.createWriteStream(path.join(__dirname, desDir, dir, filename))
    // writeStream 错误捕获
    writeStream.on('error', function(err) {
        console.log('文件生成失败！相关失败信息：', err)
    })
    // writeStream 完成捕获
    writeStream.on('finish', function() {
        console.log(`下载完成: ${imgUrl}`)
    })
    const req = request.get(imgUrl).set({ 'Referer': 'http://www.mmjpg.com' })
    req.pipe(writeStream)
}

/**
 * sleep函数
 *
 * @param {Number} time - 指定毫秒
 * @return {Promise<any>}
 */
function sleep(time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve()
        }, time)
    })
}

/**
 * 初始化函数
 *
 * @async
 * @function init
 */
async function init(){
    let urls = await getUrl(homeURL)
    console.log('图片总数：', urls.length)
    for (let url of urls) {
        await getPic(url)
    }
}

// 启动
init()
