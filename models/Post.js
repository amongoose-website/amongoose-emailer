
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const sanitiseFileName = require('sanitize-filename');
const { ParsedMail } = require('mailparser');

// Import util
const Logger = require('../util/Logger');

// Import config
const { assetsPath, postsPath, gitRepoPath, emailContentFilter } = require('../config');


class Post {
    /**
     * Create a new post
     * @param {ParsedMail} parsedEmail Email object from Mail Parser
     */
    constructor(parsedEmail) {
        // Create email model from Email
        this.email = parsedEmail;

        // Assign filename in format: 2022-03-03-SUBJECT-HERE.md
        this._DATE = moment(this.email.date).format('YYYY-MM-DD');
        this._SUBJECT = sanitiseFileName(
            this.email.subject
                .replace(/\s+/g, '-')
                .replace(/'|"/g, '')
                .toLowerCase()
        );
        this.fileName = `${this._DATE}-${this._SUBJECT}`;
        this.fileExt = '.md';

        const groups = this.email.to.value[0].address
            .split('@')[1]
            .split('.')[0];

        // Create the frontmatter object
        this._frontmatter = {
            templateKey: 'post-page',
            title: this.email.subject.replace('Fwd: ', ''),
            author: 'Anthony Mongoose',
            tags: null,
            date: `${moment(this.email.date).format('YYYY-MM-DDTHH:MM:SS.SSS')}Z`,
            groups,
            attachments: this.email.attachments.map(attachment => {
                const extname = path.extname(attachment.filename);
                return {
                    file: `/assets/${this.fileName}/${attachment.filename}`,
                    fileName: attachment.filename.replace(extname, '')
                }
            })
        };
    }

    /**
     * Render HTML
     * Fixes Image tag source paths
     */
    get html() {
        let neue = this.email.html;
        for (let filter of emailContentFilter) {
            neue.replaceAll(filter, '');
        }

        const $ = cheerio.load(neue);
        
        // Sanitise forwards
        $('.gmail_attr').each((_i, el) => {
            $('br').first().remove();
            $('br').first().remove();
            $('br').last().remove();
            $('br').last().remove();
            $(el).remove();
        });
        
        return $.html();
    }

    /**
     * Render markdown with YAML frontmatter
     */
    get markdown() {
        const keys = Object.keys(this._frontmatter);

        let markdownString = '---\n';
        for (let key of keys) {
            if (key !== 'attachments') {
                if (typeof this._frontmatter[key] === 'string') {
                    markdownString += `${key}: '${this._frontmatter[key]}'\n`
                } else {
                    markdownString += `${key}: ${this._frontmatter[key]}\n`;
                }
            } else {
                markdownString += 'attachments:\n';
                for (let attachment of this._frontmatter.attachments) {
                    markdownString += `  - ${JSON.stringify(attachment)}\n`
                }
            }
        }
        markdownString += '---\n';
        markdownString += this.html;

        return markdownString;
    }

    /**
     * Save attachments from email to the output
     * assets folder of main website.
     */
    saveAssets() {
        // Copy attachment from recieved attachment folder
        // to output folder
        for (let attachment of this.email.attachments) {
            // Ensure attachment still exists
            if (!attachment.content) 
                return Logger.error('Attachment deleted', `Attachment ${atachment.filename} was deleted.`);
            
            let newFilePath = `${assetsPath}/${this.fileName}/${attachment.filename}`;
            try {
                // Ensure Directory exists
                if (!fs.existsSync(path.dirname(newFilePath))) {
                    fs.mkdirSync(path.dirname(newFilePath));
                }
                // Copy file
                fs.writeFileSync(newFilePath, attachment.content);
            } catch(error) {
                Logger.error('Error copying attachment', error);
            }
        }
    }

    /**
     * Saves post as a markdown file
     */
    saveMarkdown() {
        const filePath = path.join(postsPath, `${this.fileName}${this.fileExt}`);
        
        fs.writeFileSync(filePath, this.markdown);
    }

    /**
     * Saves all files, commits and pushes to repository
     */
    publish() {
        this.saveAssets();
        this.saveMarkdown();

        exec(`/usr/bin/git pull origin master && /usr/bin/git add . && /usr/bin/git commit -m "Create Blog Posts “${this.fileName}”" && /usr/bin/git push origin master`,
            { cwd: gitRepoPath },
            error => {
                if (error) Logger.error('Git command failed', error);
            }    
        );
    }

    /**
     * Sends a post to the website (going live).
     * @returns {Boolean} Whether going live was successful
     */
    goLive() {
        try {
            this.publish();
            Logger.success('Published post', `Published ${this._frontmatter.title}`);
            return true;
        } catch (error) {
            Logger.error('Error publishing post', error);
            return false;
        }
    }
}

module.exports = Post;
