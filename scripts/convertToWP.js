require('dotenv').config();

const fs = require('fs');
const axios = require('axios');
const url = 'https://amongoose.com/wp-json/wp/v2/posts';

const Redis = require('ioredis')
const redis = new Redis(process.env.REDIS_URL);
let emails;

const Post = require('../models/Post');

let i = 77;
const loadEmail = async () => {
  
  const post = new Post(emails[i].parsedEmail);
  console.log(`LOADING EMAIL ${i+1}/${emails.length}`);
  fs.appendFileSync('output.txt', `LOADING EMAIL ${i+1}/${emails.length} (${post._frontmatter.title})\n`);

  await axios({
    method: 'post',
    url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from('webadmin:fxj616af').toString('base64')
    },
    data: {
      title: post._frontmatter.title,
      content: post.html,
      date_gmt: emails[i].parsedEmail.date,
      status: 'publish',
      slug: post.fileName
    },
  });

  console.log(`SUCCESSFULLY LOADED EMAIL ${i+1}/${emails.length}`);
  fs.appendFileSync('output.txt', `SUCCESSFULLY LOADED EMAIL ${i+1}/${emails.length}\n`);
  
  i++;
  loadEmail();
}

async function main () {
  emails = JSON.parse(await redis.get('inbox'));
  await loadEmail();
}

main();