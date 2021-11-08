
const axios = require('axios');
const cheerio = require('cheerio');

async function main () {
    const { data } = await axios.get('https://amongoose.com/posts/2021-11-08-test-post/json', {
        params: {rawJson: true}
    });
    const $ = cheerio.load(data);
    const json = JSON.parse($('#jsonOutput').text());
    console.log(json);
}

main();